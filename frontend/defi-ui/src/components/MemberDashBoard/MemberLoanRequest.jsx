import React, { useState } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '../../utils/Web3Provider';
import { useLoanManager } from '../../utils/useLoanManager';
import { useEthPriceConsumerV3 } from '../../utils/useEthPriceConsumerV3';

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

      const usdcAmount = ethers.utils.parseUnits(amount,8);
      console.log("USDC:",usdcAmount.toString());
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
    <div>
      <h2>Request a Loan</h2>
      <form onSubmit={handleRequestLoan}>
        <div>
          <label>Amount (USDC):</label>
          <input
            type="number"
            value={amount}
            onChange={handleAmountChange}
            required
          />
        </div>
        {ethPrice && (
          <div>
            <p>Latest ETH Price: ${ethers.utils.formatUnits(ethPrice, 8)} USD</p>
          </div>
        )}
        <p>click on calculate eth collateral for calculating eth collateral for {amount}$ USDC</p>
        {ethCollateral && (
          <div>
            <p>Required ETH Collateral: {ethCollateral} ETH</p>
          </div>
        )}
        <button type="button" onClick={fetchEthPrice}>
          Fetch Latest ETH Price
        </button>
        <button type="button" onClick={handleCalculateEthCollateral}>
          Calculate ETH Collateral
        </button>
        <button type="submit">Request Loan</button>
      </form>
    </div>
  );
};

export default MemberLoanRequest;
