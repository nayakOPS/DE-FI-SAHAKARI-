import React, { useState, useEffect } from "react";
import { useWeb3 } from "../utils/Web3Provider";
import { useLoanManager } from "../utils/useLoanManager";
import Navigation from "../Navigations";

const MemberRepayment = () => {
  const { signer, account } = useWeb3();
  const loanManager = useLoanManager(signer);
  const [loans, setLoans] = useState([]);

  useEffect(() => {
    fetchLoans();
  }, [loanManager, account]);

  const fetchLoans = async () => {
    try {
      const memberLoans = await loanManager.getLoans(account);
      setLoans(memberLoans);
    } catch (error) {
      console.error("Error fetching loans:", error);
    }
  };

  const handleRepayLoan = async (loanIndex, repaymentAmount) => {
    try {
      const txn = await loanManager.repayLoan(account, loanIndex, ethers.utils.parseUnits(repaymentAmount, 6));
      await txn.wait();
      console.log("Loan repaid successfully");
      fetchLoans();
    } catch (error) {
      console.error("Error repaying loan:", error);
    }
  };

  return (
    <div>
      <Navigation/>
      <h2>Repay Loan</h2>
      {loans.length === 0 ? (
        <p>No loans found.</p>
      ) : (
        <ul>
          {loans.map((loan, index) => (
            <li key={index}>
              <p>Amount: {ethers.utils.formatUnits(loan.amount, 6)} USDC</p>
              <p>Repayment Amount: {ethers.utils.formatUnits(loan.repaymentAmount, 6)} USDC</p>
              <p>Due Date: {loan.dueDate}</p>
              <p>Approved: {loan.isApproved ? "Yes" : "No"}</p>
              <p>Repaid: {loan.isRepaid ? "Yes" : "No"}</p>
              {!loan.isRepaid && loan.isApproved && (
                <button onClick={() => handleRepayLoan(index, loan.repaymentAmount)}>Repay Loan</button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MemberRepayment;