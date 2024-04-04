import express from 'express';

import { getClientByApiKey, getClientById, getClientBySessionToken } from '../db/client';
import { decrypt } from '../helpers/index';

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
      return res.sendStatus(400);
    }

    const client = await getClientById(clientId).select('+authentication.apiKey');

    const decryptedApiKey = decrypt(client.authentication.apiKey, 'secret')
    
    if (apiKey !== decryptedApiKey) {
      return res.sendStatus(401);
    }

    next();
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
}