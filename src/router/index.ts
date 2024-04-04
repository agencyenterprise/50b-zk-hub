import express from 'express';

import authentication from './authentication';
import workers from './workers';
import clients from './clients';
import jobs from './jobs';

const router = express.Router();

export default (): express.Router => {
  authentication(router);
  workers(router);
  clients(router);
  jobs(router);

  return router;
}

