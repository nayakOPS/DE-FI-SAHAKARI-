import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import FundingPoolABI from '../abis/FundingPool.json';
import ERC20ABI from '../abis/IERC20.json';

const contractAddress = "0x766De27627746dD5e451d521C8b6207f72876C09";
const usdcAddress = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";

export const useFundingPool = (signer, signerAddress) => {
  const [contract, setContract] = useState(null);
  const [totalEth, setTotalEth] = useState(null);
  const [totalUsdc, setTotalUsdc] = useState(null);

  useEffect(() => {
    if (signer) {
      const fundingPoolContract = new ethers.Contract(
        contractAddress,
        FundingPoolABI.abi,
        signer
      );
      setContract(fundingPoolContract);
    }
  }, [signer]);

  const getUSDCBalance = async (account) => {
    try {
      if (!contract) return;
      const balance = await contract.getUSDCBalance(account);
      return balance;
    } catch (error) {
      console.error('Error getting USDC balance:', error);
      throw error;
    }
  };

  const getEthBalance = async (account) => {
    try {
      if (!contract) return;
      const balance = await contract.getEthBalance(account);
      return balance;
    } catch (error) {
      console.error('Error getting ETH balance:', error);
      throw error;
    }
  };

  const approveUSDC = async (spender, amount) => {
    try {
      const usdcContract = new ethers.Contract(usdcAddress, ERC20ABI.abi, signer);
      const tx = await usdcContract.approve(spender, ethers.utils.parseUnits(amount, 6));
      await tx.wait();
      console.log('USDC Approval successful:', tx);
    } catch (error) {
      console.error('Error approving USDC:', error);
      throw error;
    }
  };

  const depositUSDC = async (amount) => {
    try {
      if (!contract || !signerAddress) {
        throw new Error('Contract or signer address not available');
      }

      const usdcContract = new ethers.Contract(usdcAddress, ERC20ABI.abi, signer);
      const allowance = await usdcContract.allowance(signerAddress, contractAddress);

      // Check if allowance is sufficient
      if (allowance.lt(ethers.utils.parseUnits(amount, 6))) {
        await approveUSDC(contractAddress, amount);
      }

      const parsedAmount = ethers.utils.parseUnits(amount, 6); // Convert amount to string and then parse
      const tx = await contract.depositUSDC(parsedAmount);
      await tx.wait();
      console.log('USDC Deposit successful:', tx);
    } catch (error) {
      console.error('USDC Deposit Error:', error);
      throw error;
    }
  };

  const requestLoan = async (amount) => {
    try {
      if (!contract || !signerAddress) {
        throw new Error('Contract or signer address not available');
      }

      const parsedAmount = ethers.utils.parseUnits(amount, 6); // Convert amount to string and then parse
      const tx = await contract.requestLoan(parsedAmount);
      await tx.wait();
      console.log('Loan request successful:', tx);
    } catch (error) {
      console.error('Loan request error:', error);
      throw error;
    }
  };

  const approveLoan = async (loanId) => {
    try {
      if (!contract) {
        throw new Error('Contract not available');
      }

      const tx = await contract.approveLoan(loanId);
      await tx.wait();
      console.log('Loan approval successful:', tx);
    } catch (error) {
      console.error('Loan approval error:', error);
      throw error;
    }
  };

  const fetchTotalDeposits = async () => {
    try {
      const ethDeposits = await contract.totalEthDeposits();
      const usdcDeposits = await contract.totalUsdcDeposits();

      // console.log("ETH Deposits Raw:", ethDeposits);
      // console.log("USDC Deposits Raw:", usdcDeposits);

      if (!ethDeposits || !usdcDeposits) {
        throw new Error("Undefined deposit values");
      }

      setTotalEth(ethers.utils.formatEther(ethDeposits));
      setTotalUsdc(ethers.utils.formatUnits(usdcDeposits, 6));
    } catch (error) {
      console.error("Error fetching total deposits:", error);
    }
  };

  return {
    getUSDCBalance,
    getEthBalance,
    depositUSDC,
    requestLoan,
    approveLoan,
    fetchTotalDeposits,
    totalEth,
    totalUsdc
  };
};
