import { getClientByApiKey } from '../db/client';
import { JobStatus, createJob, getJobById, updateJobById } from '../db/job';
import { Worker, WorkerModel } from '../db/worker';
import express from 'express';
import shelljs from "shelljs";

const snarkjs = require('snarkjs')
const fs = require("fs");

export const createJobController = async (req: express.Request, res: express.Response) => {
  try {
    const { circomScript, clientId } = req.body;

    if (!circomScript) {
      return res.sendStatus(400);
    }

    const circuitInfo = await snarkjs.r1cs.info('circuit.r1cs')

    const worker = await selectWorker()

    const job = await createJob({
      client: clientId,
      worker,
      numberOfConstraints: 10,
      circomScript
    });

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

export const informInputsController = async (req: express.Request, res: express.Response) => {
  try {
    const { id, inputs } = req.body;

    if (!id || !inputs) {
      return res.sendStatus(400);
    }

    const job = await getJobById(id);

    if (!job) {
      return res.sendStatus(404);
    }

    // if (job.status !== JobStatus.CREATED) {
    //   return res.sendStatus(400)
    // }

    const updatedJobId = await updateJobById(id, { inputs, status: JobStatus.INPUTS_PROVIDED });

    return res.status(200).json({
      id: updatedJobId._id,
      inputs: updatedJobId.inputs,
      status: updatedJobId.status,
    });
  } catch (error) {
    // console.error(error);
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

function base64ToFile(base64String: string, filePath: string) {
  console.log({ base64String, filePath })
  return new Promise((resolve, reject) => {
    const fileBuffer = Buffer.from(base64String, 'base64');
    fs.writeFile(filePath, fileBuffer, (err: any) => {
      if (err) {
        reject(err);
      } else {
        resolve(filePath);
      }
    });
  });
}