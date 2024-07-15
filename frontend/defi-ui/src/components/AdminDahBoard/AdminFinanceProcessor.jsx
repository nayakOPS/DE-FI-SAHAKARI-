import React, { useState } from 'react';
import { useWeb3 } from "../../utils/Web3Provider";
import { useFinanceProcessor } from '../../utils/useFinanceProcessor';

const AdminFinanceProcessor = () => {
  const { signer, account } = useWeb3();
  const [borrowerAddress, setBorrowerAddress] = useState('');
  const [loanIndex, setLoanIndex] = useState('');
  const [repaymentAmount, setRepaymentAmount] = useState('');
  const [ethCollateral, setEthCollateral] = useState('');

  const { accrueInterest, distributeInterest, processLoanApproval, processLoanRepayment, liquidateCollateral } = useFinanceProcessor(signer);

  const handleAccrueInterest = async () => {
    try {
      const txHash = await accrueInterest(account);
      console.log('Accrued interest. Transaction hash:', txHash);
    } catch (error) {
      console.error('Failed to accrue interest:', error);
    }
  };

  const handleDistributeInterest = async () => {
    try {
      const txHash = await distributeInterest();
      console.log('Distributed interest. Transaction hash:', txHash);
    } catch (error) {
      console.error('Failed to distribute interest:', error);
    }
  };

  const handleLoanApproval = async () => {
    try {
      const txHash = await processLoanApproval(borrowerAddress, loanIndex);
      console.log('Loan approval processed. Transaction hash:', txHash);
    } catch (error) {
      console.error('Failed to process loan approval:', error);
    }
  };

  const handleLoanRepayment = async () => {
    try {
      const txHash = await processLoanRepayment(borrowerAddress, loanIndex, repaymentAmount);
      console.log('Loan repayment processed. Transaction hash:', txHash);
    } catch (error) {
      console.error('Failed to process loan repayment:', error);
    }
  };

  const handleLiquidateCollateral = async () => {
    try {
      const txHash = await liquidateCollateral(borrowerAddress, loanIndex);
      console.log('Collateral liquidation processed. Transaction hash:', txHash);
    } catch (error) {
      console.error('Failed to liquidate collateral:', error);
    }
  };

  return (
    <div>
      <h2>Admin Finance Processor</h2>
      <div>
        <button onClick={handleAccrueInterest}>Accrue Interest</button>
        <button onClick={handleDistributeInterest}>Distribute Interest</button>
      </div>
      <div>
        <input type="text" placeholder="Borrower Address" value={borrowerAddress} onChange={(e) => setBorrowerAddress(e.target.value)} />
        <input type="text" placeholder="Loan Index" value={loanIndex} onChange={(e) => setLoanIndex(e.target.value)} />
        <input type="text" placeholder="Repayment Amount" value={repaymentAmount} onChange={(e) => setRepaymentAmount(e.target.value)} />
        <button onClick={handleLoanApproval}>Process Loan Approval</button>
        <button onClick={handleLoanRepayment}>Process Loan Repayment</button>
        <button onClick={handleLiquidateCollateral}>Liquidate Collateral</button>
      </div>
    </div>
  );
}

export default AdminFinanceProcessor;
