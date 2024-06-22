// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./FundingPool.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";


// this LoanManager.sol contract handles loan requests, approvals, disbursements, and repayments. It also interacts with a FundingPool contract for managing funds.
contract LoanManager is Ownable, Pausable{
    struct Loan {
        address borrower;
        uint256 amount;
        uint256 ethCollateral;
        uint256 repaymentAmount;
        bool isApproved;
        bool isRepaid;
    }

    // fundingPool is the instance of the contract to interact with
    FundingPool public fundingPool;
    // Maps each borrower to an array of their loans.
    mapping(address => Loan[]) public loans;
    uint256 public staticInterestRate = 5; // 5% interest rate

    // Events
    event LoanRequested(address indexed borrower, uint256 amount, uint256 ethCollateral, uint256 repaymentAmount);
    event LoanApproved(address indexed borrower, uint256 loanIndex);
    event LoanDisbursed(address indexed borrower, uint256 loanIndex, uint256 amount);
    event LoanRepaid(address indexed borrower, uint256 loanIndex, uint256 amount);


    modifier onlyRegisteredMember() {
        require(fundingPool.memberRegistry().getMember(msg.sender).isRegistered, "Only registered members can perform this action.");
        _;
    }

    // intializes the 'FundingPool' instance with the provided address
    constructor(address _fundingPoolAddress) {
        fundingPool = FundingPool(_fundingPoolAddress);
    }


    // Requesting a Loan
    function requestLoan(uint256 _amount, uint256 _ethCollateral) public onlyRegisteredMember whenNotPaused{
      // this require statmenet ensure that borrower has sufficient balance for collateral in fundingpool
        require(fundingPool.getEthBalance(msg.sender) >= _ethCollateral, "Insufficient collateral balance.");
        uint256 repaymentAmount = _amount + (_amount * staticInterestRate / 100);
        // for adding new loan request to the borrower's array of loans
        loans[msg.sender].push(Loan(msg.sender, _amount, _ethCollateral, repaymentAmount, false, false));
        emit LoanRequested(msg.sender, _amount, _ethCollateral, repaymentAmount);
    }

    // Approving a Loan
    // _loanIndex is the index of the loan in the borrower's loans array
    function approveLoan(address _borrower, uint256 _loanIndex) public onlyRegisteredMember whenNotPaused{
        Loan storage loan = loans[_borrower][_loanIndex];
        require(!loan.isApproved, "Loan is already approved.");
        loan.isApproved = true;
        emit LoanApproved(_borrower, _loanIndex);
    }

    function disburseLoan(address _borrower, uint256 _loanIndex) public onlyOwner whenNotPaused{
        Loan storage loan = loans[_borrower][_loanIndex];
        require(loan.isApproved, "Loan is not approved.");
        require(!loan.isRepaid, "Loan is already repaid.");
        fundingPool.withdrawETH(loan.ethCollateral);
        require(fundingPool.usdcToken().transfer(_borrower, loan.amount), "Transfer failed.");
        emit LoanDisbursed(_borrower, _loanIndex, loan.amount);
    }

    // function for allowing a borrower to repay the loan
     function repayLoan(address _borrower, uint256 _loanIndex, uint256 _amount) public onlyRegisteredMember whenNotPaused{
        Loan storage loan = loans[_borrower][_loanIndex];
        require(loan.isApproved, "Loan is not approved.");
        require(!loan.isRepaid, "Loan is already repaid.");
        require(fundingPool.usdcToken().transferFrom(msg.sender, address(fundingPool), _amount), "Transfer failed.");
        loan.isRepaid = true;
        emit LoanRepaid(_borrower, _loanIndex, _amount);
    }

    // function for returning the array of loans associated with the specific borrower
    function getLoans(address _borrower) public view returns (Loan[] memory) {
        return loans[_borrower];
    }
    
    function hasRepaidLoans(address _borrower) public view returns (bool) {
        Loan[] memory userLoans = loans[_borrower];
        for (uint256 i = 0; i < userLoans.length; i++) {
            if (!userLoans[i].isRepaid) {
                return false;
            }
        }
        return true;
    }
    

    // Pause and unpause functions for emergency stops
    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    // Add collateral liquidation and more functionalities
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