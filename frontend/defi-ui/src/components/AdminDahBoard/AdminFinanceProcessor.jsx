import React, { useState } from 'react';
import { useWeb3 } from "../../utils/Web3Provider";
import { useFinanceProcessor } from '../../utils/useFinanceProcessor';

const AdminFinanceProcessor = () => {
  const { signer, account } = useWeb3();
  const [borrowerAddress, setBorrowerAddress] = useState('');
  const [loanIndex, setLoanIndex] = useState('');
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
      <br />
      <div>
        <p>Click on Accrue Interest To manually accrue interest to specific member</p>
        <button onClick={handleAccrueInterest}>Accrue Interest</button>
        <br />
        <br />
        <p>Click on Distribute Interest To accrue interest to all Member at once</p>
        <button onClick={handleDistributeInterest}>Distribute Interest</button>
      </div>
      <br />
      <div>
        <p>Borrower Address: </p>
        <input type="text" placeholder="Borrower Address" value={borrowerAddress} onChange={(e) => setBorrowerAddress(e.target.value)} />
        <br />
        <br />
        <p>Loan Index: </p>
        <input type="text" placeholder="Loan Index" value={loanIndex} onChange={(e) => setLoanIndex(e.target.value)} />
        <br />
        <br />
        <p>Click on Process Loan Approval to approve the loand and disburse loan at once </p>
        <button onClick={handleLoanApproval}>Process Loan Approval</button>
          <br />
          <br />
        <p>Click on Liquidate Collateral for liquidating the user loan when not paid on time , eth will be swapped with usdc and stored in funding pool</p>
        <button onClick={handleLiquidateCollateral}>Liquidate Collateral</button>
      </div>
    </div>
  );
}

export default AdminFinanceProcessor;
