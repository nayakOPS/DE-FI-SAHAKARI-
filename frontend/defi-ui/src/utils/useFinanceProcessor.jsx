import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import FinanceProcessorABI from '../abis/FinanceProcessor.json';

const financeProcessorAddress = '0x89B20bAd44365e141824D584952fBf8DA143F104'; 

export const useFinanceProcessor = (signer) => {
  const [financeProcessorContract, setFinanceProcessorContract] = useState(null);

  useEffect(() => {
    if (signer) {
      const contract = new ethers.Contract(financeProcessorAddress, FinanceProcessorABI.abi, signer);
      setFinanceProcessorContract(contract);
    }
  }, [signer]);

  const accrueInterest = async (memberAddress) => {
    if (!financeProcessorContract) throw new Error('FinanceProcessor contract not initialized');

    try {
      const tx = await financeProcessorContract.accrueInterest(memberAddress);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Failed to accrue interest:', error);
      throw error;
    }
  };

  const distributeInterest = async () => {
    if (!financeProcessorContract) throw new Error('FinanceProcessor contract not initialized');

    try {
      const tx = await financeProcessorContract.distributeInterest();
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Failed to distribute interest:', error);
      throw error;
    }
  };

  const processLoanApproval = async (borrower, loanIndex) => {
    if (!financeProcessorContract) throw new Error('FinanceProcessor contract not initialized');

    try {
      const tx = await financeProcessorContract.processLoanApproval(borrower, loanIndex);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Failed to process loan approval:', error);
      throw error;
    }
  };

  const processLoanRepayment = async (borrower, loanIndex, amount) => {
    if (!financeProcessorContract) throw new Error('FinanceProcessor contract not initialized');

    try {
      const tx = await financeProcessorContract.processLoanRepayment(borrower, loanIndex, amount);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Failed to process loan repayment:', error);
      throw error;
    }
  };

  const liquidateCollateral = async (borrower, loanIndex) => {
    if (!financeProcessorContract) throw new Error('FinanceProcessor contract not initialized');

    try {
      const tx = await financeProcessorContract.liquidateCollateral(borrower, loanIndex);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Failed to liquidate collateral:', error);
      throw error;
    }
  };

  const getUSDCInterestAccrued = async (memberAddress) => {
    if (!financeProcessorContract) throw new Error('FinanceProcessor contract not initialized');

    try {
      const interestAccrued = await financeProcessorContract.getUSDCInterestAccrued(memberAddress);
      return interestAccrued;
    } catch (error) {
      console.error('Failed to get USDC interest accrued:', error);
      throw error;
    }
  };

  return {
    accrueInterest,
    distributeInterest,
    processLoanApproval,
    processLoanRepayment,
    liquidateCollateral,
    getUSDCInterestAccrued,
    financeProcessorContract,
  };
};