import React, { useState, useEffect } from "react";
import { useWeb3 } from "../utils/Web3Provider";
import { useMemberRegistry } from "../utils/useMemberRegistry";
import { useFundingPool } from "../utils/useFundingPool";
import { useLoanManager } from "../utils/useLoanManager";
import { useNavigate } from 'react-router-dom';
import { ethers } from "ethers";
import Navigation from "../components/Navigations";
import Modal from "../components/AdminDahBoard/Modal";
import TransactionHash from "../components/TransactionHash";

const AdminDashboard = () => {
  const { signer, account } = useWeb3();
  const contract = useMemberRegistry(signer);
  const { getPendingLoans, approveLoan: approveLoanFromFundingPool, fetchTotalDeposits, totalEth, totalUsdc } = useFundingPool(signer, account);
  const { loanManagerContract, getLoans } = useLoanManager(signer)
  const [members, setMembers] = useState([]);
  const [loanDetails, setLoanDetails] = useState({});
  const [memberDetails, setMemberDetails] = useState(null);
  const [searchAddress, setSearchAddress] = useState("");
  const [pendingLoans, setPendingLoans] = useState([]);
  const [walletAddress, setWalletAddress] = useState("");
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState('');
  const navigate = useNavigate();
  const [memberModal, setMemberModal] = useState(false)

  useEffect(() => {
    if (contract) {
      fetchAllMembers();
      fetchTotalDeposits();
    }
  }, [contract]);

  console.log("Maybe array of the loans", Object.values(loanDetails))
  console.log("Loan Details", loanDetails)
  const openModal = (member) => {
    console.log('opening for member', member)
    handleGetLoans(member);
    setSelectedMember(member);
    console.log('selected member', selectedMember)
    setModalOpen(true);
  };

  const openMemberModal = (addr) => {
    setSelectedMember(addr);
    setMemberModal(true);
  }

  const closeMemberModal = () => {
    setMemberModal(false);
    setSelectedMember(null)
  }

  useEffect(() => {
    console.log("Selected Member is:", selectedMember)
  }, [selectedMember])

  const closeModal = () => {
    setModalOpen(false);
    setSelectedMember(null);
  };

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

  const getMemberDetails = async (member_address) => {
    console.log('member_address', member_address)
    try {
      const details = await contract.getMember(member_address);
      setMemberDetails(details);
      setMemberModal(true);
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
      console.log('Loan Details', loanDetails)
      console.log(selectedMember)
    } catch (error) {
      console.error('Error getting loan details:', error);
      setLoanDetails(prevState => ({
        ...prevState,
        [borrower]: [] // Set to null to indicate no loan details found
      }));
    }
  };

  const formatLoanDetails = (loanResponse) => {
    return loanResponse.map((loan) => ({
      /*
      borrower: loan[0], // Borrower address
      amount: ethers.utils.formatUnits(loan.amount, 6), // Loan amount in USDC
      ethCollateral: ethers.utils.formatEther(loan[2]), // ETH collateral
      repaymentAmount: ethers.utils.formatUnits(loan.repaymentAmount, 6), // Repayment amount in USDC
      isApproved: loan[4], // Approval status
      isRepaid: loan[5], // Repayment status
      dueDate: new Date(loan[6].toNumber() * 1000).toLocaleDateString() // Due date
      */
      LoanIndex: loan.loanIndex.toNumber(), // Convert BigNumber to number
      borrower: loan.borrower,
      amount: ethers.utils.formatUnits(loan.amount, 6), // Format amount using ethers.js
      ethCollateral: ethers.utils.formatEther(loan.ethCollateral), // Format ETH collateral using ethers.js
      repaymentAmount: ethers.utils.formatUnits(loan.repaymentAmount, 6), // Format repayment amount using ethers.js
      isApproved: loan.isApproved,
      isRepaid: loan.isRepaid,
      isDisbursed: loan.isDisbursed,
      dueDate: new Date(loan[8].toNumber() * 1000).toLocaleDateString() // Due date
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
    <div className='bg-black bg-opacity-90'>
      <div className="w-5/6 m-auto min-h-screen">
        <Navigation />
        {account === '0x73fE2b14b3a53778F3F1bd2b243440995C4B68a4' || "0xd5bd2adc0cb6c90e8803fae0e42cda55f9fd4ee7" ?
          <div className="mt-8 py-4 h-full">
            <h1 className="text-3xl text-teal-200 font-bold mb-12">Admin Dashboard</h1>
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div className="bg-slate-50 rounded-2xl px-12 py-8 text-base text-slate-700 font-bold">
                <p>{totalUsdc || 'Loading...'}</p>
                <p>Total USDC Deposited</p>
              </div>
              <div className="bg-slate-50 rounded-2xl px-12 py-8 text-slate-700 text-base font-bold">
                <p className="font">{totalEth || 'Loading...'}</p>
                <p className="text-base font-bold">Total ETH Deposited</p>
              </div>
              <div>
                <button
                  onClick={handleGoToAdminLoanManagementDashboard}
                  className="block w-full h-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                >Accept Member Loan & Disburse</button>
              </div>
            </div>

            <div className="relative overflow-x-auto shadow-md sm:rounded-lg mt-8">
              <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th scope="col" className="px-6 py-3">
                      S.N
                    </th>
                    <th scope="col" className=" px-6 py-3">
                      Address
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Member Name
                    </th>
                    <th scope="col" className="px-6 py-3">
                      <span >Action</span>
                    </th>
                    <th scope="col" className="px-6 py-3">
                      <span>Member Details</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {members.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 ">No members found.</td>
                    </tr>
                  ) : (
                    members.map((member, index) => (

                      <tr
                        key={index}
                        className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                      >

                        <th
                          scope="row"
                          className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                        >
                          {index + 1}
                        </th>
                        <td className="px-6 py-4"><TransactionHash hash={member.memberAddress} /></td>
                        <td className="px-6 py-4">{member.name}</td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => openModal(member.memberAddress)}
                            className="hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300"
                          >
                            Loan Details
                          </button>
                        </td>
                        <td>
                          <button
                            className="hover:bg-blue-800 focus:ring-4 mx-4 focus:outline-none focus:ring-blue-300"
                            onClick={() => {
                              openMemberModal({
                                memberAddress: member.memberAddress,
                                name: member.name,
                                isRegistered: member.isRegistered
                              })
                            }}
                          >Get Member Details</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <Modal isOpen={memberModal} onClose={closeMemberModal} title="Member Details">
              {selectedMember && (
                <div className="text-black">
                  <p>Name: {selectedMember.name}</p>
                  <p>Address: {selectedMember.memberAddress}</p>
                  <p>Registered: {selectedMember.isRegistered ? "Yes" : "No"}</p>
                </div>
              )}
            </Modal>

            {selectedMember && (
              <Modal isOpen={isModalOpen} onClose={closeModal} title="Loan Details">
                {loanDetails[selectedMember] && loanDetails[selectedMember].length !== 0 ? (
                  <div className="text-black text-sm">
                    {loanDetails[selectedMember] ? (
                      loanDetails[selectedMember].map((loan, idx) => (
                        <div key={idx}>
                          <p>Loan Index: {loan.LoanIndex + 1}</p>
                          <p>Loan Amount: {loan.amount} USDC</p>
                          <p>ETH Collateral: {loan.ethCollateral} ETH</p>
                          <p>Repayment Amount: {loan.repaymentAmount} USDC</p>
                          <p>Due Date: {loan.dueDate}</p>
                          <p>Approved: {loan.isApproved ? "Yes" : "No"}</p>
                          <p>Disbursed: {loan.isDisbursed ? "Yes" : "No"}</p>
                          <p>Repaid: {loan.isRepaid ? "Yes" : "No"}</p>
                        </div>
                      ))
                    ) : (
                      <p>Not requested for loan</p>
                    )}
                  </div>
                ) : (
                  <p className="text-black text-base">Not requested for loan</p>
                )}

              </Modal>
            )}
          </div>
          : null}
      </div>
    </div>
  );
};

export default AdminDashboard;