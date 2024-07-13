import React, { useState, useEffect } from "react";
import { useWeb3 } from "../utils/Web3Provider";
import { useMemberRegistry } from "../utils/useMemberRegistry";
import { useFundingPool } from "../utils/useFundingPool";
import { useLoanManager } from "../utils/useLoanManager";
import { useNavigate } from 'react-router-dom';
import { ethers } from "ethers";

const AdminDashboard = () => {
  const { signer, account } = useWeb3();
  const contract = useMemberRegistry(signer);
  const { getPendingLoans, approveLoan: approveLoanFromFundingPool, fetchTotalDeposits, totalEth, totalUsdc } = useFundingPool(signer, account);
  const { loanManagerContract, getLoans } = useLoanManager(signer)
  const [members, setMembers] = useState([]);
  const [loanDetails, setLoanDetails] = useState([]);
  const [memberDetails, setMemberDetails] = useState(null);
  const [searchAddress, setSearchAddress] = useState("");
  const [pendingLoans, setPendingLoans] = useState([]);
  const [walletAddress, setWalletAddress] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (contract) {
      fetchAllMembers();
      fetchTotalDeposits();
    }
  }, [contract]);

  const fetchAllMembers = async () => {
    try {
      const memberAddresses = await contract.getAllMembers();
      const memberDetails = await Promise.all(
        memberAddresses.map((address) => contract.getMember(address))
      );
      setMembers(memberDetails);
    } catch (error) {
      console.error("Error fetching members:", error);
    }
  };

  const getMemberDetails = async () => {
    try {
      const details = await contract.getMember(searchAddress);
      setMemberDetails(details);
    } catch (error) {
      console.error("Error fetching member details:", error);
    }
  };

  const handleGrantMemberRole = async () => {
    try {
      await contract.registerMember(walletAddress);
      console.log("Member role granted successfully for address:", walletAddress);
      // Optionally, you can update the list of members after granting the role
      fetchAllMembers();
    } catch (error) {
      console.error("Error granting member role:", error);
    }
  };

  const handleChange = (event) => {
    setWalletAddress(event.target.value);
  };

  const handleSearchAddressChange = (event) => {
    setSearchAddress(event.target.value);
  };

  const handleApproveLoan = async (borrower, loanIndex) => {
    try {
      await approveLoan(borrower, loanIndex);
      console.log('Loan approved successfully');
      fetchPendingLoans();
    } catch (error) {
      console.error('Error approving loan:', error);
    }
  };

  const handleDisburseLoan = async (borrower, loanIndex) => {
    try {
      await disburseLoan(borrower, loanIndex);
      console.log('Loan disbursed successfully');
      fetchPendingLoans();
    } catch (error) {
      console.error('Error disbursing loan:', error);
    }
  };

  const handleGetLoans = async (borrower) => {
    try {
      const loanResponse = await getLoans(borrower);
      const formattedLoans = formatLoanDetails(loanResponse);
      setLoanDetails(prevState => ({
        ...prevState,
        [borrower]: formattedLoans // Store formatted loan details by borrower address
      }));
      console.log('Loan details fetched successfully:', formattedLoans);
    } catch (error) {
      console.error('Error getting loan details:', error);
      setLoanDetails(prevState => ({
        ...prevState,
        [borrower]: null // Set to null to indicate no loan details found
      }));
    }
  };

  const formatLoanDetails = (loanResponse) => {
    return loanResponse.map((loan) => ({
      borrower: loan[0], // Borrower address
      amount: ethers.utils.formatUnits(loan.amount, 6), // Loan amount in USDC
      ethCollateral: ethers.utils.formatEther(loan[2]), // ETH collateral
      repaymentAmount: ethers.utils.formatUnits(loan.repaymentAmount,6), // Repayment amount in USDC
      isApproved: loan[4], // Approval status
      isRepaid: loan[5], // Repayment status
      dueDate: new Date(loan[6].toNumber() * 1000).toLocaleDateString() // Due date
    }));
  };

  const handleGoToDashboard = () => {
    console.log('Connected Wallet Address:', address);
    console.log('Admin Wallet Address:', '0x73fE2b14b3a53778F3F1bd2b243440995C4B68a4');

      if (address.toLowerCase() === '0x73fe2b14b3a53778f3f1bd2b243440995c4b68a4') {
      console.log("Navigating to admin");
      navigate('/dashboard');
    } else {
      console.log("Navigating to member dashboard");
      navigate('/member-dashboard');
    }
  };

  const handleGoToAdminLoanManagementDashboard = () => {
      navigate('/badminloan-approval');
  };

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <h2>Total Deposits</h2>
      <p>Total ETH Deposited: {totalEth || 'Loading...'}</p>
      <p>Total USDC Deposited: {totalUsdc || 'Loading...'}</p>

      <h2>All Members</h2>
      {members.length === 0 ? (
        <p>No members found.</p>
      ) : (
        <ul>
        {members.map((member, index) => (
          <li key={index}>
            <p>Index:{index}</p>
            <p>Name: {member.name}</p>
            <p>Address: {member.memberAddress}</p>
            <p>Registered: {member.isRegistered ? "Yes" : "No"}</p>
            {loanDetails[member.memberAddress] !== undefined ? (
              <div>
                <h3>Loan Details</h3>
                {loanDetails[member.memberAddress] ? (
                  loanDetails[member.memberAddress].map((loan, idx) => (
                    <div key={idx}>
                      <p>Loan Amount: {loan.amount} USDC</p>
                      <p>ETH Collateral: {loan.ethCollateral} ETH</p>
                      <p>Repayment Amount: {loan.repaymentAmount} USDC</p>
                      <p>Due Date: {loan.dueDate}</p>
                      <p>Approved: {loan.isApproved ? "Yes" : "No"}</p>
                      <p>Repaid: {loan.isRepaid ? "Yes" : "No"}</p>
                    </div>
                  ))
                ) : (
                  <p>Not requested for loan</p>
                )}
              </div>
            ) : (
              <p>Click on Fetch Loan Details for knowing the loan details of the memeber</p>
            )}
            <button onClick={() => handleGetLoans(member.memberAddress)}>
              Fetch Loan Details
            </button>
          </li>
        ))}
      </ul>
      )}

    <h2>Search Member</h2>
      <input 
        type="text" 
        placeholder="Enter member address" 
        value={searchAddress}
        onChange={handleSearchAddressChange}
      />
      <button onClick={getMemberDetails}>Get Member Details</button>
      {memberDetails && (
        <div>
          <h3>Member Details</h3>
          <p>Name: {memberDetails.name}</p>
          <p>Address: {memberDetails.memberAddress}</p>
          <p>Registered: {memberDetails.isRegistered ? "Yes" : "No"}</p>
        </div>
      )}

      <div>
        <button onClick={handleGoToAdminLoanManagementDashboard}>Accept Member Loan & Disburse</button>
      </div>
    </div>
  );
};

export default AdminDashboard;