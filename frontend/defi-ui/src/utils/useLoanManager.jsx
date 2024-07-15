import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import LoanManagerABI from '../abis/LoanManager.json';

const loanManagerAddress = '0xCb8e87271F8Bdd5a6CCa5318b2C23c760F5C919C';

export const useLoanManager = (signer) => {
  const [loanManagerContract, setLoanManagerContract] = useState(null);

  useEffect(() => {
    if (signer) {
      const contract = new ethers.Contract(loanManagerAddress, LoanManagerABI.abi, signer);
      setLoanManagerContract(contract);
    }
  }, [signer]);

  const calculateEthCollateral = async (usdcAmount) => {
    if (!loanManagerContract) throw new Error('Loan manager contract not initialized');
    
    try {
      const collateralInWei  = await loanManagerContract.calculateEthCollateral(usdcAmount);
      // convert wei to eth
      const collateralInEth = ethers.utils.formatEther(collateralInWei);
      return collateralInEth;
    } catch (error) {
      console.error('Failed to calculate ETH collateral:', error);
      throw error;
    }
  };

  const requestLoan = async (usdcAmount, ethCollateral) => {
    if (!loanManagerContract) throw new Error('Loan manager contract not initialized');
    
    try {
      const tx = await loanManagerContract.requestLoan(usdcAmount, ethCollateral, {
        value: ethCollateral
      });
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Failed to request loan:', error);
      throw error;
    }
  };

  const getLoans = async (borrower) => {
    if (!loanManagerContract) return [];
    return await loanManagerContract.getLoans(borrower);
  };

  const approveLoan = async (borrower, loanIndex) => {
    if (!loanManagerContract) return;
    return await loanManagerContract.approveLoan(borrower, loanIndex);
  };

  const disburseLoan = async (borrower, loanIndex) => {
    if (!loanManagerContract)  throw new Error('Loan manager contract not initialized');
    // return await loanManagerContract.disburseLoan(borrower, loanIndex);
    try {
      const tx = await loanManagerContract.disburseLoan(borrower, loanIndex);
      await tx.wait();
      console.log(`Loan disbursed successfully for borrower ${borrower} at index ${loanIndex}`);
      return tx.hash;
    } catch (error) {
      console.error('Failed to disburse loan:', error);
      throw error;
    }
  };

  return {
    calculateEthCollateral,
    requestLoan,
    getLoans, 
    approveLoan, 
    disburseLoan,
    loanManagerContract
  };
};
