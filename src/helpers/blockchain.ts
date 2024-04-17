import { ethers } from 'ethers';
import config from '../config';

const getEscrowContract = () => {
  const ESCROW_ABI = [
    "function balanceOf(address payer) view returns (uint256)",
    "function lock(address payer, uint256 amount)",
    "function pay(address payer, address payee, uint256 amount)"
  ];

  const provider = new ethers.JsonRpcProvider(config.RPC_URL);
  const ownerWallet = new ethers.Wallet(config.OWNER_PRIVATE_KEY, provider);

  return new ethers.Contract(config.ESCROW_ADDRESS, ESCROW_ABI, ownerWallet);
}

export const getEscrowBalance = async (walletAddress: string) => {
  const escrowContract = getEscrowContract();

  const balance = await escrowContract.balanceOf(walletAddress);

  return parseFloat(ethers.formatEther(balance));
}

export const lockFunds = async (clientWalletAddress: string, amount: number) => {
  const escrowContract = getEscrowContract();

  const tx = await escrowContract.lock(clientWalletAddress, ethers.parseEther(amount.toString()));
  await tx.wait();
};

export const payWorker = async (clientWalletAddress: string, workerWalletAddress: string, amount: number) => {
  const escrowContract = getEscrowContract();

  const tx = await escrowContract.pay(clientWalletAddress, workerWalletAddress, ethers.parseEther(amount.toString()));
  await tx.wait();
};
