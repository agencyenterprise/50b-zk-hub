import express from 'express';
import { v4 as uuidv4 } from 'uuid';

import { getClientById } from '../db/client';
import { Job, JobStatus, createJob, getJobById, updateJobById } from '../db/job';
import { Worker, WorkerModel, WorkerStatus, getWorkerById, updateWorkerById } from '../db/worker';

import { base64ToFile } from '../helpers/base64';
import { getEscrowBalance, lockFunds, payWorker } from '../helpers/blockchain';
import { deleteFile } from '../helpers/files';

const snarkjs = require('snarkjs');

export const createJobController = async (req: express.Request, res: express.Response) => {
  try {
    const { r1csScript, clientId } = req.body;

    if (!r1csScript) {
      return res.sendStatus(400);
    }

    const client = await getClientById(clientId);
    
    if (!client) {
      return res.sendStatus(404);
    }

    const r1csFilePath = `temp/${uuidv4()}.r1cs`;
    await base64ToFile(r1csScript, r1csFilePath);
    const circuitInfo = await snarkjs.r1cs.info(r1csFilePath);

    if (circuitInfo.nConstraints > 10000) {
      return res.status(400).json({ error: 'Too many constraints' });
    }
    
    const amount = circuitInfo.nConstraints as number * Number(process.env.CONSTRAINT_PRICE);   
    const clientBalance = await getEscrowBalance(client.paymentPublicKey);

    if (clientBalance < amount) {
      return res.status(400).json({ error: 'Insufficient funds' });
    }

    const worker = await selectWorker();

    if (!worker) {
      return res.status(400).json({ error: 'No available workers' });
    }

    const job = await createJob({ client: clientId, worker });

    job.numberOfConstraints = circuitInfo.nConstraints;
    job.r1csScript = r1csScript;
    await job.save();

    worker.status = WorkerStatus.SELECTED;
    await worker.save();

    deleteFile(r1csFilePath);

    await lockFunds(client.paymentPublicKey, amount);

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

    if (!job || !job.worker) {
      return res.sendStatus(404);
    }

    if (job.status !== JobStatus.PROCESSING) {
      return res.sendStatus(400)
    }

    const client = await getClientById(job.client._id);
    const worker = await getWorkerById(job.worker._id);
    const amount = job.numberOfConstraints as number * Number(process.env.CONSTRAINT_PRICE);

    await payWorker(client.paymentPublicKey, worker.wallet, amount);

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

export const getJobController = async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const job = await getJobById(id as any);

    if (!job) {
      return res.sendStatus(404);
    }

    return res.status(200).json(job);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
}

const selectWorker = async (): Promise<Worker | null | undefined> => {
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