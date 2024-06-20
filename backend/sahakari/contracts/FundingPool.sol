// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./MemberRegistry.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// fundingPool contract allows registerd members to deposit and withdraw USDC tokens,keep track of each member balance
contract FundingPool {
    // usdc instance of the usdc token 
    IERC20 public usdc;
    // memberRegistry is the instance of contract MemberRegistry
    MemberRegistry memberRegistry;
    mapping(address => uint256) public ethBalances;
    mapping(address => uint256) public usdcBalances;
    uint256 public totalEthDeposits;
    uint256 public totalUsdcDeposits;

    /* 
    The FundingPool contract is initialized with the address of a MemberRegistry contract.
    This connection enables it to verify the membership status of users before processing deposit and withdrawal requests.
     */
    constructor(address _memberRegistryAddress, address usdcAddress) {
        memberRegistry = MemberRegistry(_memberRegistryAddress);
         usdc = IERC20(usdcAddress);
    }


    // Members can deposit funds into their accounts by calling the deposit function and sending Ether along with the transaction.
    function depositETH() public payable {
        // checking if the sender is a registered member by querying the 'MemberRegistry`
        require(memberRegistry.getMember(msg.sender).isRegistered, "Only registered members can deposit.");
        // adding the ether amount to the pool
        ethBalances[msg.sender] += msg.value;
        totalEthDeposits += msg.value;
    }

      function depositUSDC(uint256 _amount) public {
        require(memberRegistry.getMember(msg.sender).isRegistered, "Only registered members can deposit.");
        require(usdc.transferFrom(msg.sender, address(this), _amount), "Transfer failed.");
        usdcBalances[msg.sender] += _amount;
        totalUsdcDeposits += _amount;
    }

    // registered Member can withdraw
    function withdrawETH(uint256 _amount) public {
        require(memberRegistry.getMember(msg.sender).isRegistered, "Only registered members can withdraw.");
        require(ethBalances[msg.sender] >= _amount, "Insufficient balance.");
        ethBalances[msg.sender] -= _amount;
        totalEthDeposits -= _amount;
        payable(msg.sender).transfer(_amount);
    }

    function withdrawUSDC(uint256 _amount) public {
        require(memberRegistry.getMember(msg.sender).isRegistered, "Only registered members can withdraw.");
        require(usdcBalances[msg.sender] >= _amount, "Insufficient balance.");
        usdcBalances[msg.sender] -= _amount;
        totalUsdcDeposits -= _amount;
        require(usdc.transfer(msg.sender, _amount), "Transfer failed.");
    }

    //registered member can query thier balamce by calling the function , providing their address as the param
    function getEthBalance(address _memberAddress) public view returns (uint256) {
        return ethBalances[_memberAddress];
    }

    function getUSDCBalance(address _memberAddress) public view returns (uint256) {
        return usdcBalances[_memberAddress];
    }
    // function related to distributing the inerest, ---need to work on it
}