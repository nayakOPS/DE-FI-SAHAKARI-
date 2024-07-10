import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import LoanManagerABI from '../abis/LoanManager.json';
import { hexToNumber } from 'viem';

export const useLoanManager = (signer) => {
  const [loanManagerContract, setLoanManagerContract] = useState(null);

  useEffect(() => {
    if (signer) {
      const loanManagerAddress = '0x987BeC1be9d98954812D86eef9FB19d8dBe8058B';
      const contract = new ethers.Contract(loanManagerAddress, LoanManagerABI.abi, signer);
      setLoanManagerContract(contract);
    }
  }, [signer]);

  const requestLoan = async (usdcAmount, dueDate, ethCollateral) => {
    if (!loanManagerContract) throw new Error('Contract not initialized');
    console.log("ETH collateral: ",(ethCollateral));
    const tx = await loanManagerContract.requestLoan(usdcAmount, dueDate, ethCollateral);
    await tx.wait();
  };

  return {
    requestLoan,
  };
};

