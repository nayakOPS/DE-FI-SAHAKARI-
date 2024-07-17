import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../../utils/Web3Provider';
import { useMemberRegistry } from '../../utils/useMemberRegistry';
import { useFundingPool } from '../../utils/useFundingPool';
import Navigation from '../../components/Navigations';
import { useLoanManager } from '../../utils/useLoanManager';
import Modal from "../AdminDahBoard/Modal";
// import MemberLoanRequestModal from './MemberLoanRequestModal';

const Dashboard = () => {
  const { signer, account, connectWallet } = useWeb3();
  const memberRegistryContract = useMemberRegistry(signer);
  const { getUSDCBalance, getEthBalance, depositUSDC, requestLoan, approveLoanManager, ensureAllowanceForRepayment } = useFundingPool(signer, account);
  const { getLoans, repayLoan, loanManagerContract, returnCollateral } = useLoanManager(signer);
  const [isRegistered, setIsRegistered] = useState(false);
  const [memberDetails, setMemberDetails] = useState(null);
  const [usdcBalance, setUsdcBalance] = useState(0);
  const [ethCollateral, setEthCollateral] = useState(0);
  const [usdcAmount, setUsdcAmount] = useState('');
  const [loanDetails, setLoanDetails] = useState([]);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [issModalOpen, setModalOpen] = useState(false);
  // const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);

  // const openModal = () => setIsLoanModalOpen(true);
  // const closeModal = () => setIsLoanModalOpen(false);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  }

  useEffect(() => {
    if (memberRegistryContract && account) {
      checkMemberStatus();
      fetchBalances();
      handleGetLoans(account);
    }
  }, [memberRegistryContract, account]);

  const handleGetLoans = async (borrower) => {
    try {
      const loanResponse = await getLoans(borrower);
      const formattedLoans = formatLoanDetails(loanResponse);
      setLoanDetails(formattedLoans);
      console.log('Loan details fetched successfully:', formattedLoans);
    } catch (error) {
      console.error('Error getting loan details:', error);
      setLoanDetails([]); // Set to an empty array to indicate no loan details found
    }
  };

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
      dueDate: new Date(loan.dueDate.toNumber() * 1000).toLocaleDateString() // Due date
    }));
  };

  const checkMemberStatus = async () => {
    try {
      const member = await memberRegistryContract.getMember(account);
      setIsRegistered(member.isRegistered);
      setMemberDetails(member);
    } catch (error) {
      console.error('Error checking member status:', error);
    }
  };

  const fetchBalances = async () => {
    try {
      const usdcBal = await getUSDCBalance(account);
      const ethCollat = await getEthBalance(account);
      setUsdcBalance(usdcBal.toString());
      setEthCollateral(ethCollat.toString());
    } catch (error) {
      console.error('Error fetching balances:', error);
    }
  };


  const handleConnectWallet = async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  const handleRegister = () => {
    navigate('/register-member');
  };

  const handleDepositUSDC = async (e) => {
    e.preventDefault();
    try {
      if (!usdcAmount) {
        console.error('USDC amount is required');
        return;
      }
      console.log(`Depositing USDC amount: ${usdcAmount}`);
      await depositUSDC(usdcAmount); // Pass usdcAmount as string
      await fetchBalances(); // Refresh balances after deposit
      setUsdcAmount(''); // Clear the input field
      toggleModal()
    } catch (error) {
      console.error('USDC Deposit Error:', error);
    }
  };

  const handleLoanRequestButton = () => {
    navigate('/member-loan-request')
  }

  const handleLoanRepayment = async (borrower, loanIndex, amount) => {
    try {
      if (!amount) {
        console.error('Repayment amount is required');
        return;
      }

       // Check and approve allowance if needed
      const allowanceApproved = await ensureAllowanceForRepayment(amount);
      if (!allowanceApproved) {
          console.error('Failed to approve allowance for repayment');
          return;
      }

    console.log(`Repaying loan amount: ${amount} for loan index: ${loanIndex}`);

     const approved =  await approveLoanManager(amount);
     console.log("Successfullly Approved laon manager contract in behalf of funding pool:",approved);

      const tx = await repayLoan(borrower, loanIndex, ethers.utils.parseUnits(amount, 6));
      console.log("Succesfully Loan Repaid:", tx);
      alert('Loan repaid successfully');
      // await fetchLoans(); // Refresh loans after repayment
      setLoanRepayAmount(''); // Clear the input field
    } catch (error) {
      console.error('Loan Repayment Error:', error);
    }
  };

  const handleReturnCollateral = async (borrower, loanIndex) => {
    try {
      const tx = await returnCollateral(borrower, loanIndex);
      console.log("Successfully returned collateral:", tx);
      alert('Collateral returned successfully');
      await handleGetLoans(borrower); // Refresh loans after returning collateral
    } catch (error) {
      console.error('Return Collateral Error:', error);
    }
  };

  const openModal = () => {
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };
  if (!account) {
    return (
      <div>
        <p>Please connect your wallet</p>
        <button onClick={handleConnectWallet}>Connect Wallet</button>
      </div>
    );
  }

  return (
    <main className='h-screen'>
      <div className='w-5/6 m-auto' >
        <Navigation />
        <div className='mt-16 px-40 py-4'>

          <h1 className="text-3xl text-teal-200 font-bold mb-12">Member Dashboard</h1>
          {isRegistered ? (
            < >
              <div className='flex'>
                <div className='bg-slate-50 rounded-2xl px-12 py-8 text-black w-2/4 mr-4'>
                  <h2 className='font-bold text-xl'>Member Details</h2>
                  <p>Name: {memberDetails.name}</p>
                  <p >Address:<span className='text-sm text-slate-800'> {memberDetails.memberAddress}</span></p>
                </div>
                <div className='text-slate-700 mr-4'>
                  {/* <p>Registered: {memberDetails.isRegistered ? 'Yes' : 'No'}</p> */}
                  <div className='bg-slate-50 rounded-2xl px-12 py-8 mb-2 text-center'>
                    <p>{ethers.utils.formatUnits(usdcBalance, 6)}</p>
                    <p className='font-bold'>USDC Balance</p>
                  </div>

                  <div className='bg-slate-50 rounded-2xl px-12 py-8 text-center'>
                      <p></p>
                    <p className='font-bold'>ETH Collateral</p>
                  </div>
                </div>

                <div>
            {/* Modal toggle */}
            <button
              onClick={toggleModal}
              className="block text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              type="button"
            >
              Deposit USDC
            </button>

            {/* Main modal */}
            {isModalOpen && (
              <div
                id="crud-modal"
                tabIndex="-1"
                aria-hidden="true"
                className="fixed top-0 right-0 left-0 z-50 flex justify-center items-center w-full h-full bg-gray-800 bg-opacity-50"
              >
                <div className="relative p-4 w-full max-w-md max-h-full">
                  {/* Modal content */}
                  <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                    {/* Modal header */}
                    <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Load USDC to Funding Pool
                      </h3>
                      <button
                        type="button"
                        onClick={toggleModal}
                        className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                      >
                        X
                      </button>
                    </div>
                    {/* Modal body */}
                    <form 
                    onSubmit={handleDepositUSDC}
                    className="p-4 md:p-5">
                      <div className="grid gap-4 mb-4 grid-cols-2">
                        <div className="col-span-2">
                          <label
                            htmlFor="name"
                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                          >
                            USDC Amount
                          </label>
                          <input
                            type="number"
                            name="usdc"
                            id="name"
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                            placeholder="Enter the USDC amount to deposit"
                            value={usdcAmount}
                            onChange={(e) => setUsdcAmount(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        // onClick={handleDepositUSDC}
                        className="text-white inline-flex items-center bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                      >
                        <svg
                          className="me-1 -ms-1 w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Deposit USDC
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
              </div>
              <p className='mt-8 text-teal-200'>Want to borrow USDC?</p>
              <p className='mb-8 text-teal-200 text-sm'>You can get Loan when you deposit ETH, 150% eth collateral is needed in terms of comparison with USDC</p>
              <button onClick={handleLoanRequestButton}>Request Loan</button>
              {/* <button onClick={openModal}>Request Loan</button> */}
              {/* <MemberLoanRequestModal isOpen={isModalOpen} onRequestClose={closeModal} /> */}


              <h3 className="text-3xl text-teal-200 font-bold mt-6">Laon Details</h3>
              {loanDetails.length > 0 ? (
            <table className="min-w-full border border-gray-200">
              <thead className="bg-black-200">
                <tr>
                  <th className="py-2 px-4 border-b">Loan Index</th>
                  <th className="py-2 px-4 border-b">Borrower</th>
                  <th className="py-2 px-4 border-b">Amount</th>
                  <th className="py-2 px-4 border-b">ETH Collateral</th>
                  <th className="py-2 px-4 border-b">Repayment Amount</th>
                  <th className="py-2 px-4 border-b">Due Date</th>
                  <th className="py-2 px-4 border-b">Status</th>
                  <th className="py-2 px-4 border-b">Action</th>
                </tr>
              </thead>
              <tbody>
                {loanDetails.map((loan) => (
                  <tr key={loan.LoanIndex}>
                    <td className="py-2 px-4 border-b text-center">{loan.LoanIndex}</td>
                    <td className="py-2 px-4 border-b text-center">{loan.borrower}</td>
                    <td className="py-2 px-4 border-b text-center">{loan.amount}</td>
                    <td className="py-2 px-4 border-b text-center">{loan.ethCollateral}</td>
                    <td className="py-2 px-4 border-b text-center">{loan.repaymentAmount}</td>
                    <td className="py-2 px-4 border-b text-center">{loan.dueDate}</td>
                    <td className="py-2 px-4 border-b text-center">
                      {loan.isRepaid ? 'Repaid' : loan.isDisbursed ? 'Disbursed' : loan.isApproved ? 'Approved' : 'Pending'}
                    </td>
                    <td className="py-2 px-4 border-b text-center">
                      {/* {!loan.isRepaid && (
                        <button
                          onClick={() => handleLoanRepayment(loan.borrower, loan.LoanIndex, loan.repaymentAmount)}
                          className="bg-green-500 text-white px-4 py-2 rounded"
                        >
                          Repay
                        </button>
                      )} */}

                        {loan.isRepaid ? (
                          <button
                            onClick={() => handleReturnCollateral(loan.borrower, loan.LoanIndex)}
                            className="text-white bg-green-600 hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                          >
                            Get Collateral Back
                          </button>
                        ) : (
                          <button
                            onClick={() => handleLoanRepayment(loan.borrower, loan.LoanIndex, loan.repaymentAmount)}
                            className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                          >
                            Repay Loan
                          </button>
                        )}


                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No loans found.</p>
          )}
            </>
          ) : (
            <div>
              <p>Member is not registered.Please register for membership.</p>
              <button onClick={handleRegister}>Register Now</button>
            </div>
          )}
        </div>
        <div>
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
