import express from 'express';

import { getClientById, getClientBySessionToken } from '../db/client';
import { decrypt } from '../helpers/index';
import { getJobById } from '../db/job';
import config from '../config/index';

export const isAuthenticated = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const sessionToken = req.cookies['SESSION_TOKEN'];

    if (!sessionToken) {
      return res.sendStatus(403);
    }

    const client = await getClientBySessionToken(sessionToken);

    if (!client) {
      return res.sendStatus(401);
    }

    next();
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
}

export const isClientOwnerByApiKey = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const apiKey = req.headers['api_key'] as string;
    const { clientId } = req.body;

    if (!apiKey || !clientId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const client = await getClientById(clientId).select('+authentication.apiKey');

    const decryptedApiKey = decrypt(client.authentication.apiKey, config.SECRET)

    if (apiKey !== decryptedApiKey) {
      return res.sendStatus(401);
    }

    next();
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
}

export const isJobOwnerByApiKey = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const apiKey = req.headers['api_key'] as string;
    const { jobId } = req.body;

    if (!apiKey || !jobId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const job = await getJobById(jobId)
    const client = await getClientById(job.client.toString()).select('+authentication.apiKey');

    const decryptedApiKey = decrypt(client.authentication.apiKey, config.SECRET)
    
    if (apiKey !== decryptedApiKey) {
      return res.sendStatus(401);
    }

    next();
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
}