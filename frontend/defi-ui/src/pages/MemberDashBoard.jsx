import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../utils/Web3Provider';
import { useMemberRegistry } from '../utils/useMemberRegistry';
import { useFundingPool } from '../utils/useFundingPool';

const MemberDashboard = () => {
  const { signer, account, connectWallet } = useWeb3();
  const memberRegistryContract = useMemberRegistry(signer);
  const { getUSDCBalance, getEthBalance, depositUSDC, requestLoan } = useFundingPool(signer, account);
  const [isRegistered, setIsRegistered] = useState(false);
  const [memberDetails, setMemberDetails] = useState(null);
  const [usdcBalance, setUsdcBalance] = useState(0);
  const [ethCollateral, setEthCollateral] = useState(0);
  const [usdcAmount, setUsdcAmount] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (memberRegistryContract && account) {
      checkMemberStatus();
      fetchBalances();
    }
  }, [memberRegistryContract, account]);

  const checkMemberStatus = async () => {
    try {
      const member = await memberRegistryContract.getMember(account);
      setIsRegistered(member.isRegistered);
      setMemberDetails(member);
    } catch (error) {
      console.error('Error checking member status:', error);
    }
  };

  const fetchBalances = async () => {
    try {
      const usdcBal = await getUSDCBalance(account);
      const ethCollat = await getEthBalance(account);
      setUsdcBalance(usdcBal.toString());
      setEthCollateral(ethCollat.toString());
    } catch (error) {
      console.error('Error fetching balances:', error);
    }
  };

  const handleConnectWallet = async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  const handleRegister = () => {
    navigate('/register-member');
  };

  const handleDepositUSDC = async () => {
    try {
      if (!usdcAmount) {
        console.error('USDC amount is required');
        return;
      }
      await depositUSDC(usdcAmount); // Pass usdcAmount as string
      await fetchBalances(); // Refresh balances after deposit
      setUsdcAmount(''); // Clear the input field
    } catch (error) {
      console.error('USDC Deposit Error:', error);
    }
  };

  const handleLoanRequestButton = () =>{
      navigate('/member-loan-request')
  }

  if (!account) {
    return (
      <div>
        <p>Please connect your wallet</p>
        <button onClick={handleConnectWallet}>Connect Wallet</button>
      </div>
    );
  }

  return (
    <div>
      <h1>Member Dashboard</h1>
      {isRegistered ? (
        <div>
          <h2>Member Details</h2>
          <p>Name: {memberDetails.name}</p>
          <p>Address: {memberDetails.memberAddress}</p>
          <p>Registered: {memberDetails.isRegistered ? 'Yes' : 'No'}</p>
          <p>USDC Balance: {ethers.utils.formatUnits(usdcBalance, 6)}</p>
          <p>ETH Collateral: {ethCollateral}</p>
          <input
            type="number"
            value={usdcAmount}
            onChange={(e) => setUsdcAmount(e.target.value)}
            placeholder="Enter USDC amount"
          />
          <button onClick={handleDepositUSDC}>Deposit USDC</button>
          <div>
            <p>You can get Loan when you deposit ETH, 150% eth collateral is needed in terms of comparison with USDC</p>
            <button onClick={handleLoanRequestButton}>Request Loan</button>
          </div>
        </div>
      ) : (
        <div>
          <p>Member is not registered.</p>
          <button onClick={handleRegister}>Register</button>
        </div>
      )}
    </div>
  );
};

export default MemberDashboard;
