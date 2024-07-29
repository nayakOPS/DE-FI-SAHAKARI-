import React, { useState, useEffect } from 'react';
import { useWeb3 } from "../../utils/Web3Provider";
import { ethers } from 'ethers';
import { useLoanManager } from "../../utils/useLoanManager";
import TransactionHash from '../TransactionHash';


const Loans = ({ members }) => {
    const { signer, account } = useWeb3();
    const { loanManagerContract, getLoans } = useLoanManager(signer);
    const [loanDetails, setLoanDetails] = useState({});
    const [loansList, setLoansList] = useState([])
    console.log('Logging from the loans', members)

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
                            Due Date
                        </th>
                        <th scope='col' className="px-6 py-3">Collateral Eth</th>
                        <th scope="col" className="px-6 py-3">
                            Repayment Amount
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {loansList.map((loan, index) => {
                        if (true) {
                            return(
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
                </tbody>
            </table>
        </div>
    )
}

export default Loans;