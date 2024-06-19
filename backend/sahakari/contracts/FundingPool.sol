// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./MemberRegistry.sol";


contract FundingPool {
    // memberRegistry is the instance of contract MemberRegistry
    MemberRegistry memberRegistry;
    mapping(address => uint256) public balances;
    uint256 public totalDeposits;

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
        totalDeposits += msg.value;
    }

    // registered Member can withdraw
    function withdraw(uint256 _amount) public {
        require(memberRegistry.getMember(msg.sender).isRegistered, "Only registered members can withdraw.");
        require(balances[msg.sender] >= _amount, "Insufficient balance.");
        balances[msg.sender] -= _amount;
        totalDeposits -= _amount;
        payable(msg.sender).transfer(_amount);
    }

    //registered member can query thier balamce by calling the function , providing their address as the param
    function getBalance(address _memberAddress) public view returns (uint256) {
        return balances[_memberAddress];
    }


    // function related to distributing the inerest, ---need to work on it
}