import { ethers } from 'ethers';

const getEscrowContract = () => {
  const RPC_URL = process.env.RPC_URL
  const OWNER_PRIVATE_KEY = process.env.OWNER_PRIVATE_KEY
  const ESCROW_ADDRESS = process.env.ESCROW_ADDRESS
  const ESCROW_ABI = [
    "function balanceOf(address payer) view returns (uint256)",
    "function lock(address payer, uint256 amount)",
    "function pay(address payer, address payee, uint256 amount)"
  ];

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const ownerWallet = new ethers.Wallet(OWNER_PRIVATE_KEY, provider);

  return new ethers.Contract(ESCROW_ADDRESS, ESCROW_ABI, ownerWallet);
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
