import React, { useState } from "react";
import { useWeb3 } from "../../utils/Web3Provider";
import { useLoanManager } from "../../utils/useLoanManager";
import { ethers } from "ethers";
import Navigation from "../Navigations";

const AdminLoanApproval = () => {
  const { signer } = useWeb3();
  const loanManager = useLoanManager(signer);
  const [borrowerAddress, setBorrowerAddress] = useState("");
  const [loanDetails, setLoanDetails] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  const handleBorrowerAddressChange = (event) => {
    setBorrowerAddress(event.target.value);
  };

  const fetchLoanDetails = async () => {
    try {
      const loans = await loanManager.getLoans(borrowerAddress);
      const formattedLoans = formatLoanDetails(loans);
      setLoanDetails(formattedLoans);
      setErrorMessage("");
    } catch (error) {
      console.error("Error fetching loan details:", error);
      setLoanDetails([]);
      setErrorMessage("Error fetching loan details or no loans found for this address.");
    }
  };

  const formatLoanDetails = (loanResponse) => {
    return loanResponse.map((loan, index) => ({
      loanIndex: index,
      borrower: loan.borrower, // Borrower address
      amount: ethers.utils.formatUnits(loan.amount, 6), // Loan amount in ETH
      ethCollateral: ethers.utils.formatEther(loan.ethCollateral), // ETH collateral
      repaymentAmount: ethers.utils.formatUnits(loan.repaymentAmount, 6), // Repayment amount in ETH
      isApproved: loan.isApproved, // Approval status
      isRepaid: loan.isRepaid, // Repayment status
      dueDate: new Date(loan.dueDate.toNumber() * 1000).toLocaleDateString(), // Due date
    }));
  };

  const handleApproveLoan = async (borrower, loanIndex) => {
    try {
      await loanManager.approveLoan(borrower, loanIndex);
      console.log("Loan approved successfully");
      fetchLoanDetails();
    } catch (error) {
      console.error("Error approving loan:", error);
    }
  };

  const handleDisburseLoan = async (borrower, loanIndex) => {
    try {
      await loanManager.disburseLoan(borrower, loanIndex);
      console.log("Loan disbursed successfully");
      fetchLoanDetails();
    } catch (error) {
      console.error("Error disbursing loan:", error);
    }
  };

  return (
    <div className="w-5/6 m-auto">
      <Navigation/>
      <div className="mt-8 px-40 py-4 h-full">
        <h1 className="text-3xl text-teal-200 font-bold mb-12">Admin Loan Approval</h1>
        <div>
          <input
            type="text"
            placeholder="Enter borrower address"
            value={borrowerAddress}
            className="bg-gray-50 w-3/5 mb-2 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
            onChange={handleBorrowerAddressChange}
          />
          <button 
          onClick={fetchLoanDetails}
          className="block text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >Fetch Loan Details</button>
        </div>
        {errorMessage && <p>{errorMessage}</p>}
        {loanDetails.length > 0 ? (
          <ul>
            {loanDetails.map((loan) => (
              <li key={loan.loanIndex}>
                <p>Loan Amount: {loan.amount} USDC</p>
                <p>ETH Collateral: {loan.ethCollateral} ETH</p>
                <p>Repayment Amount: {loan.repaymentAmount} USDC</p>
                <p>Due Date: {loan.dueDate}</p>
                <p>Approved: {loan.isApproved ? "Yes" : "No"}</p>
                <p>Repaid: {loan.isRepaid ? "Yes" : "No"}</p>
                {!loan.isApproved && (
                  <button onClick={() => handleApproveLoan(loan.borrower, loan.loanIndex)}>
                    Approve Loan
                  </button>
                )}
                {loan.isApproved && !loan.isRepaid && (
                  <button onClick={() => handleDisburseLoan(loan.borrower, loan.loanIndex)}>
                    Disburse Loan
                  </button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="italic text-sm mt-2">No loans found for this borrower address.</p>
        )}
      </div>
    </div>
  );
};

export default AdminLoanApproval;
