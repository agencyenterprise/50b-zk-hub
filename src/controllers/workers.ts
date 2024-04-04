import express from 'express';

import { createWorker, getWorkerBySigningPublicKey } from '../db/worker';

export const createWorkerController = async (req: express.Request, res: express.Response) => {
  try {
    const { paymentPublicKey, signingPublicKey, httpEndpoint } = req.body;

    if (!paymentPublicKey || !signingPublicKey || !httpEndpoint) {
      return res.sendStatus(400);
    }

    const existingWorker = await getWorkerBySigningPublicKey(signingPublicKey);

    if (existingWorker) {
      return res.sendStatus(400)
    }

    const worker = await createWorker({ paymentPublicKey, signingPublicKey, httpEndpoint });
    
    return res.status(201).json(worker).end();
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
}