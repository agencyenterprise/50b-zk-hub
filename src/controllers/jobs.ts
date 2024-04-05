import { base64ToFile } from '../helpers/base64';
import { JobStatus, createJob, getJobById, updateJobById } from '../db/job';
import { Worker, WorkerModel } from '../db/worker';
import express from 'express';
import { deleteFile } from '../helpers/files';

const snarkjs = require('snarkjs')

export const createJobController = async (req: express.Request, res: express.Response) => {
  try {
    const { r1csScript, clientId } = req.body;

    if (!r1csScript) {
      return res.sendStatus(400);
    }


    const worker = await selectWorker()
    const job = await createJob({ client: clientId, worker });

    const r1csFilePath = `temp/${job._id}.r1cs`
    await base64ToFile(r1csScript, r1csFilePath)
    const circuitInfo = await snarkjs.r1cs.info(r1csFilePath)

    job.numberOfConstraints = circuitInfo.nConstraints
    await job.save()

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
    const { jobId, witness } = req.body;
    
    if (!jobId || !witness) {
      return res.sendStatus(400);
    }
    
    const job = await getJobById(jobId);
    
    if (!job) {
      return res.sendStatus(404);
    }

    if (job.status !== JobStatus.CREATED) {
      return res.sendStatus(400)
    }

    const updatedJobId = await updateJobById(jobId, { witness, status: JobStatus.WITNESS_PROVIDED });

    return res.status(200).json({
      id: updatedJobId._id,
      witness: updatedJobId.witness,
      status: updatedJobId.status,
    });
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
}

export const informJobCompletedController = async (req: express.Request, res: express.Response) => {
  try {
    const { id, proof } = req.body;

    if (!id || !proof) {
      return res.sendStatus(400);
    }

    const job = await getJobById(id);

    if (!job) {
      return res.sendStatus(404);
    }

    if (job.status !== JobStatus.PROCESSING) {
      return res.sendStatus(400)
    }

    const updatedJobId = await updateJobById(id, { status: JobStatus.COMPLETED, proof });

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