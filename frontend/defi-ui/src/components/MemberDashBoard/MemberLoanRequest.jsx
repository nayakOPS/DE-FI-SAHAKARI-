import React, { useState } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '../../utils/Web3Provider';
import { useLoanManager } from '../../utils/useLoanManager';
import { useEthPriceConsumerV3 } from '../../utils/useEthPriceConsumerV3';
import Navigation from '../Navigations';

const MemberLoanRequest = () => {
  const { signer } = useWeb3();
  const { calculateEthCollateral, requestLoan } = useLoanManager(signer);
  const { getLatestPrice } = useEthPriceConsumerV3(signer);

  const [amount, setAmount] = useState('');
  const [ethCollateral, setEthCollateral] = useState('');
  const [ethPrice, setEthPrice] = useState(null);

  const fetchEthPrice = async () => {
    try {
      const price = await getLatestPrice();
      setEthPrice(price);
    } catch (error) {
      console.error('Failed to fetch ETH price:', error);
      alert('Failed to fetch ETH price.');
    }
  };

  const handleAmountChange = async (e) => {
    const value = e.target.value;
    setAmount(value);
    setEthCollateral(''); // Reset ETH collateral when amount changes
  };

  const handleCalculateEthCollateral = async () => {
    try {
      if (!amount) {
        alert('Please enter an amount first.');
        return;
      }

      const usdcAmount = ethers.utils.parseUnits(amount, 8);
      console.log("USDC:", usdcAmount.toString());
      const collateralEth = await calculateEthCollateral(usdcAmount);
      setEthCollateral(collateralEth);
    } catch (error) {
      console.error('Failed to calculate ETH collateral:', error);
      alert('Failed to calculate ETH collateral.');
    }
  };

  const handleRequestLoan = async (e) => {
    e.preventDefault();
    try {
      if (!amount || !ethCollateral) {
        alert('Please calculate ETH collateral first.');
        return;
      }
      const usdcAmount = ethers.utils.parseUnits(amount, 6);
      const ethCollateralBigNumber = ethers.utils.parseEther(ethCollateral);

      const txHash = await requestLoan(usdcAmount, ethCollateralBigNumber);
      alert(`Loan request submitted successfully! Transaction hash: ${txHash}`);
    } catch (error) {
      console.error('Failed to submit loan request:', error);
      alert('Failed to submit loan request.');
    }
  };

  return (
    <div className='w-5/6 m-auto h-screen'>
      <Navigation/>
      <div className='py-4 mt-16'>
        <h2 className='text-3xl text-teal-200 font-bold mb-12'>Request a Loan</h2>
        <form onSubmit={handleRequestLoan}>
          <div className="w-2/5">
            <div>
              <label htmlFor="USDC Amount" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Requested USDC Amount
              </label>
              <input
                id="usdc"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="USDC Amount"
                type="number"
                value={amount}
                onChange={handleAmountChange}
                required
              />
            </div>
            <button
              className='text-white mt-4 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-gray-900 dark:hover:bg-blue-700 dark:focus:ring-blue-800'
              type="button"
              onClick={handleCalculateEthCollateral}>
              Calculate ETH Collateral
            </button>

            <div className='mt-4'>
              <label htmlFor="company" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Required ETH Collateral
              </label>
              <input
                type="text"
                id="company"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="ETH"
                value={ethCollateral}
                required
                disabled
              />
            </div>
          </div>
          <button
            type="submit"
            className="text-white mt-4 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Request Loan
          </button>
        </form>
      </div>
    </div>
  );
};

export default MemberLoanRequest;
