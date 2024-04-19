import express from 'express';
import { ethers } from "ethers";
import config from '../config';

export const sendTokensController = async (req: express.Request, res: express.Response) => {
  try {
    const { walletAddress } = req.body

    if (!walletAddress) {
      return res.sendStatus(400)
    }

    const txHash = await sendTokens(walletAddress)

    return res.status(200).json({ txHash })
  } catch (error) {
    console.error(error)
    res.sendStatus(500)
  }
}

const sendTokens = async (to: string): Promise<string> => {
  const sendTokenFunctionInterface = new ethers.Interface(["function transfer(address to, uint256 value)"]);

  const provider = new ethers.JsonRpcProvider(config.RPC_URL)
  const wallet = new ethers.Wallet(config.OWNER_PRIVATE_KEY, provider);
  const tokenContract = new ethers.Contract(config.TOKEN_ADDRESS, sendTokenFunctionInterface, wallet);

  const tx = await tokenContract.transfer(to, "60000000000000000000");
  return tx.hash
}