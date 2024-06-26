// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "./FundingPool.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./EthPriceConsumerV3.sol";



// this LoanManager.sol contract handles loan requests, approvals, disbursements, and repayments. It also interacts with a FundingPool contract for managing funds.
contract LoanManager is Ownable, Pausable, AccessControl{
    EthPriceConsumerV3 internal priceConsumer; // creating a state var of type of PriceConsumerV3 which holds instance of the  PriceConsumerV3 contract.

    struct Loan {
        address borrower;
        uint256 amount;
        uint256 ethCollateral;
        uint256 repaymentAmount;
        bool isApproved;
        bool isRepaid;
        uint256 dueDate;
    }

    // fundingPool is the instance of the contract to interact with
    FundingPool public fundingPool;
    // Maps each borrower to an array of their loans.
    mapping(address => Loan[]) public loans;
    uint256 public staticInterestRate = 5; // 5% interest rate
    uint256 public ethToUsdcRate; // ETH to USDC exchange rate
    uint256 constant COLLATERALIZATION_RATIO = 150;


    // Role definitions
    bytes32 public constant MEMBER_ROLE = keccak256("MEMBER_ROLE");

    // Events
    event LoanRequested(address indexed borrower, uint256 amount, uint256 ethCollateral, uint256 repaymentAmount);
    event LoanApproved(address indexed borrower, uint256 loanIndex);
    event LoanDisbursed(address indexed borrower, uint256 loanIndex, uint256 amount);
    event LoanRepaid(address indexed borrower, uint256 loanIndex, uint256 amount);
    event CollateralReturned(address indexed borrower, uint256 indexed loanIndex, uint256 collateralAmount);


    modifier onlyRegisteredMember() {
        require(fundingPool.memberRegistry().getMember(msg.sender).isRegistered, "Only registered members can perform this action.");
        require(hasRole(MEMBER_ROLE, msg.sender), "Caller is not a registered member.");
        _;
    }

    // intializes the 'FundingPool' instance with the provided address
    constructor(address _fundingPoolAddress, address _priceConsumerAddress){
        fundingPool = FundingPool(_fundingPoolAddress);
        priceConsumer = EthPriceConsumerV3(_priceConsumerAddress); // pass the contract address of the EthPriceConsumerV3 contract addres
        
        // Grant the contract deployer the admin role
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    // Set ETH to USDC rate using the EthPriceConsumerV3 contract
    function setEthToUsdcRate() public onlyOwner {
        int ethPriceInUsd = priceConsumer.getLatestPrice();
        require(ethPriceInUsd > 0, "Invalid price from oracle");

        // Since 1 USDC is equivalent to 1 USD, the rate is the same as the price in USD
        ethToUsdcRate = uint256(ethPriceInUsd);
    }

    // Add this internal function to calculate required ETH collateral
    function calculateEthCollateral(uint256 _usdcAmount) internal view returns (uint256) {
        // Fetch the latest ETH to USD price from the price consumer
        int ethPriceInUsd = priceConsumer.getLatestPrice();
        // Ensure the price is positive
        require(ethPriceInUsd > 0, "Invalid price from oracle");
        // Convert int to uint for calculation (after the require check)
        uint256 ethPrice = uint256(ethPriceInUsd);
        // ETH price has 8 decimals, so adjust the calculation accordingly
        uint256 ethCollateral = (_usdcAmount * 1e8 * 1e18) / ethPrice;
        // Apply collateralization ratio (150%)
        ethCollateral = ethCollateral + (ethCollateral * COLLATERALIZATION_RATIO / 100);
        return ethCollateral;
    }

    // Requesting a Loan
    function requestLoan(uint256 _amount, uint256 _dueDate) public onlyRegisteredMember whenNotPaused{
        setEthToUsdcRate(); // Ensure the latest ETH to USDC rate is fetched
        // if 50 usdc loan taken repayment amount is 55
        uint256 repaymentAmount = _amount + (_amount * staticInterestRate / 100);

        // Calculate required collateral
        uint256 ethCollateral = calculateEthCollateral(_amount);

        // this require statmenet ensure that borrower has sufficient balance for collateral in fundingpool
        require(fundingPool.getEthBalance(msg.sender) >= ethCollateral, "Insufficient collateral balance.");

         // Transfer ETH collateral to FundingPool
        //  The special syntax {value: amount} is used to send Ether along with the function call
        fundingPool.depositCollateral{value: ethCollateral}(msg.sender);

        // for adding new loan request to the borrower's array of loans
        loans[msg.sender].push(Loan({
            borrower: msg.sender,
            amount: _amount,
            ethCollateral: ethCollateral,
            repaymentAmount: repaymentAmount,
            isApproved: false,
            isRepaid: false,
            dueDate: _dueDate // 
        }));
        emit LoanRequested(msg.sender, _amount, ethCollateral, repaymentAmount);
    }

    // Approving a Loan
    // _loanIndex is the index of the loan in the borrower's loans array
    function approveLoan(address _borrower, uint256 _loanIndex) public onlyRegisteredMember whenNotPaused{
        Loan storage loan = loans[_borrower][_loanIndex];
        require(!loan.isApproved, "Loan is already approved.");
        loan.isApproved = true;
        emit LoanApproved(_borrower, _loanIndex);
    }

    // transfer loan amount from sahakari(contract owner) to the borrower, transfer usdc that was request and approved as a loan to the borrower's address
    function disburseLoan(address _borrower, uint256 _loanIndex) public onlyOwner whenNotPaused{
        Loan storage loan = loans[_borrower][_loanIndex];
        require(loan.isApproved, "Loan is not approved.");
        require(!loan.isRepaid, "Loan is already repaid.");

        // Transfer the loan amount in USDC from the FundingPool to the borrower
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
    

    // to check wether a borrower has repaid all thier outstanding loans
    function hasRepaidLoans(address _borrower) public view returns (bool) {
        // fetches the list of loans associated with the borrower
        Loan[] memory userLoans = loans[_borrower];
        // iterate through all the loans associated with a borrower and checks their repayment status
        for (uint256 i = 0; i < userLoans.length; i++) {
            if (!userLoans[i].isRepaid) {
                // if any loan found that is not repaid returns false
                return false;
            }
        }
        return true;
    }


    function returnCollateral(address _borrower, uint256 _loanIndex) public onlyOwner whenNotPaused {
        Loan storage loan = loans[_borrower][_loanIndex];
        require(loan.isApproved, "Loan is not approved.");
        require(loan.isRepaid, "Loan is not repaid.");

        uint256 collateralAmount = loan.ethCollateral;
        loan.ethCollateral = 0; // Reset the collateral to avoid double withdrawals
        fundingPool.withdrawETH(collateralAmount);
        emit CollateralReturned(_borrower, _loanIndex, collateralAmount);
    }

    
    function setLoanAsRepaid(address _borrower, uint256 _loanIndex) public onlyOwner {
        loans[_borrower][_loanIndex].isRepaid = true;
    }

    // Pause and unpause functions for emergency stops
    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
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