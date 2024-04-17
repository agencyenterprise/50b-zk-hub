import dotenv from 'dotenv';

dotenv.config();

export default {
  PORT: process.env.PORT || 3000,
  SECRET: process.env.SECRET || 'secret',
  MONGO_URL: process.env.MONGO_URL,

  OWNER_PRIVATE_KEY: process.env.OWNER_PRIVATE_KEY,
  RPC_URL: process.env.RPC_URL,
  ESCROW_ADDRESS: process.env.ESCROW_ADDRESS,
  TOKEN_ADDRESS: process.env.TOKEN_ADDRESS,
  
  CONSTRAINT_PRICE: process.env.CONSTRAINT_PRICE,
}