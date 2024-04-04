import express from 'express';

import { createJobController, informInputsController } from '../controllers/jobs';

export default (router: express.Router) => {
  router.post('/jobs', createJobController);
  router.post('/jobs/informInputs', informInputsController);
}