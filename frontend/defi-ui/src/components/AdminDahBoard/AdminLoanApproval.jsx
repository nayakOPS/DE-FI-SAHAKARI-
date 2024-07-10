import React, { useState, useEffect } from "react";
import { useWeb3 } from "../utils/Web3Provider";
import { useLoanManager } from "../utils/useLoanManager";

const AdminLoanApproval = () => {
  const { signer } = useWeb3();
  const loanManager = useLoanManager(signer);
  const [loans, setLoans] = useState([]);

  useEffect(() => {
    fetchLoans();
  }, [loanManager]);

  const fetchLoans = async () => {
    try {
      // Fetch loans for all members (simplified approach, you might need to iterate over members)
      // Assume a list of members is available
      const members = ["0xMemberAddress1", "0xMemberAddress2"]; 
      const allLoans = [];
      for (const member of members) {
        const memberLoans = await loanManager.getLoans(member);
        allLoans.push(...memberLoans);
      }
      setLoans(allLoans);
    } catch (error) {
      console.error("Error fetching loans:", error);
    }
  };

  const handleApproveLoan = async (borrower, loanIndex) => {
    try {
      const txn = await loanManager.approveLoan(borrower, loanIndex);
      await txn.wait();
      console.log("Loan approved successfully");
      fetchLoans();
    } catch (error) {
      console.error("Error approving loan:", error);
    }
  };

  const handleDisburseLoan = async (borrower, loanIndex) => {
    try {
      const txn = await loanManager.disburseLoan(borrower, loanIndex);
      await txn.wait();
      console.log("Loan disbursed successfully");
      fetchLoans();
    } catch (error) {
      console.error("Error disbursing loan:", error);
    }
  };

  return (
    <div>
      <h2>Loan Approval</h2>
      {loans.length === 0 ? (
        <p>No loans found.</p>
      ) : (
        <ul>
          {loans.map((loan, index) => (
            <li key={index}>
              <p>Borrower: {loan.borrower}</p>
              <p>Amount: {ethers.utils.formatUnits(loan.amount, 6)} USDC</p>
              <p>Collateral: {ethers.utils.formatUnits(loan.ethCollateral, 18)} ETH</p>
              <p>Repayment Amount: {ethers.utils.formatUnits(loan.repaymentAmount, 6)} USDC</p>
              <p>Due Date: {loan.dueDate}</p>
              <p>Approved: {loan.isApproved ? "Yes" : "No"}</p>
              <p>Repaid: {loan.isRepaid ? "Yes" : "No"}</p>
              {!loan.isApproved && (
                <button onClick={() => handleApproveLoan(loan.borrower, index)}>Approve Loan</button>
              )}
              {loan.isApproved && !loan.isRepaid && (
                <button onClick={() => handleDisburseLoan(loan.borrower, index)}>Disburse Loan</button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminLoanApproval;
