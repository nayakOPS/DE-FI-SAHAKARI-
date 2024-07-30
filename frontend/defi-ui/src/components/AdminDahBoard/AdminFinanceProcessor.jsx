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
    <div className='bg-black bg-opacity-90'>
      < div className="m-auto min-h-screen px-24" >
        <Navigation />
        {
          account === "0x73fE2b14b3a53778F3F1bd2b243440995C4B68a4" || account ==="0xd5bd2adc0cb6c90e8803fae0e42cda55f9fd4ee7" ?
            <>
              <h1 className="text-3xl font-bold mb-12">Admin Finance Processor</h1>
              <h2 className='text-xl no-underline mb-4 text-slate-100 font-bold'>Interest Disburse</h2>
              <div className='flex flex-row gap-12 text-center mb-8 w-2/4'>
                <div className='flex flex-col w-2/4'>
                  <button className='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg  w-full sm:w-auto px-5 py-2 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 text-lg mb-2' onClick={handleAccrueInterest}>Accrue Interest</button>
                  <p className='text-sm italic'>*manually accrues interest to specific member</p>
                </div>
                <div className='flex flex-col w-2/4'>
                  <button className='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg  w-full sm:w-auto px-5 py-2 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 text-lg mb-2' onClick={handleDistributeInterest}>Distribute Interest</button>
                  <p className='text-sm italic'>*distributes interest to all Members at once</p>
                </div>
              </div>
              <h2 className='text-xl no-underline mb-4 text-slate-100 font-bold'>Loan Actions</h2>
              <div>
                <p className='mb-2 text-lg'>Borrower Address</p>
                <input
                  type="text"
                  placeholder="Borrower Address"
                  value={borrowerAddress}
                  className="bg-gray-50 mb-2 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-2/4 p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                  onChange={(e) => setBorrowerAddress(e.target.value)}
                />
                <p className='mb-2 mt-4 text-lg'>Loan Index</p>
                <input
                  type="text"
                  placeholder="Loan Index"
                  value={loanIndex}
                  className="bg-gray-50 mb-2 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-2/4 p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                  onChange={(e) => setLoanIndex(e.target.value)}
                />
                <div className='flex flex-row gap-y-4 gap-12 text-center items-top my-4 pb-10 w-2/4 h-full'>
                  <div className='flex flex-col gap-4 w-2/4'>
                    <button className='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg  w-full sm:w-auto px-5 py-2 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 text-lg mb-2' onClick={handleLoanApproval}>Process Loan Approval</button>
                    <p className='text-sm italic'>*approves & disburse loan at once</p>
                  </div>
                  <div className='flex flex-col w-2/4'>
                    <button className='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg  w-full sm:w-auto px-5 py-2 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 text-lg mb-2' onClick={handleLiquidateCollateral}>Liquidate Collateral</button>
                    <p className='text-sm italic'>*liquidates the user loan when not paid on time</p>
                    <p className='text-sm'>(ETH will be swapped with USDC & stored in funding pool)</p>
                  </div>
                </div>
              </div>
            </>
            : <>Only accessible to admin</>
        }
      </div>
    </div >
  );
}

export default AdminFinanceProcessor;
