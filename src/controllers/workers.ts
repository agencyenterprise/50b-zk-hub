import express from 'express';

import { createWorker, getWorkerBySigningPublicKey } from '../db/worker';

export const registerWorkerController = async (req: express.Request, res: express.Response) => {
  try {
    const { wallet, signingPublicKey, url } = req.body;

    if (!wallet || !signingPublicKey || !url) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const existingWorker = await getWorkerBySigningPublicKey(signingPublicKey);

    if (existingWorker) {
      return res.status(400).json({ error: 'Worker already exists' });
    }

    const worker = await createWorker({ wallet, signingPublicKey, url });
    
    return res.json(worker).status(200);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
}