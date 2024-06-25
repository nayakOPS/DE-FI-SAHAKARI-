// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract MemberRegistry is Ownable, Pausable, AccessControl{
    struct Member {
        string name;
        address memberAddress;
        bool isRegistered;
    }

    bytes32 public constant MEMBER_ROLE = keccak256("MEMBER_ROLE");

    mapping(address => Member) public members;
    //memmbers mapping would be like this after registration of members
    /* {
    members[0xABC...123]: Member("Alice", 0xABC...123, true),
    members[0xDEF...456]: Member("Bob", 0xDEF...456, true)
    } */

    address[] public memberList; //keeps the list of all the registered members

     // Event logging for emitting events
    event MemberRegistered(address indexed memberAddress, string name);

     constructor() Ownable(msg.sender) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MEMBER_ROLE, msg.sender); // Setup MEMBER_ROLE as well
        // grantRole(MEMBER_ROLE, msg.sender);
        transferOwnership(msg.sender); // Sets the deployer as the initial owner
    }

    // Modifier to check if the member is not already registered
    modifier notRegistered() {
        require(!members[msg.sender].isRegistered, "Member is already registered.");
        _;
    }

    // Function to register a new member
    function registerMember(string memory _name) public whenNotPaused notRegistered{
        // Check if the name is not empty
        //  below bytes().length converts the string into bytes and then etrieves the length of those bytes.
        require(bytes(_name).length > 0, "Name cannot be empty.");
         // Update the mapping in blockchain storage
        members[msg.sender] = Member(_name, msg.sender, true);
        // Update the member list in blockchain storage
        memberList.push(msg.sender);
        _grantRole(MEMBER_ROLE, msg.sender);
        // Emit event for member registration
        emit MemberRegistered(msg.sender, _name);
    }

    // Function to get member details (only callable by the owner)
    function getMember(address _memberAddress) public view onlyOwner returns (Member memory) {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender) || hasRole(MEMBER_ROLE, msg.sender), "Caller is not authorized.");
        return members[_memberAddress];
    }


    // Function to get all members (only callable by the owner)
    function getAllMembers() public view onlyOwner returns (address[] memory) {
        // we can add functionalities like only certain role member cann access member details
        return memberList;
    }

    // Function to pause the contract
    function pause() public onlyOwner {
        _pause();
    }

    // Function to unpause the contract
    function unpause() public onlyOwner {
        _unpause();
    }

    // we can add function to transfer ownership of this contract
    // USDC token address for the ethereum netwrok : Ethereum Sepolia	0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238
}