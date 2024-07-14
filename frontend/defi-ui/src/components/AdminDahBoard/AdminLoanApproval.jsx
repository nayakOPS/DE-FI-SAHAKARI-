import React, { useState } from "react";
import { useWeb3 } from "../../utils/Web3Provider";
import { useLoanManager } from "../../utils/useLoanManager";
import { ethers } from "ethers";

const AdminLoanApproval = () => {
  const { signer } = useWeb3();
  const { disburseLoan, loanManagerContract, getLoans, approveLoan } = useLoanManager(signer);
  const [borrowerAddress, setBorrowerAddress] = useState("");
  const [loanDetails, setLoanDetails] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  const [loanIndex, setLoanIndex] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [transactionHash, setTransactionHash] = useState('');
  const [error, setError] = useState('');

  const handleBorrowerAddressChange = (event) => {
    setBorrowerAddress(event.target.value);
  };

  const fetchLoanDetails = async () => {
    try {
      const loans = await getLoans(borrowerAddress);
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
      loanIndex:loan.loanIndex.toNumber(),
      borrower: loan.borrower, // Borrower address
      amount: ethers.utils.formatUnits(loan.amount, 6), // Loan amount in ETH
      ethCollateral: ethers.utils.formatEther(loan.ethCollateral), // ETH collateral
      repaymentAmount: ethers.utils.formatUnits(loan.repaymentAmount,6), // Repayment amount in ETH
      isApproved: loan.isApproved, // Approval status
      isRepaid: loan.isRepaid, // Repayment status
      isDisbursed: loan.isDisbursed,
      dueDate: new Date(loan.dueDate.toNumber() * 1000).toLocaleDateString(), // Due date
    }));
  };

  const handleApproveLoan = async (borrower, loanIndex) => {
    try {
      await approveLoan(borrower, loanIndex);
      console.log("Loan approved successfully");
      fetchLoanDetails();
    } catch (error) {
      console.error("Error approving loan:", error);
    }
  };

  const handleDisburseLoan = async (e, borrowerAddress,loanIndex ) => {
    e.preventDefault();
    const formattedLoanIndex = ethers.BigNumber.from(loanIndex);
    console.log("The borrower Address: ",borrowerAddress,"type is:",typeof(borrowerAddress) );
    console.log("The Loan Index: ",loanIndex,"type is:",typeof(loanIndex));
    setIsLoading(true);
    setError('');
    try {
      const txHash = await disburseLoan(borrowerAddress,formattedLoanIndex);
      setTransactionHash(txHash);
    } catch (error) {
      setError(error.message || 'Failed to disburse loan.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1>Admin Loan Approval</h1>
      <div>
        <input
          type="text"
          placeholder="Enter borrower address"
          value={borrowerAddress}
          onChange={handleBorrowerAddressChange}
        />
        <button onClick={fetchLoanDetails}>Fetch Loan Details</button>
      </div>
      {errorMessage && <p>{errorMessage}</p>}
      {loanDetails.length > 0 ? (
        <ul>
          {loanDetails.map((loan) => (
            <li key={loan.loanIndex}>
              <p>Loan Index: {loan.loanIndex}</p>
              <p>Loan Amount: {loan.amount} USDC</p>
              <p>ETH Collateral: {loan.ethCollateral} ETH</p>
              <p>Repayment Amount: {loan.repaymentAmount} USDC</p>
              <p>Due Date: {loan.dueDate}</p>
              <p>Approved: {loan.isApproved ? "Yes" : "No"}</p>
              <p>Repaid: {loan.isRepaid ? "Yes" : "No"}</p>
              <p>Disbursed:{loan.isDisbursed? "Yes" : "No"} </p>
              {!loan.isApproved && (
                <button onClick={() => handleApproveLoan(loan.borrower, loan.loanIndex)}>
                  Approve Loan
                </button>
              )}
              {loan.isApproved && !loan.isRepaid && (
                <div>
                    <div>
                        <h2>Disburse Loan</h2>
                        <form
                          onSubmit={(e) => {
                            handleDisburseLoan(e, borrowerAddress, loanIndex);
                          }}
                        >
                          <label>
                            Borrower Address:
                            <input
                              type="text"
                              value={borrowerAddress}
                              onChange={(e) => setBorrowerAddress(e.target.value)}
                              required
                            />
                          </label>
                          <br />
                          <label>
                            Loan Index:
                            <input
                              type="number"
                              value={loanIndex}
                              onChange={(e) => setLoanIndex(e.target.value)}
                              required
                            />
                          </label>
                          <br />
                          <button type="submit" disabled={isLoading}>
                            {isLoading ? 'Processing...' : 'Disburse Loan'}
                          </button>
                        </form>
                        {transactionHash && (
                          <p>Transaction successful! Transaction Hash: {transactionHash}</p>
                        )}
                        {error && <p style={{ color: 'red' }}>{error}</p>}
                      </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>No loans found for this borrower address.</p>
      )}
    </div>
  );
};

export default AdminLoanApproval;
