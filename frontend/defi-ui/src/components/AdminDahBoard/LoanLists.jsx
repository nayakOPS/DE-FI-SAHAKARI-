import React, { useState, useEffect } from 'react';
import { useWeb3 } from "../../utils/Web3Provider";
import { ethers } from 'ethers';
import { useLoanManager } from "../../utils/useLoanManager";
import { useFundingPool } from '../../utils/useFundingPool';
import TransactionHash from '../TransactionHash';


const Loans = ({ members, status }) => {
    const { signer, account } = useWeb3();
    const { events, disburseLoan, loanManagerContract, getLoans, approveLoan } = useLoanManager(signer);
    const { approveLoanManager } = useFundingPool(signer);
    const [loanDetails, setLoanDetails] = useState({});
    const [loansList, setLoansList] = useState([])
    const [isLoading, setIsLoading] = useState(false);
    const [transactionHash, setTransactionHash] = useState('');
    const [error, setError] = useState('');

    const formatLoanDetails = (loanResponse) => {
        return loanResponse.map((loan) => ({
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


    const handleGetLoans = async (borrower) => {
        try {
            const loanResponse = await getLoans(borrower);
            const formattedLoans = formatLoanDetails(loanResponse);
            return formattedLoans;
        } catch (error) {
            console.error('Error getting loan details:', error);
            return [];
        }
    };

    const handleApproveLoan = async ({borrower, LoanIndex}) => {
        try {
          await approveLoan(borrower, LoanIndex);
          console.log("Loan approved successfully");
        //   fetchLoanDetails();
        } catch (error) {
          console.error("Error approving loan:", error);
        }
      };
    
      const handleDisburseLoan = async ( {borrower, LoanIndex, amount}) => {
        // e.preventDefault();
        console.log('DISBURSE', borrower,LoanIndex,amount )
        
        const formattedLoanIndex = ethers.BigNumber.from(LoanIndex);
    
        // const loan = loanDetails.find((loan) => loan.loanIndex === parseInt(loanIndex));
        // if (!loan) {
        //   setError('Loan not found.');
        //   return;
        // }
    
        // console.log("The borrower Address: ", borrowerAddress, "type is:", typeof (borrowerAddress));
        // console.log("The Loan Index: ", loanIndex, "type is:", typeof (loanIndex));
    
        setIsLoading(true);
        setError('');
        try {
          // Approve the loan manager with the loan amount
          // a bit cliche here but ok inside the approveLoanManager code
          await approveLoanManager(amount);
    
          const txHash = await disburseLoan(borrower, formatLoanDetails);
          setTransactionHash(txHash);
        } catch (error) {
          setError(error.message || 'Failed to disburse loan.');
        } finally {
          setIsLoading(false);
        }
      };

    const loanList = async (members) => {
        console.log('members state', members);
        const updatedLoansList = [];
        for (let i = 0; i < members.length; i++) {
            console.log('Processing member', members[i][1]);
            const loansForMember = await handleGetLoans(members[i][1]);
            console.log('loansForMember: ', loansForMember);
            updatedLoansList.push(...loansForMember); // Add loans for member to the list
        }
        setLoansList(updatedLoansList);
        console.log('Effect', updatedLoansList);
    };

    useEffect(() => {
        if (members && members.length > 0) {
            loanList(members);
        }
    }, [members])

    return (

        <div className="relative overflow-x-auto shadow-md sm:rounded-lg mt-4">
            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    {/* Standing, requested or accepted loans */}
                    {status != "requests" ?
                        (status === 'standing' ? <tr>
                            <th scope="col" className="px-6 py-3">
                                LoanIndex
                            </th>
                            <th scope="col" className=" px-6 py-3">
                                Amount
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Borrower
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Due Date
                            </th>
                            <th scope='col' className="px-6 py-3">Collateral Eth</th>
                            <th scope="col" className="px-6 py-3">
                                Repayment Amount
                            </th>
                        </tr> :
                            <tr>
                                <th scope="col" className="px-6 py-3">
                                    LoanIndex
                                </th>
                                <th scope="col" className=" px-6 py-3">
                                    Amount
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Borrower
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Repayment Amount
                                </th>
                                <th scope='col' className="px-6 py-3">
                                    Collateral Eth</th>
                                <th scope="col" className="px-6 py-3">
                                    Action
                                </th>
                            </tr>
                        )
                        : <tr>
                            <th scope="col" className="px-6 py-3">
                                LoanIndex
                            </th>
                            <th scope="col" className=" px-6 py-3">
                                Amount
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Borrower
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Repayment Amount
                            </th>
                            <th scope='col' className="px-6 py-3">Collateral Eth</th>
                            <th scope="col" className="px-6 py-3">
                                Action
                            </th>
                        </tr>}
                </thead>
                {status != 'requests' ? (status === 'standing' ? <tbody>
                    {loansList.map((loan, index) => {
                        if (loan.isApproved && loan.isDisbursed &&!loan.isRepaid) {
                            return (
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
                                    <td className="px-6 py-4">{loan.amount}</td>
                                    <td className="px-6 py-4"><TransactionHash hash={loan.borrower} /></td>
                                    <td className="px-6 py-4">{loan.dueDate}</td>
                                    <td className="px-6 py-4">{loan.ethCollateral}</td>
                                    <td className="px-6 py-4">{loan.repaymentAmount}</td>
                                </tr>
                            )
                        }

                    })}
                </tbody> :
                    <tbody>
                        {loansList.map((loan, index) => {
                            if (!loan.isApproved) {
                                return (
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
                                        <td className="px-6 py-4">{loan.amount}</td>
                                        <td className="px-6 py-4"><TransactionHash hash={loan.borrower} /></td>
                                        <td className="px-6 py-4">{loan.repaymentAmount}</td>
                                        <td className="px-6 py-4">{loan.ethCollateral}</td>
                                        <td className="px-6 py-4"><button className='hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300' onClick={()=> handleApproveLoan(loan)}>Approve</button></td>
                                    </tr>
                                )
                            }

                        })}
                    </tbody>) :
                    <tbody>
                        {loansList.map((loan, index) => {
                            if (loan.isApproved && !loan.isDisbursed) {
                                return (
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
                                        <td className="px-6 py-4">{loan.amount}</td>
                                        <td className="px-6 py-4"><TransactionHash hash={loan.borrower} /></td>
                                        <td className="px-6 py-4">{loan.repaymentAmount}</td>
                                        <td className="px-6 py-4">{loan.ethCollateral}</td>
                                        <td className="px-6 py-4"><button className='hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300' onClick={()=> handleDisburseLoan(loan)}>Disburse</button></td>
                                    </tr>
                                )
                            }

                        })}
                    </tbody>}
            </table>
        </div>
    )
}

export default Loans;