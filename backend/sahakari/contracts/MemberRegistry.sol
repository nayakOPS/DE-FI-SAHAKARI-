// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

contract MemberRegistry {
    struct Member {
        string name;
        address memberAddress;
        bool isRegistered;
    }

    mapping(address => Member) public members;
    address[] public memberList;

    event MemberRegistered(address indexed memberAddress, string name);


    modifier notRegistered() {
        require(!members[msg.sender].isRegistered, "Member is already registered.");
        _;
    }

    function registerMember(string memory _name) public notRegistered {
        require(bytes(_name).length > 0, "Name cannot be empty.");
        
        members[msg.sender] = Member(_name, msg.sender, true);
        memberList.push(msg.sender);
        
        emit MemberRegistered(msg.sender, _name);
    }

    function getMember(address _memberAddress) public view returns (Member memory) {
        return members[_memberAddress];
    }

    function getAllMembers() public view returns (address[] memory) {
        return memberList;
    }
}
