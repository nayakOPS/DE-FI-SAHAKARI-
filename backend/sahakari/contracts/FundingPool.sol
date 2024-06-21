// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./MemberRegistry.sol";
import "./IERC20.sol";
import "./LoanManager.sol";

// FundingPool contract allows registerd members to deposit and withdraw USDC tokens,keep track of each member balance
contract FundingPool {

    IERC20 public usdcToken; // usdc instance of the usdc token
    MemberRegistry public memberRegistry;
    LoanManager public loanManager;

    // Mappings to Track ETH and USDC balances of each member
    mapping(address => uint256) public ethBalances;
    mapping(address => uint256) public usdcBalances;
    uint256 public totalEthDeposits;
    uint256 public totalUsdcDeposits;


    // Modifier to check if the sender is a registered member
    modifier onlyRegisteredMember() {
        require(memberRegistry.getMember(msg.sender).isRegistered, "Only registered members can perform this action.");
        _;
    }

    // Constructor initializes the contract with addresses for the MemberRegistry and USDC contract Address
    constructor(address _memberRegistryAddress, address _usdcAddress) {
        memberRegistry = MemberRegistry(_memberRegistryAddress);
        usdcToken = IERC20(_usdcAddress);
    }


    // Members can deposit ETH into the pool for collateral
    function depositETH() public payable onlyRegisteredMember{
        // Update the sender's ETH balance and the total ETH deposits in the pool
        ethBalances[msg.sender] += msg.value;
        totalEthDeposits += msg.value;
    }


    // Members can deposit USDC into the funding pool
    function depositUSDC(uint256 _amount) public onlyRegisteredMember{
        // Transfer USDC from the sender to this contract
        require(usdcToken.transferFrom(msg.sender, address(this), _amount), "Transfer failed.");
        // Update the sender's USDC balance and the total USDC deposits in the pool
        usdcBalances[msg.sender] += _amount;
        totalUsdcDeposits += _amount;
    }

    // Members can withdraw ETH from the funding-pool if they have paid their loans
    function withdrawETH(uint256 _amount) public onlyRegisteredMember{
        require(ethBalances[msg.sender] >= _amount, "Insufficient balance.");
         require(loanManager.hasRepaidLoans(msg.sender), "Outstanding loan must be repaid before withdrawing.");
        ethBalances[msg.sender] -= _amount;
        totalEthDeposits -= _amount;
        // Transfer the requested amount of ETH to the sender
        payable(msg.sender).transfer(_amount);
    }


    // Members can withdraw USDC from the pool
    function withdrawUSDC(uint256 _amount) public onlyRegisteredMember{
        require(usdcBalances[msg.sender] >= _amount, "Insufficient balance.");
        // Update the sender's USDC balance and the total USDC deposits in the pool
        usdcBalances[msg.sender] -= _amount;
        totalUsdcDeposits -= _amount;
        // Transfer the requested amount of USDC to the sender
        require(usdcToken.transfer(msg.sender, _amount), "Transfer failed.");
    }

    // Members can query their ETH balance by providing their address
    function getEthBalance(address _memberAddress) public view returns (uint256) {
        return ethBalances[_memberAddress];
    }


    // Members can query their USDC balance by providing their address
    function getUSDCBalance(address _memberAddress) public view returns (uint256) {
        return usdcBalances[_memberAddress];
    }

    
    // function related to distributing the inerest, ---need to work on it
}