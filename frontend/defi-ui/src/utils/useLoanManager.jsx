import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import LoanManagerABI from '../abis/LoanManager.json';

const loanManagerAddress = '0x8eDBE0b59d7e3Ae967544d7C182cB090324d69c1';

export const useLoanManager = (signer) => {
  const [loanManagerContract, setLoanManagerContract] = useState(null);
  const [events, setEvents] = useState({
    LoanRequested: [],
    LoanApproved: [],
    LoanDisbursed: [],
    LoanRepaid: [],
    CollateralReturned: []
  });

  useEffect(() => {
    if (signer) {
      const contract = new ethers.Contract(loanManagerAddress, LoanManagerABI.abi, signer);
      setLoanManagerContract(contract);

      const handleLoanRequest = (borrower, amount, ethCollateral, repaymentAmount) => {
        setEvents(preEvents => ({
          ...preEvents,
          LoanRequested: [...preEvents.LoanRequested, { borrower, amount, ethCollateral, repaymentAmount }]
        }))
      }
      const handleLoanApprove = (borrower, loanIndex) => {
        setEvents(preEvents => ({
          ...preEvents,
          LoanApproved: [...preEvents.LoanApproved, { borrower, loanIndex }]
        }))
      }

      const handleLoanDisbursed = (borrower, loanIndex, amount) => {
        setEvents(preEvents => ({
          ...preEvents,
          LoanDisbursed: [...preEvents.LoanDisbursed, { borrower, loanIndex, amount }]
        }))
      }

      const handleLoanRepaid = (borrower, loanIndex, amount) => {
        setEvents(preEvents => ({
          ...preEvents,
          LoanRepaid: [...preEvents.LoanRepaid, { borrower, loanIndex, amount }]
        }))
      }

      const handleCollateralReturned = (borrower, loanIndex, amount) => {
        setEvents(preEvents => ({
          ...preEvents,
          CollateralReturned: [...preEvents.CollateralReturned, { borrower, loanIndex, amount }]
        }))
      }

      if (contract) {
        contract.on("LoanRequested", handleLoanRequest);
        contract.on("LoanApproved", handleLoanApprove);
        contract.on("LoanDisbursed", handleLoanDisbursed);
        contract.on("LoanRepaid", handleLoanRepaid);
        contract.on("CollateralReturned", handleCollateralReturned);
      }
      return () => {
        if (contract) {
          contract.off("LoanRequested", handleLoanRequest);
          contract.off("LoanApproved", handleLoanApprove);
          contract.off("LoanDisbursed", handleLoanDisbursed);
          contract.off("LoanRepaid", handleLoanRepaid);
          contract.off("CollateralReturned", handleCollateralReturned);
        }
      }
    }
  }, [signer]);

  const calculateEthCollateral = async (usdcAmount) => {
    if (!loanManagerContract) throw new Error('Loan manager contract not initialized');

    try {
      const collateralInWei = await loanManagerContract.calculateEthCollateral(usdcAmount);
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
    if (!loanManagerContract) throw new Error('Loan manager contract not initialized');
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

  const repayLoan = async (borrower, loanIndex, amount) => {
    if (!loanManagerContract) throw new Error('Loan manager contract not initialized');
    try {
      const tx = await loanManagerContract.repayLoan(borrower, loanIndex, amount);
      await tx.wait();
      console.log(`Loan repaid successfully for borrower ${borrower} at index ${loanIndex}`);
      return tx.hash;
    } catch (error) {
      console.error('Failed to repay loan:', error);
      throw error;
    }
  };

  const returnCollateral = async (borrower, loanIndex) => {
    if (!loanManagerContract) throw new Error('Loan manager contract not initialized');
    try {
      const tx = await loanManagerContract.returnCollateral(borrower, loanIndex, {
        gasLimit: 300000
      });
      // await tx.wait();
      console.log(`Collateral returned successfully for borrower ${borrower} at index ${loanIndex}, ${tx.hash}`);
      // return tx.hash;
    } catch (error) {
      console.error('Failed to return collateral:', error);
      throw error;
    }
  };

  const hasRepaidLoans = async (borrower) => {
    if (!loanManagerContract) throw new Error('Loan manager contract not initialized');
    try {
      const result = await loanManagerContract.hasRepaidLoans(borrower);
      return result;
    } catch (error) {
      console.error('Failed to check if loans are repaid:', error);
      throw error;
    }
  };

  const setLoanAsRepaid = async (borrower, loanIndex) => {
    if (!loanManagerContract) throw new Error('Loan manager contract not initialized');
    try {
      const tx = await loanManagerContract.setLoanAsRepaid(borrower, loanIndex);
      await tx.wait();
      console.log(`Loan set as repaid for borrower ${borrower} at index ${loanIndex}`);
      return tx.hash;
    } catch (error) {
      console.error('Failed to set loan as repaid:', error);
      throw error;
    }
  };

  const setEthToUsdcRate = async () => {
    if (!loanManagerContract) throw new Error('Loan manager contract not initialized');
    try {
      const tx = await loanManagerContract.setEthToUsdcRate();
      await tx.wait();
      console.log('ETH to USDC rate set successfully');
      return tx.hash;
    } catch (error) {
      console.error('Failed to set ETH to USDC rate:', error);
      throw error;
    }
  };

  return {
    calculateEthCollateral,
    requestLoan,
    getLoans,
    approveLoan,
    disburseLoan,
    repayLoan,
    returnCollateral,
    hasRepaidLoans,
    setLoanAsRepaid,
    setEthToUsdcRate,
    loanManagerContract,
    events
  };
};
