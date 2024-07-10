import React, { useState, useEffect } from "react";
import { useWeb3 } from "../utils/Web3Provider";
import { useMemberRegistry } from "../utils/useMemberRegistry";
import { useFundingPool } from "../utils/useFundingPool";

const AdminDashboard = () => {
  const { signer, account } = useWeb3();
  const contract = useMemberRegistry(signer);
  const [members, setMembers] = useState([]);
  const [memberDetails, setMemberDetails] = useState(null);
  const [searchAddress, setSearchAddress] = useState("");
  const { getPendingLoans, approveLoan, rejectLoan } = useFundingPool(signer, account);
  const [pendingLoans, setPendingLoans] = useState([]);
  const [walletAddress, setWalletAddress] = useState("");

  useEffect(() => {
    if (contract) {
      fetchAllMembers();
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

  const fetchPendingLoans = async () => {
    try {
      const loans = await getPendingLoans();
      setPendingLoans(loans);
    } catch (error) {
      console.error('Error fetching pending loans:', error);
    }
  };

  const handleApproveLoan = async (loanId) => {
    try {
      await approveLoan(loanId);
      console.log('Loan approved successfully');
      fetchPendingLoans();
    } catch (error) {
      console.error('Error approving loan:', error);
    }
  };

  const handleRejectLoan = async (loanId) => {
    try {
      await rejectLoan(loanId);
      console.log('Loan rejected successfully');
      fetchPendingLoans();
    } catch (error) {
      console.error('Error rejecting loan:', error);
    }
  };
  

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <h2>All Members</h2>
      {members.length === 0 ? (
        <p>No members found.</p>
      ) : (
        <ul>
          {members.map((member, index) => (
            <li key={index}>
              <p>Name: {member.name}</p>
              <p>Address: {member.memberAddress}</p>
              <p>Registered: {member.isRegistered ? "Yes" : "No"}</p>
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
    </div>
  );
};

export default AdminDashboard;
