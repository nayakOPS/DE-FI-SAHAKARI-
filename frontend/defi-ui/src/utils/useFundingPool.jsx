import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import FundingPoolABI from '../abis/FundingPool.json';
import ERC20ABI from '../abis/IERC20.json';

const contractAddress = "0xFe857825639E70d341a86050BAb65F913cfc33bB";
const loanManagerAddress = "0x8eDBE0b59d7e3Ae967544d7C182cB090324d69c1";
const usdcAddress = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";

export const useFundingPool = (signer, signerAddress) => {
  const [contract, setContract] = useState(null);
  const [totalEth, setTotalEth] = useState(null);
  const [totalUsdc, setTotalUsdc] = useState(null);
  const [events, setEvents] = useState({
    EthDeposited: [],
    UsdcDeposited: [],
    EthWithdrawn: [],
    UsdcWithdrawn: [],
    InterestPaid: [],
    CollateralLiquidated: [],
    MemberRegistered: [],
    UsdcTransferred: [],
  });

  useEffect(() => {
    if (signer) {
      const fundingPoolContract = new ethers.Contract(
        contractAddress,
        FundingPoolABI.abi,
        signer
      );
      setContract(fundingPoolContract);

      const handleEthDeposited = (member, amount) => {
        setEvents(prevEvents => ({
          ...prevEvents,
          EthDeposited: [...prevEvents.EthDeposited, { member, amount }]
        }));
      };

      const handleUsdcDeposited = (member, amount) => {
        setEvents(prevEvents => ({
          ...prevEvents,
          UsdcDeposited: [...prevEvents.UsdcDeposited, { member, amount }]
        }));
      };

      const handleEthWithdrawn = (member, amount) => {
        setEvents(prevEvents => ({
          ...prevEvents,
          EthWithdrawn: [...prevEvents.EthWithdrawn, { member, amount }]
        }));
      };

      const handleUsdcWithdrawn = (member, amount) => {
        setEvents(prevEvents => ({
          ...prevEvents,
          UsdcWithdrawn: [...prevEvents.UsdcWithdrawn, { member, amount }]
        }));
      };

      const handleInterestPaid = (member, amount) => {
        setEvents(prevEvents => ({
          ...prevEvents,
          InterestPaid: [...prevEvents.InterestPaid, { member, amount }]
        }));
      };

      const handleCollateralLiquidated = (borrower, collateralAmount) => {
        setEvents(prevEvents => ({
          ...prevEvents,
          CollateralLiquidated: [...prevEvents.CollateralLiquidated, { borrower, collateralAmount }]
        }));
      };

      const handleMemberRegistered = (member) => {
        setEvents(prevEvents => ({
          ...prevEvents,
          MemberRegistered: [...prevEvents.MemberRegistered, { member }]
        }));
      };

      const handleUsdcTransferred = (to, amount) => {
        setEvents(prevEvents => ({
          ...prevEvents,
          UsdcTransferred: [...prevEvents.UsdcTransferred, { to, amount }]
        }));
      };

      if (contract) {
        contract.on("EthDeposited", handleEthDeposited);
        contract.on("UsdcDeposited", handleUsdcDeposited);
        contract.on("EthWithdrawn", handleEthWithdrawn);
        contract.on("UsdcWithdrawn", handleUsdcWithdrawn);
        contract.on("InterestPaid", handleInterestPaid);
        contract.on("CollateralLiquidated", handleCollateralLiquidated);
        contract.on("MemberRegistered", handleMemberRegistered);
        contract.on("UsdcTransferred", handleUsdcTransferred);
      }
      return () => {
        if (contract) {
          contract.off("EthDeposited", handleEthDeposited);
          contract.off("UsdcDeposited", handleUsdcDeposited);
          contract.off("EthWithdrawn", handleEthWithdrawn);
          contract.off("UsdcWithdrawn", handleUsdcWithdrawn);
          contract.off("InterestPaid", handleInterestPaid);
          contract.off("CollateralLiquidated", handleCollateralLiquidated);
          contract.off("MemberRegistered", handleMemberRegistered);
          contract.off("UsdcTransferred", handleUsdcTransferred);
        }
      }
    }
  }, [signer]);

  const getUSDCBalance = async (account) => {
    try {
      if (!contract) return;
      const balance = await contract.getUSDCBalance(account);
      return balance;
    } catch (error) {
      console.error('Error getting USDC balance:', error);
      throw error;
    }
  };

  const getEthBalance = async (account) => {
    try {
      if (!contract) return;
      const balance = await contract.getEthBalance(account);
      return balance;
    } catch (error) {
      console.error('Error getting ETH balance:', error);
      throw error;
    }
  };

  const approveUSDC = async (spender, amount) => {
    try {
      const usdcContract = new ethers.Contract(usdcAddress, ERC20ABI.abi, signer);
      const tx = await usdcContract.approve(spender, ethers.utils.parseUnits(amount, 6));
      await tx.wait();
      console.log('USDC Approval successful:', tx);
    } catch (error) {
      console.error('Error approving USDC:', error);
      throw error;
    }
  };

  const depositUSDC = async (amount) => {
    try {
      console.log("usefundingpool hook called for depositing usdc");
      if (!contract || !signerAddress) {
        throw new Error('Contract or signer address not available');
      }

      const usdcContract = new ethers.Contract(usdcAddress, ERC20ABI.abi, signer);
      console.log(signerAddress);
      const allowance = await usdcContract.allowance(signerAddress, contractAddress);

      // Check if allowance is sufficient
      if (allowance.lt(ethers.utils.parseUnits(amount, 6))) {
        console.log("Allowance check working");
        await approveUSDC(contractAddress, amount);
        console.log("Allowance check done");
      }

      const parsedAmount = ethers.utils.parseUnits(amount, 6); // Convert amount to string and then parse
      console.log("The Parsed Amount: ", parsedAmount);
      const tx = await contract.depositUSDC(parsedAmount);
      await tx.wait();
      console.log('USDC Deposit successful:', tx);
    } catch (error) {
      console.error('USDC Deposit Error:', error);
      throw error;
    }
  };

  const requestLoan = async (amount) => {
    try {
      if (!contract || !signerAddress) {
        throw new Error('Contract or signer address not available');
      }

      const parsedAmount = ethers.utils.parseUnits(amount, 6); // Convert amount to string and then parse
      const tx = await contract.requestLoan(parsedAmount);
      await tx.wait();
      console.log('Loan request successful:', tx);
    } catch (error) {
      console.error('Loan request error:', error);
      throw error;
    }
  };

  const approveLoan = async (loanId) => {
    try {
      if (!contract) {
        throw new Error('Contract not available');
      }

      const tx = await contract.approveLoan(loanId);
      await tx.wait();
      console.log('Loan approval successful:', tx);
    } catch (error) {
      console.error('Loan approval error:', error);
      throw error;
    }
  };

  const fetchTotalDeposits = async () => {
    try {
      const ethDeposits = await contract.totalEthDeposits();
      const usdcDeposits = await contract.totalUsdcDeposits();

      // console.log("ETH Deposits Raw:", ethDeposits);
      // console.log("USDC Deposits Raw:", usdcDeposits);

      if (!ethDeposits || !usdcDeposits) {
        throw new Error("Undefined deposit values");
      }

      setTotalEth(ethers.utils.formatEther(ethDeposits));
      setTotalUsdc(ethers.utils.formatUnits(usdcDeposits, 6));
    } catch (error) {
      console.error("Error fetching total deposits:", error);
    }
  };

  const withdrawETH = async (amount) => {
    try {
      if (!contract) {
        throw new Error('Contract not available');
      }
      const tx = await contract.withdrawETH(ethers.utils.parseEther(amount), {
        gasLimit: 3000000
      });
      await tx.wait();
      console.log('ETH Withdraw successful:', tx);
    } catch (error) {
      console.error('ETH Withdraw error:', error);
      throw error;
    }
  };

  const withdrawUSDC = async (amount) => {
    try {
      if (!contract) {
        throw new Error('Contract not available');
      }

      const tx = await contract.withdrawUSDC(ethers.utils.parseUnits(amount, 6));
      await tx.wait();
      console.log('USDC Withdraw successful:', tx);
    } catch (error) {
      console.error('USDC Withdraw error:', error);
      throw error;
    }
  };

  const payInterest = async (member) => {
    try {
      if (!contract) {
        throw new Error('Contract not available');
      }

      const tx = await contract.payInterest(member);
      await tx.wait();
      console.log('Interest payment successful:', tx);
    } catch (error) {
      console.error('Interest payment error:', error);
      throw error;
    }
  };

  const transferAllUSDC = async (to) => {
    try {
      if (!contract) {
        throw new Error('Contract not available');
      }

      const tx = await contract.transferAllUSDC(to);
      await tx.wait();
      console.log('USDC Transfer successful:', tx);
    } catch (error) {
      console.error('USDC Transfer error:', error);
      throw error;
    }
  };

  const approveLoanManager = async (amount) => {
    if (contract && signer) {
      try {
        const parsedAmount = ethers.utils.parseUnits(amount.toString(), 6);
        const tx = await contract.approveLoanManager(parsedAmount);
        await tx.wait();
        console.log('Transaction successful:', tx);
      } catch (error) {
        console.error('Error approving loan manager:', error);
      }
    } else {
      console.error('Contract or signer is not initialized');
    }
  };


  // Function to ensure sufficient allowance for loan repayment
  const ensureAllowanceForRepayment = async (amount) => {
    try {
      if (!contract || !signerAddress) {
        throw new Error('Contract or signer address not available');
      }

      const usdcContract = new ethers.Contract(usdcAddress, ERC20ABI.abi, signer);
      const allowance = await usdcContract.allowance(signerAddress, loanManagerAddress);
      const parsedAmount = ethers.utils.parseUnits(amount, 6);

      // Check if allowance is sufficient
      if (allowance.lt(parsedAmount)) {
        console.log('Allowance check working');
        const approveTx = await usdcContract.approve(loanManagerAddress, parsedAmount);
        await approveTx.wait();
        console.log('Allowance approved');
      }

      return true;
    } catch (error) {
      console.error('Error ensuring allowance for repayment:', error);
      return false;
    }
  };

  return {
    getUSDCBalance,
    getEthBalance,
    depositUSDC,
    requestLoan,
    approveLoan,
    fetchTotalDeposits,
    totalEth,
    totalUsdc,
    // depositETH,
    withdrawETH,
    withdrawUSDC,
    payInterest,
    transferAllUSDC,
    approveLoanManager,
    ensureAllowanceForRepayment,
    events
  };
};
