import express from 'express';

import authentication from './authentication';
import workers from './workers';
import jobs from './jobs';

const router = express.Router();

export default (): express.Router => {
  authentication(router);
  workers(router);
  jobs(router);

  return router;
}

