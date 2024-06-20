// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MemberRegistry {
    struct Member {
        string name;
        address memberAddress;
        bool isRegistered;
    }

    mapping(address => Member) public members;
    //memmbers mapping would be like this after registration of members
    /* {
    members[0xABC...123]: Member("Alice", 0xABC...123, true),
    members[0xDEF...456]: Member("Bob", 0xDEF...456, true)
    } */

    address[] public memberList; //keeps the list of all the registered members

    address public owner; // Address of the contract deployer

    // Modifier to check if the member is not already registered
    modifier notRegistered() {
        require(!members[msg.sender].isRegistered, "Member is already registered.");
        _;
    }

    // Modifier to check if the caller is the owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not the owner.");
        _;
    }

    // Event logging for emitting events
    // indexed memberAddress common practice to index parameters that are frequently used for filtering events
    // easy for searching specific events related to memberAddress
    event MemberRegistered(address indexed memberAddress, string name);

    // Constructor to set the deployer as the initial owner
    constructor() {
        owner = msg.sender;
    }
    // Function to register a new member
    function registerMember(string memory _name) public notRegistered{
        // Check if the name is not empty
        //  below bytes().length converts the string into bytes and then etrieves the length of those bytes.
        require(bytes(_name).length > 0, "Name cannot be empty.");

         // Update the mapping in blockchain storage
        members[msg.sender] = Member(_name, msg.sender, true);

        // Emit event for member registration
        emit MemberRegistered(msg.sender, _name);

        // Update the member list in blockchain storage
        memberList.push(msg.sender);
    }

    // Function to get member details (only callable by the owner)
    function getMember(address _memberAddress) public view onlyOwner returns (Member memory) {
        return members[_memberAddress];
    }


    // Function to get all members (only callable by the owner)
    function getAllMembers() public view onlyOwner returns (address[] memory) {
        // we can add functionalities like only certain role member cann access member details
        return memberList;
    }

    // we can add function to transfer ownership of this contract
    // USDC token address for the ethereum netwrok : Ethereum Sepolia	0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238
}