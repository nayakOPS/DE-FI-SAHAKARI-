import React, { useState } from "react";
import { useWeb3 } from "../../utils/Web3Provider";
import { useLoanManager } from "../../utils/useLoanManager";
import { ethers } from "ethers";
import { useFundingPool } from "../../utils/useFundingPool"
import Navigation from "../Navigations";
import Alert from "../Alerts";

const AdminLoanApproval = () => {
  const { signer } = useWeb3();
  const { events ,disburseLoan, loanManagerContract, getLoans, approveLoan } = useLoanManager(signer);
  const { approveLoanManager } = useFundingPool(signer);
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
      loanIndex: loan.loanIndex.toNumber(),
      borrower: loan.borrower, // Borrower address
      amount: ethers.utils.formatUnits(loan.amount, 6), // Loan amount in ETH
      ethCollateral: ethers.utils.formatEther(loan.ethCollateral), // ETH collateral
      repaymentAmount: ethers.utils.formatUnits(loan.repaymentAmount, 6), // Repayment amount in ETH
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
      alert("Loan approved successfully")
      fetchLoanDetails();
    } catch (error) {
      console.error("Error approving loan:", error);
    }
  };

  const handleDisburseLoan = async (e, borrowerAddress, loanIndex) => {
    e.preventDefault();
    const formattedLoanIndex = ethers.BigNumber.from(loanIndex);

    const loan = loanDetails.find((loan) => loan.loanIndex === parseInt(loanIndex));
    if (!loan) {
      setError('Loan not found.');
      return;
    }

    console.log("The borrower Address: ", borrowerAddress, "type is:", typeof (borrowerAddress));
    console.log("The Loan Index: ", loanIndex, "type is:", typeof (loanIndex));

    setIsLoading(true);
    setError('');
    try {
      // Approve the loan manager with the loan amount
      await approveLoanManager(loan.amount);

      const txHash = await disburseLoan(borrowerAddress, formattedLoanIndex);
      setTransactionHash(txHash);
    } catch (error) {
      setError(error.message || 'Failed to disburse loan.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-5/6 m-auto min-h-screen">
      <Navigation />
      {events.LoanApproved.map((event, index) => (
          <Alert status="succcess" message={`Loan ${event.index} approved for member ${event.member}`} />
        ))}
        {events.LoanDisbursed.map((event, index) => (
          <Alert status="success" message={`Loan ${event.index} of ${ethers.utils.formatUnits(event.amount, 6)} disbursed for member${event.member}`} />
        ))}
      <div className="mt-8 px-40 py-4 h-full">
        <h1 className="text-3xl text-teal-200 font-bold mb-4">Admin Loan Approval</h1>
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
            className="block w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >Fetch Loan Details</button>
        </div>
        <div className="w-full flex flex-row justify-between">
          <div>
            {errorMessage && <p>{errorMessage}</p>}
            {loanDetails.length > 0 ? (
              <ul className="my-4">
                {loanDetails.map((loan) => (
                  <li key={loan.loanIndex}>
                    <h1>Loan Details:</h1>
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
                    {/* {loan.isApproved && !loan.isRepaid && (
                  <button onClick={() => handleDisburseLoan(loan.borrower, loan.loanIndex)}>
                    Disburse Loan
                  </button>
                )} */}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="italic text-sm mt-2">No loans found for this borrower address.</p>
            )}
          </div>

          <div>
            {errorMessage && <p>{errorMessage}</p>}
            {loanDetails.length > 0 ? (
              <ul className="my-4">
                {loanDetails.map((loan) => (
                  <li key={loan.loanIndex}>
                    <h1>Loan Disbursed:</h1>
                    {/* <p>Loan Index: {loan.loanIndex}</p>
                    <p>Loan Amount: {loan.amount} USDC</p>
                    <p>ETH Collateral: {loan.ethCollateral} ETH</p>
                    <p>Repayment Amount: {loan.repaymentAmount} USDC</p>
                    <p>Due Date: {loan.dueDate}</p>
                    <p>Approved: {loan.isApproved ? "Yes" : "No"}</p>
                    <p>Repaid: {loan.isRepaid ? "Yes" : "No"}</p> */}
                    <p>Disbursed:{loan.isDisbursed ? "Yes" : "No"} </p>
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
        </div>

      </div>

    </div>
  );
};

export default AdminLoanApproval;
