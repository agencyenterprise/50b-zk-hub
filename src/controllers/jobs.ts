import { base64ToFile } from '../helpers/base64';
import { Job, JobStatus, createJob, getJobById, updateJobById } from '../db/job';
import { Worker, WorkerModel, WorkerStatus, updateWorkerById } from '../db/worker';
import express from 'express';
import { deleteFile } from '../helpers/files';

const snarkjs = require('snarkjs')

export const createJobController = async (req: express.Request, res: express.Response) => {
  try {
    console.log("000000")
    const { r1csScript, clientId } = req.body;

    if (!r1csScript) {
      return res.sendStatus(400);
    }

    console.log("heeyyy")
    const worker = await selectWorker()
    console.log({worker})
    const job = await createJob({ client: clientId, worker });

    const r1csFilePath = `temp/${job._id}.r1cs`
    await base64ToFile(r1csScript, r1csFilePath)
    const circuitInfo = await snarkjs.r1cs.info(r1csFilePath)

    job.numberOfConstraints = circuitInfo.nConstraints
    job.r1csScript = r1csScript
    await job.save()

    worker.status = WorkerStatus.SELECTED
    await worker.save()

    deleteFile(r1csFilePath)

    return res.status(201).json({
      id: job._id,
      status: job.status,
      encryptKey: worker.signingPublicKey,
    });
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
}

export const informWitnessController = async (req: express.Request, res: express.Response) => {
  try {
    const { jobId, witness, aesKey, aesIv } = req.body;

    if (!jobId || !witness || !aesKey || !aesIv) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const job = await getJobById(jobId);

    if (!job) {
      return res.sendStatus(404);
    }

    if (job.status !== JobStatus.CREATED) {
      return res.status(400).json({ error: 'Job is not in CREATED status' })
    }

    const updatedJob = await updateJobById(jobId, {
      witness,
      aesKey,
      aesIv,
      status: JobStatus.WITNESS_PROVIDED,
    });

    informWitnessProvided(updatedJob)

    return res.status(200).json({
      id: updatedJob._id,
      witness: updatedJob.witness,
      status: updatedJob.status,
    });
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
}

export const receiveProofController = async (req: express.Request, res: express.Response) => {
  try {
    const { jobId, proof } = req.body;

    if (!jobId || !proof) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const job = await getJobById(jobId);

    if (!job) {
      return res.sendStatus(404);
    }

    if (job.status !== JobStatus.PROCESSING) {
      return res.sendStatus(400)
    }

    const updatedJobId = await updateJobById(jobId, {
      status: JobStatus.COMPLETED,
      proof
    });

    await updateWorkerById(job.worker._id, { status: WorkerStatus.AVAILABLE })

    return res.status(200).json({
      id: updatedJobId._id,
      status: updatedJobId.status,
    });
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
}

const selectWorker = async (): Promise<Worker> => {
  return await WorkerModel.findOne({ status: 'AVAILABLE' })
}

const informWitnessProvided = async (job: Job) => {
  await job.populate("worker")
  const worker = job.worker as Worker

  fetch(`${worker.url}/witness`, {
    method: 'POST',
    body: JSON.stringify({
      jobId: job._id,
      witness: job.witness,
      aesKey: job.aesKey,
      aesIv: job.aesIv,
      r1cs: job.r1csScript,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  }).then(async (res) => {
    if (res.status === 200) {
      await updateJobById(job._id, { status: JobStatus.PROCESSING })
      await updateWorkerById(worker._id, { status: WorkerStatus.PROCESSING })
    } else {
      await updateJobById(job._id, { status: JobStatus.FAILED })
    }
  }).catch(async (error) => {
    console.log({ error })
    await updateJobById(job._id, { status: JobStatus.FAILED })
  })
}

// const informJobCompleted = async (job: Job) => {
//   await job.populate("client")
//   const client = job.client as Client

//   fetch(`${client.httpEndpoint}/completed`, {
//     method: 'POST',
//     body: JSON.stringify({
//       id: job._id,
//       proof: job.proof,
//     }),
//     headers: {
//       'Content-Type': 'application/json',
//     },
//   })
// }