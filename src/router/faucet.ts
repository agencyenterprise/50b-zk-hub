import { sendTokensController } from '../controllers/faucet';
import express from 'express';

export default (router: express.Router) => {
  router.post('/faucet', sendTokensController);
}