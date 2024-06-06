// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./FundingPool.sol";

// this LoanManager.sol contract handles loan requests, approvals, disbursements, and repayments. It also interacts with a FundingPool contract for managing funds.

contract LoanManager {
    struct Loan {
        address borrower;
        uint256 amount;
        uint256 repaymentAmount;
        bool isApproved;
        bool isRepaid;
    }

    // fundingPool is the instance of the contract to interact with
    FundingPool fundingPool;

    // Maps each borrower to an array of their loans.
    mapping(address => Loan[]) public loans;

    // intializes the 'FundingPool' instance with the provided address
    constructor(address _fundingPoolAddress) {
        fundingPool = FundingPool(_fundingPoolAddress);
    }

    // Requesting a Loan
    function requestLoan(uint256 _amount, uint256 _repaymentAmount) public {
        // this require statmenet ensure that borrower has sufficient balance for collateral in fundingpool
        require(fundingPool.getBalance(msg.sender) >= _amount, "Insufficient balance for collateral.");
        // for adding new loan request to the borrower's array of loans
        loans[msg.sender].push(Loan(msg.sender, _amount, _repaymentAmount, false, false));
    }

    // Approving a Loan
    // _loanIndex is the index of the loan in the borrower's loans array
    function approveLoan(address _borrower, uint256 _loanIndex) public {
        Loan storage loan = loans[_borrower][_loanIndex];
        require(!loan.isApproved, "Loan is already approved.");
        loan.isApproved = true;
    }

    // this disburseLoan transfer the loan amount from cooperative's funding pool to the borrower
    function disburseLoan(address _borrower, uint256 _loanIndex) public {
        // retrieving the loan details from loans mapping using the borrower's address and the loan index
        Loan storage loan = loans[_borrower][_loanIndex];
        require(loan.isApproved, "Loan is not approved.");
        require(!loan.isRepaid, "Loan is already repaid.");
        fundingPool.withdraw(loan.amount);
        payable(_borrower).transfer(loan.amount);
    }


    // function for allowing a borrower to repay the loan
    function repayLoan(address _borrower, uint256 _loanIndex) public payable {
        Loan storage loan = loans[_borrower][_loanIndex];
        require(msg.value == loan.repaymentAmount, "Incorrect repayment amount.");
        loan.isRepaid = true;
        // deposits the repayment ammount into the FundingPool
        fundingPool.deposit{value: msg.value}();
    }

    // function for returning the array of loans associated with the specific borrower
    function getLoans(address _borrower) public view returns (Loan[] memory) {
        return loans[_borrower];
    }
}


/* 
Suppose we have three loans for two different borrowers:
{
  0xABC...123: [
    Loan("Alice", 0xABC...123, 1000, 1100, true, false),
    Loan("Alice", 0xABC...123, 500, 550, false, false)
  ],
  0xDEF...456: [
    Loan("Bob", 0xDEF...456, 2000, 2200, true, true)
  ]
}

Calling getLoans with 0xABC...123 would return:
[
  Loan("Alice", 0xABC...123, 1000, 1100, true, false),
  Loan("Alice", 0xABC...123, 500, 550, false, false)
]
 */