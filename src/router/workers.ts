import express from 'express';

import { registerWorkerController } from '../controllers/workers';

export default (router: express.Router) => {
  router.post('/workers/register', registerWorkerController);
}