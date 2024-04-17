import express from 'express';

import { createJobController, informWitnessController, receiveProofController, getJobController } from '../controllers/jobs';
import { isClientOwnerByApiKey, isJobOwnerByApiKey } from '../middlewares';

export default (router: express.Router) => {
  router.post('/jobs', isClientOwnerByApiKey, createJobController);
  router.post('/jobs/start', isJobOwnerByApiKey, informWitnessController);
  router.post('/jobs/proof', receiveProofController);
  router.get('/jobs/:id', isJobOwnerByApiKey, getJobController);
}