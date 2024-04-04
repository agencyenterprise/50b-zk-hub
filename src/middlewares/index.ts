import express from 'express';
import { get, merge } from 'lodash';

import { getClientBySessionToken } from 'db/client';

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

    merge(req, { identity: client });

    next();
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
}

export const isOwner = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const { id } = req.params
    const currentClientId = get(req, 'identity._id') as string;

    if (!currentClientId) {
      return res.sendStatus(403);
    }

    if (currentClientId.toString() !== id) {
      return res.sendStatus(403);
    }

    next();
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
}