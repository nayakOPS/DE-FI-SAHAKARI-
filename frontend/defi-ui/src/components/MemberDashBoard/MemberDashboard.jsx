import React, { useState, useEffect, useMemo } from 'react';
import { ethers } from 'ethers';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../../utils/Web3Provider';
import { useMemberRegistry } from '../../utils/useMemberRegistry';
import { useFundingPool } from '../../utils/useFundingPool';
import Navigation from '../../components/Navigations';
import { useLoanManager } from '../../utils/useLoanManager';
import Modal from "../AdminDahBoard/Modal";
// import MemberLoanRequestModal from './MemberLoanRequestModal';
import Alert from '../Alerts';

import TransactionHash from '../TransactionHash';

const Dashboard = () => {
  const { signer, account, connectWallet } = useWeb3();
  const memberRegistryContract = useMemberRegistry(signer);
  const { events, getUSDCBalance, getEthBalance, depositUSDC, requestLoan, approveLoanManager, ensureAllowanceForRepayment, withdrawETH, withdrawUSDC } = useFundingPool(signer, account);
  const { getLoans, repayLoan, loanManagerContract, returnCollateral } = useLoanManager(signer);
  const [isRegistered, setIsRegistered] = useState(false);
  const [memberDetails, setMemberDetails] = useState(null);
  const [usdcBalance, setUsdcBalance] = useState(0);
  const [ethCollateral, setEthCollateral] = useState(0);
  const [usdcAmount, setUsdcAmount] = useState('');
  const [loanDetails, setLoanDetails] = useState([]);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');

  const [issModalOpen, setModalOpen] = useState(false);
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  }

  const totalEthCollateral = useMemo(() => {
    return loanDetails.reduce((total, loan) => total + loan.ethCollateral, 0);
  }, [loanDetails]);

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

      const approved = await approveLoanManager(amount);
      console.log("Successfullly Approved laon manager contract in behalf of funding pool:", approved);

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
    console.log("LoanIndex: ", loanIndex, "borrowr: ", borrower);
    try {
      await returnCollateral(borrower, loanIndex);
    }
    catch (error) {
      console.error('Return Collateral Error:', error);
    }
  };

  /*   const handleReturnCollateral = async (ethCollateral) => {
      // console.log("LoanIndex: ", loanIndex, "borrowr: ", borrower);
      try {
         await withdrawETH(ethCollateral)
      }
      catch (error) {
        console.error('Return Collateral Error:', error);
      }
    };
   */

  const handleWithdrawUSDC = async () => {
    try {
      await withdrawUSDC(withdrawAmount);
      fetchBalances();
      setWithdrawAmount('')
    } catch (error) {
      console.error('Withdraw USDC Error:', error);
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
      <div className='flex flex-col items-center justify-center min-h-screen'>
        <h1>Please connect your wallet</h1>
        <button className='mt-4' onClick={handleConnectWallet}>Connect Wallet</button>
      </div>
    );
  }

  return (
    <div className='bg-black bg-opacity-90'>
      <div className='w-5/6 m-auto min-h-screen' >
        <Navigation />
        <div className='mt-16 py-4'>
          {events.UsdcDeposited.map((event, index) => (
            <div className='inline'>
              <Alert status="succcess" message={`${ethers.utils.formatUnits(event.amount, 6)} USDC deposit successfull`} />
            </div>
          ))}
          {events.UsdcWithdrawn.map((event, index) => (
            <div className='inline'>
              <Alert status="danger" message={`${ethers.utils.formatUnits(event.amount, 6)} USDC withdrawn`} />
            </div>
          ))}
          <div className='flex justify-between'>
            <h1 className="text-3xl text-teal-200 font-bold mb-12 inline">Member Dashboard</h1>
            {events.UsdcDeposited.map((event, index) => (
              <div className='inline'>
                <Alert status="succcess" message={`${ethers.utils.formatUnits(event.amount, 6)} USDC deposit successfull`} />
              </div>
            ))}
            {events.UsdcWithdrawn.map((event, index) => (
              <div className='inline'>
                <Alert status="danger" message={`${ethers.utils.formatUnits(event.amount, 6)} USDC withdrawn`} />
              </div>
            ))}
          </div>
          {isRegistered ? (
            < >
              <div className='flex flex-row'>
                <div className='bg-slate-50  rounded-2xl px-12 py-8 text-black w-2/4 mr-4'>
                  <p className='font-bold text-xl'>Member Details</p>
                  <p className='mt-8 font-bold text-2xl'>{memberDetails.name}</p>
                  <p ><span className='text-sm text-slate-800'> {memberDetails.memberAddress}</span></p>
                </div>
                <div className='text-slate-700 mr-4 flex-1'>
                  {/* <p>Registered: {memberDetails.isRegistered ? 'Yes' : 'No'}</p> */}
                  <div className='bg-slate-50 rounded-2xl px-12 py-8 mb-2 text-center'>
                    <p>{ethers.utils.formatUnits(usdcBalance, 6)}</p>
                    <p className='font-bold'>USDC Balance</p>
                  </div>

                  <div className='bg-slate-50 rounded-2xl px-12 py-8 text-center'>
                    <p>{totalEthCollateral}</p>
                    <p className='font-bold'>ETH Collateral</p>
                  </div>
                </div>

                <div>
                  {/* Modal toggle */}
                  <div className="mb-6 flex flex-col gap-2">
                    <h3 className='font-bold'>Withdraw USDC</h3>
                    <input
                      type="number"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      placeholder="Amount in USDC"
                      className="bg-gray-50 mb-2 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                    />
                    <button
                      className="block w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                      onClick={handleWithdrawUSDC}
                    >Withdraw USDC</button>
                  </div>

                  <button
                    onClick={toggleModal}
                    className="block py-8 w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
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
                          <div className="flex items-center justify-between p-4 md:p-5  rounded-t dark:border-gray-600">
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
                              className="text-white py-2.5 inline-flex items-center bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
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
              <div className=' items-center'>
                <div className='flex flex-col flex-1'>
                  <p className='mt-8 text-teal-200 font-bold'>Want to borrow USDC?</p>
                  <p className='mb-4 text-sm'>You can get Loan when you deposit ETH, 150% eth collateral is needed in terms of comparison with USDC</p>
                </div>
                <div>
                  <button className='text-white py-2.5 inline-flex items-center bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800' onClick={handleLoanRequestButton}>Request Loan</button>
                </div>
              </div>
              <h3 className="text-3xl text-teal-200 font-bold mt-8">Loan Details</h3>
              {loanDetails.length > 0 ? (
                <div className="relative overflow-x-auto shadow-md sm:rounded-lg mt-8">
                  <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                      <tr>
                        <th className="py-2 px-4">Loan Index</th>
                        <th className="py-2 px-4">Amount</th>
                        <th className="py-2 px-4">ETH Collateral</th>
                        <th className="py-2 px-4">Repayment Amount</th>
                        <th className="py-2 px-4">Due Date</th>
                        <th className="py-2 px-4">Status</th>
                        <th className="py-2 px-4">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loanDetails.map((loan) => (
                        <tr key={loan.LoanIndex} className='bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'>
                          <td className="py-2 px-4">{loan.LoanIndex}</td>
                          <td className="py-2 px-4">{loan.amount}</td>
                          <td className="py-2 px-4">{loan.ethCollateral}</td>
                          <td className="py-2 px-4">{loan.repaymentAmount}</td>
                          <td className="py-2 px-4">{loan.dueDate}</td>
                          <td className="py-2 px-4">
                            {loan.isRepaid ? 'Repaid' : loan.isDisbursed ? 'Disbursed' : loan.isApproved ? 'Approved' : 'Pending'}
                          </td>
                          <td className="py-2 px-4 ">
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
                                // onClick={ () => handleReturnCollateral(loan.ethCollateral)}
                                // className="text-white bg-green-600 hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                                className={`text-white font-medium rounded-lg mx-4 text-sm px-5 py-2.5 text-center ${loan.ethCollateral === "0.0" ? "bg-gray-600 cursor-not-allowed" : "bg-green-600 hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-green-300"}`}
                                disabled={loan.ethCollateral !== "0.000000"}
                              >
                                {/* {console.log("the eth colateral: ", loan.ethCollateral)} */}
                                {loan.ethCollateral === "0.000000" ? (
                                  "Get Collateral Back"
                                ) : (
                                  "Collateral Already Gained"
                                )}
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
                </div>
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
    </div>
  );
};

export default Dashboard;
