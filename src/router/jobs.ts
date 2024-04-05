import express from 'express';

import { createJobController, informWitnessController } from '../controllers/jobs';
import { isClientOwnerByApiKey, isJobOwnerByApiKey } from '../middlewares';

export default (router: express.Router) => {
  router.post('/jobs', isClientOwnerByApiKey, createJobController);
  router.post('/jobs/informWitness', isJobOwnerByApiKey, informWitnessController);
}