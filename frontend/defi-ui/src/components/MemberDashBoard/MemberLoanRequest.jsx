import React, { useState } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '../../utils/Web3Provider';
import { useLoanManager } from '../../utils/useLoanManager';
import { useEthPriceConsumerV3 } from '../../utils/useEthPriceConsumerV3';

const MemberLoanRequest = () => {
  const { signer } = useWeb3();
  const { requestLoan } = useLoanManager(signer);
  const { getLatestPrice } = useEthPriceConsumerV3(signer);

  const [currentETHPrice, setCurrentETHPrice] = useState(0)
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [ethCollateral, setEthCollateral] = useState('');
  const [interestRate, setInterestRate] = useState('');

  const calculateEthCollateral = async (_usdcAmount) => {
    try {
      const ethPrice = await getLatestPrice();
      const usdcAmount = ethers.utils.parseUnits(_usdcAmount, 6);
      // Calculate the required ETH collateral:
    // 1. Multiply the USDC amount by 10^18 to scale it to 18 decimal places (ETH standard)
    // 2. Multiply the scaled USDC amount by 150 to apply a 150% collateralization ratio
    // 3. Divide the result by the current ETH price to convert it to an equivalent ETH value
    // 4. Divide by 100 to adjust the final result to the correct percentage factor
      setCurrentETHPrice(ethers.utils.formatEther(ethPrice));
      const collateral = (usdcAmount.mul(ethers.utils.parseUnits('1', 18)).mul(150)).div(ethPrice).div(100);
      setEthCollateral(ethers.utils.formatEther(collateral));
    } catch (error) {
      console.error(error);
      alert('Failed to calculate ETH collateral.');
    }
  };

  const handleRequestLoan = async (e) => {
    e.preventDefault();
    try {
      const usdcAmount = ethers.utils.parseUnits(amount, 6);
      const dueDateTimestamp = Math.floor(new Date(dueDate).getTime() / 1000); // Convert dueDate to Unix timestamp

      // pass as Big Number
      const ethCollateralBigNumber = ethers.utils.parseEther(ethCollateral);

      await requestLoan(usdcAmount, dueDateTimestamp,{
        value:ethCollateralBigNumber
      });
      alert('Loan request submitted successfully!');
    } catch (error) {
      console.error(error);
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
            onChange={(e) => {
              setAmount(e.target.value);
              calculateEthCollateral(e.target.value);
            }}
            required
          />
        </div>
        <div>
          <label>Due Date:</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
        </div>
        {ethCollateral && (
          <div>
            <p>Current ETH price: {currentETHPrice}</p>
            <p>Required ETH Collateral: {ethCollateral}</p>
          </div>
        )}
        <button type="submit">Request Loan</button>
      </form>
    </div>
  );
};

export default MemberLoanRequest;
