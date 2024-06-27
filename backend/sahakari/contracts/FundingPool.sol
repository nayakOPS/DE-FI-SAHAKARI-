// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "./MemberRegistry.sol";
import "./IERC20.sol";
import "./LoanManager.sol";
import "./FinanceProcessor.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

// FundingPool manages deposits and balances
// FundingPool contract allows registerd members to deposit and withdraw USDC tokens,keep track of each member balance
contract FundingPool is Ownable, Pausable, AccessControl {

    IERC20 public usdcToken; // usdc instance of the usdc token
    MemberRegistry public memberRegistry;
    LoanManager public loanManager;
    FinanceProcessor public financeProcessor;

    // Role definitions
    bytes32 public constant MEMBER_ROLE = keccak256("MEMBER_ROLE");

    // Mappings to Track ETH and USDC balances of each member
    mapping(address => uint256) public ethBalances;
    mapping(address => uint256) public usdcBalances;
    mapping(address => uint256) public usdcInterestAccrued; // Track USDC interest accrued for each member

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


    // Modifier to check if the sender is a registered member, who have been assigned the 'MEMBER_ROLE'
    modifier onlyRegisteredMember() {
        require(memberRegistry.getMember(msg.sender).isRegistered, "Only registered members can perform this action.");
        // the sender must have been granted the 'MEMBER_ROLE' 
        require(hasRole(MEMBER_ROLE, msg.sender), "Caller is not a registered member.");
        _;
    }

    // Constructor initializes the contract with addresses for the MemberRegistry and USDC contract Address
    constructor(address _memberRegistryAddress, address _usdcAddress){
        memberRegistry = MemberRegistry(_memberRegistryAddress);
        usdcToken = IERC20(_usdcAddress);
       
        // Grant the contract deployer the admin role
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function setLoanManager(address _loanManagerAddress) public onlyOwner {
        loanManager = LoanManager(_loanManagerAddress);
    }

    function setFinanceProcessor(address _financeProcessorAddress) public onlyOwner {
        financeProcessor = FinanceProcessor(_financeProcessorAddress);
    }


    // Function to assign MEMBER_ROLE to a registered member, by an admin
    function registerMember(address _member) public onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(MEMBER_ROLE, _member);
        emit MemberRegistered(_member);
    }

    // Members can deposit ETH into the pool as collateral
    function depositETH() public payable onlyRegisteredMember whenNotPaused{
        // Update the sender's ETH balance and the total ETH deposits in the pool
        ethBalances[msg.sender] += msg.value;
        totalEthDeposits += msg.value;
        emit EthDeposited(msg.sender, msg.value);
    }


    // Members can deposit USDC into the funding pool
    function depositUSDC(uint256 _amount) public onlyRegisteredMember whenNotPaused{
        // Transfer USDC from the sender to this contract
        require(usdcToken.transferFrom(msg.sender, address(this), _amount), "Transfer failed.");
        // Update the sender's USDC balance and the total USDC deposits in the pool
        usdcBalances[msg.sender] += _amount;
        totalUsdcDeposits += _amount;
        emit UsdcDeposited(msg.sender, _amount);
    }

    // Members can withdraw ETH from the funding-pool if they have paid their loans
    function withdrawETH(uint256 _amount) public onlyRegisteredMember whenNotPaused{
        require(ethBalances[msg.sender] >= _amount, "Insufficient balance.");
        // ensures that borrowers can only withdraw their collateral if they have repaid all their loans
        require(loanManager.hasRepaidLoans(msg.sender), "Outstanding loan must be repaid before withdrawing.");
        ethBalances[msg.sender] -= _amount;
        totalEthDeposits -= _amount;
        // Transfer the requested amount of ETH to the sender
        payable(msg.sender).transfer(_amount);
        emit EthWithdrawn(msg.sender, _amount);
    }


    // Members can withdraw USDC from the pool
    function withdrawUSDC(uint256 _amount) public onlyRegisteredMember whenNotPaused{
        require(usdcBalances[msg.sender] >= _amount, "Insufficient balance.");
        // Update the sender's USDC balance and the total USDC deposits in the pool
        usdcBalances[msg.sender] -= _amount;
        totalUsdcDeposits -= _amount;
        // Transfer the requested amount of USDC to the sender
        require(usdcToken.transfer(msg.sender, _amount), "Transfer failed.");
        emit UsdcWithdrawn(msg.sender, _amount);
    }


    function depositCollateral(address _member) public payable onlyRegisteredMember whenNotPaused {
        ethBalances[_member] += msg.value;
        totalEthDeposits += msg.value;
        emit EthDeposited(_member, msg.value);
    }

    // Members can query their ETH balance by providing their address
    function getEthBalance(address _memberAddress) public view returns (uint256) {
        return ethBalances[_memberAddress];
    }


    // Members can query their USDC balance by providing their address
    function getUSDCBalance(address _memberAddress) public view returns (uint256) {
        return usdcBalances[_memberAddress];
    }

     function distributeInterest() public onlyOwner {
        financeProcessor.distributeInterest();
    }

    // Pay interest to a specific member using the finance processor
    function payInterest(address _member) public onlyOwner {
        uint256 interest = financeProcessor.getUSDCInterestAccrued(_member);
        if (interest > 0) {
            usdcBalances[_member] += interest;
            emit InterestPaid(_member, interest);
        }
    }

    // Liquidate collateral for a specific borrower and loan index using the finance processor
    function liquidateCollateral(address _borrower, uint256 _loanIndex) public onlyOwner {
        financeProcessor.liquidateCollateral(_borrower, _loanIndex);
    }

     // Add USDC balance for a member (external call)
    function addUSDCBalance(address _member, uint256 _amount) external {
        usdcBalances[_member] += _amount;
    }

    // Get USDC interest accrued for a member (external view)
    function getUSDCInterestAccrued(address _member) external view returns (uint256) {
        return usdcInterestAccrued[_member];
    }
    // Pause and unpause functions for emergency stops
    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }
    
    // function related to distributing the inerest, ---need to work on it
}