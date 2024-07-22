import React, { useState } from 'react';
import { useWeb3 } from "../../utils/Web3Provider";
import { useFinanceProcessor } from '../../utils/useFinanceProcessor';
import Navigation from '../Navigations';

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
    <div className="m-auto min-h-screen px-24">
      <Navigation />
      <h1 className="text-3xl text-teal-200 font-bold mb-12">Admin Finance Processor</h1>
      <div className='flex flex-row gap-12 text-center my-8'>
        <div className='flex flex-col w-[50%]'>
          <button className='text-xl mb-2' onClick={handleAccrueInterest}>Accrue Interest</button>
          <p>*manually accrues interest to specific member</p>
        </div>
        <div className='flex flex-col w-[50%]'>
          <button className='text-xl mb-2' onClick={handleDistributeInterest}>Distribute Interest</button>
          <p>*distributes interest to all Members at once</p>
        </div>
      </div>
      <div>
        <p>Borrower Address: </p>
        <input
          type="text"
          placeholder="Borrower Address"
          value={borrowerAddress}
          className="bg-gray-50 mb-2 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
          onChange={(e) => setBorrowerAddress(e.target.value)}
        />
        <p>Loan Index: </p>
        <input
          type="text"
          placeholder="Loan Index"
          value={loanIndex}
          className="bg-gray-50 mb-2 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
          onChange={(e) => setLoanIndex(e.target.value)}
        />
        <div className='flex flex-row gap-y-4 gap-12 text-center items-center my-4 pb-10'>
          <div className='flex flex-col gap-4 w-[50%]'>
            <button className='text-xl mb-2' onClick={handleLoanApproval}>Process Loan Approval</button>
            <p>*approves & disburse loan at once</p>
          </div>
          <div className='flex flex-col w-[50%]'>
            <button className='text-xl mb-2' onClick={handleLiquidateCollateral}>Liquidate Collateral</button>
            <p>*liquidates the user loan when not paid on time</p>
            <p className='text-sm'>(ETH will be swapped with USDC & stored in funding pool)</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminFinanceProcessor;
