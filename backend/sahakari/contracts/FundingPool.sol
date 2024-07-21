// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "./MemberRegistry.sol";
import "./IERC20.sol";
import "./LoanManager.sol";
import "./FinanceProcessor.sol";

// FundingPool manages deposits and balances
contract FundingPool {
    IERC20 public usdcToken; // USDC token instance
    MemberRegistry public memberRegistry;
    LoanManager public loanManager;
    FinanceProcessor public financeProcessor;

    // Mappings to track ETH and USDC balances of each member
    mapping(address => uint256) public ethBalances;
    mapping(address => uint256) public usdcBalances;
    mapping(address => uint256) public usdcInterestAccrued;

    uint256 public totalEthDeposits;
    uint256 public totalUsdcDeposits;

    // Events
    event EthDeposited(address indexed member, uint256 amount);
    event UsdcDeposited(address indexed member, uint256 amount);
    event EthWithdrawn(address indexed member, uint256 amount);
    event UsdcWithdrawn(address indexed member, uint256 amount);
    event InterestPaid(address indexed member, uint256 amount);
    event CollateralLiquidated(address indexed borrower, uint256 collateralAmount);
    event MemberRegistered(address indexed member);
    event UsdcTransferred(address indexed to, uint256 amount);

    // Constructor initializes the contract with addresses for the MemberRegistry and USDC contract
    constructor(address _memberRegistryAddress, address _usdcAddress) {
        memberRegistry = MemberRegistry(_memberRegistryAddress);
        usdcToken = IERC20(_usdcAddress);
    }

    // Function to set the LoanManager contract address
    function setLoanManager(address _loanManagerAddress) public {
        loanManager = LoanManager(_loanManagerAddress);
    }

    // Function to set the FinanceProcessor contract address
    function setFinanceProcessor(address _financeProcessorAddress) public {
        financeProcessor = FinanceProcessor(_financeProcessorAddress);
    }

      // Function to approve LoanManager to spend USDC tokens
    function approveLoanManager(uint256 amount) public {
        usdcToken.approve(address(loanManager), amount);
    }
    
    // Function to register a member
    function registerMember(address _member) public {
        require(memberRegistry.getMember(_member).isRegistered, "Member not registered.");
        emit MemberRegistered(_member);
    }

    // Members can deposit ETH into the pool as collateral
    function depositETH() public payable {
        ethBalances[msg.sender] += msg.value;
        totalEthDeposits += msg.value;
        emit EthDeposited(msg.sender, msg.value);
    }

    // Members can deposit USDC into the pool
    function depositUSDC(uint256 _amount) public {
         // Ensure the contract is approved to spend _amount USDC on behalf of msg.sender
        require(usdcToken.allowance(msg.sender, address(this)) >= _amount, "Allowance not sufficient.");

        require(usdcToken.transferFrom(msg.sender, address(this), _amount), "Transfer failed.");
        usdcBalances[msg.sender] += _amount;
        totalUsdcDeposits += _amount;
        emit UsdcDeposited(msg.sender, _amount);
    }

    // Members can withdraw ETH from the pool if they have repaid their loans
    function withdrawETH(address _borrower, uint256 _amount) public {
        require(ethBalances[_borrower] >= _amount, "Insufficient balance.");
        require(loanManager.hasRepaidLoans(_borrower), "Outstanding loan must be repaid before withdrawing.");
        ethBalances[_borrower] -= _amount;
        totalEthDeposits -= _amount;
        payable(_borrower).transfer(_amount);
        emit EthWithdrawn(_borrower, _amount);
    }

    // Members can withdraw USDC from the pool
    function withdrawUSDC(uint256 _amount) public {
        require(usdcBalances[msg.sender] >= _amount, "Insufficient balance.");

        // Check FundingPool balance
        uint256 fundingPoolBalance = usdcToken.balanceOf(address(this));
        require(fundingPoolBalance >= _amount, "Insufficient balance in FundingPool.");

        // Update internal balances
        usdcBalances[msg.sender] -= _amount;
        totalUsdcDeposits -= _amount;

        // Approve the transfer from the FundingPool to the member
        usdcToken.approve(msg.sender, _amount);

        require(usdcToken.transfer(msg.sender, _amount), "Transfer failed.");
        emit UsdcWithdrawn(msg.sender, _amount);
    }

    // Function to deposit collateral (ETH) for a member
     function depositCollateral(address borrower) external payable {
        ethBalances[borrower] += msg.value;
        totalEthDeposits += msg.value;
        emit EthDeposited(msg.sender, msg.value);
    }

      function increaseTotalUsdcDeposits(uint256 amount) external {
        totalUsdcDeposits += amount;
    }

    function decreaseTotalUsdcDeposits(uint256 amount) external {
        require(totalUsdcDeposits >= amount, "Insufficient USDC deposits");
        totalUsdcDeposits -= amount;
    }

    // Function to query ETH balance of a member
    function getEthBalance(address _memberAddress) public view returns (uint256) {
        return ethBalances[_memberAddress];
    }

    // Function to query USDC balance of a member
    function getUSDCBalance(address _memberAddress) public view returns (uint256) {
        return usdcBalances[_memberAddress];
    }

    // Function to distribute interest
    function distributeInterest() public {
        financeProcessor.distributeInterest();
    }

    // Function to pay interest to a member
    function payInterest(address _member) public {
        uint256 interest = financeProcessor.getUSDCInterestAccrued(_member);
        if (interest > 0) {
            usdcBalances[_member] += interest;
            emit InterestPaid(_member, interest);
        }
    }

    // Function to liquidate collateral for a borrower and loan index
    function liquidateCollateral(address _borrower, uint256 _loanIndex) public {
        financeProcessor.liquidateCollateral(_borrower, _loanIndex);
    }

    // Function to add USDC balance for a member
    function addUSDCBalance(address _member, uint256 _amount) external {
        usdcBalances[_member] += _amount;
    }

    // Function to get USDC interest accrued for a member
    function getUSDCInterestAccrued(address _member) external view returns (uint256) {
        return usdcInterestAccrued[_member];
    }

     // Function to transfer all USDC from the contract to a specified address (e.g., your wallet)
    function transferAllUSDC(address _to) public {
        uint256 balance = usdcToken.balanceOf(address(this));
        require(balance > 0, "No USDC to transfer.");
        require(usdcToken.transfer(_to, balance), "Transfer failed.");
        emit UsdcTransferred(_to, balance);
    }

}
