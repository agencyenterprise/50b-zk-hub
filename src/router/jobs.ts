import express from 'express';

import { createJobController, informInputsController } from '../controllers/jobs';
import { isClientOwnerByApiKey } from '../middlewares';

export default (router: express.Router) => {
  router.post('/jobs', isClientOwnerByApiKey, createJobController);
  router.post('/jobs/informInputs', informInputsController);
}