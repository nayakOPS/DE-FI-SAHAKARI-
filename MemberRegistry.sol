// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MemberRegistry {
    // this struct stores Member details: name, memberAddress, isRegistered
    struct Member {
        string name;
        address memberAddress;
        bool isRegistered;
    }

    mapping(address => Member) public members;
    // mapping is similar to dictionary of python
    // we have address as key and struct Member as value
    // this memmbers mapping would be like this after registration of members

    /* {
    members[0xABC...123]: Member("Alice", 0xABC...123, true),
    members[0xDEF...456]: Member("Bob", 0xDEF...456, true)
    } */

    address[] public memberList;

    // Modifier to check if the sender is not already registered
    modifier notRegistered() {
        require(!members[msg.sender].isRegistered, "Member is already registered.");
        _;
    }

    // Event logging for emitting events
    // indexed memberAddress common practice to index parameters that are frequently used for filtering events
    // easy for searching specific events related to memberAddress
    event MemberRegistered(address indexed memberAddress, string name);

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

    // Function to get member details
    function getMember(address _memberAddress) public view returns (Member memory) {
        return members[_memberAddress];
    }


    // Function to get all members
    function getAllMembers() public view returns (address[] memory) {
        // we can add functionalities like only certain role member cann access member details
        return memberList;
    }
}