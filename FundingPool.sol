// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./MemberRegistry.sol";

/* 
This FundingPool.sol contract manages the funds deposited and withdrawn by registered members of the cooperative.
This contract interacts with a MemberRegistry contract for verification of registered members 
 */



contract FundingPool {
    // memberRegistry is the instance of contract MemberRegistry
    MemberRegistry memberRegistry;
    mapping(address => uint256) public balances;

    /* 
    The FundingPool contract is initialized with the address of a MemberRegistry contract.
    This connection enables it to verify the membership status of users before processing deposit and withdrawal requests.
     */
    constructor(address _memberRegistryAddress) {
        memberRegistry = MemberRegistry(_memberRegistryAddress);
    }


    // Members can deposit funds into their accounts by calling the deposit function and sending Ether along with the transaction.
    function deposit() public payable {
        // checking if the sender is a registered member by querying the 'MemberRegistry`
        require(memberRegistry.getMember(msg.sender).isRegistered, "Only registered members can deposit.");
        // adding the ether amount to the pool
        balances[msg.sender] += msg.value;
    }

    // registered Mmber can withdraw
    function withdraw(uint256 _amount) public {
        require(memberRegistry.getMember(msg.sender).isRegistered, "Only registered members can withdraw.");
        require(balances[msg.sender] >= _amount, "Insufficient balance.");
        balances[msg.sender] -= _amount;
        payable(msg.sender).transfer(_amount);
    }

    //registered member can query thier balamce by calling the function , providing their address as the param
    function getBalance(address _memberAddress) public view returns (uint256) {
        return balances[_memberAddress];
    }
}