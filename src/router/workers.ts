import express from 'express';

import { createWorkerController } from '../controllers/workers';

export default (router: express.Router) => {
  router.post('/workers', createWorkerController);
}