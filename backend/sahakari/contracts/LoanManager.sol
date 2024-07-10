// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "./FundingPool.sol";
import "./EthPriceConsumerV3.sol";

// This LoanManager.sol contract handles loan requests, approvals, disbursements, and repayments. It also interacts with a FundingPool contract for managing funds.
contract LoanManager {
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

    // Events
    event LoanRequested(address indexed borrower, uint256 amount, uint256 ethCollateral, uint256 repaymentAmount);
    event LoanApproved(address indexed borrower, uint256 loanIndex);
    event LoanDisbursed(address indexed borrower, uint256 loanIndex, uint256 amount);
    event LoanRepaid(address indexed borrower, uint256 loanIndex, uint256 amount);
    event CollateralReturned(address indexed borrower, uint256 indexed loanIndex, uint256 collateralAmount);

    // intializes the 'FundingPool' instance with the provided address
    constructor(address _fundingPoolAddress, address _priceConsumerAddress) {
        fundingPool = FundingPool(_fundingPoolAddress);
        priceConsumer = EthPriceConsumerV3(_priceConsumerAddress); // pass the contract address of the EthPriceConsumerV3 contract address
    }

    // Set ETH to USDC rate using the EthPriceConsumerV3 contract
    function setEthToUsdcRate() public {
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
    function requestLoan(uint256 _amount, uint256 _dueDate) external payable {
        setEthToUsdcRate(); // Ensure the latest ETH to USDC rate is fetched
        // if 50 usdc loan taken repayment amount is 55
        uint256 repaymentAmount = _amount + (_amount * staticInterestRate / 100);

        // Calculate required collateral
        uint256 ethCollateral = calculateEthCollateral(_amount);

        // this require statmenet ensure that borrower has sufficient balance for collateral in fundingpool
        require(fundingPool.getEthBalance(msg.sender) >= ethCollateral, "Insufficient collateral balance.");

         // Transfer ETH collateral to FundingPool
        //  The special syntax {value: amount} is used to send Ether along with the function call
        fundingPool.depositCollateral{value: ethCollateral}();

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
    function approveLoan(address _borrower, uint256 _loanIndex) public {
        Loan storage loan = loans[_borrower][_loanIndex];
        require(!loan.isApproved, "Loan is already approved.");
        loan.isApproved = true;
        emit LoanApproved(_borrower, _loanIndex);
    }

    // transfer loan amount from sahakari(contract owner) to the borrower, transfer usdc that was request and approved as a loan to the borrower's address
    function disburseLoan(address _borrower, uint256 _loanIndex) public {
        Loan storage loan = loans[_borrower][_loanIndex];
        require(loan.isApproved, "Loan is not approved.");
        require(!loan.isRepaid, "Loan is already repaid.");

        // Transfer the loan amount in USDC from the FundingPool to the borrower
        require(fundingPool.usdcToken().transfer(_borrower, loan.amount), "Transfer failed.");
        emit LoanDisbursed(_borrower, _loanIndex, loan.amount);
    }

    // function for allowing a borrower to repay the loan
    function repayLoan(address _borrower, uint256 _loanIndex, uint256 _amount) public {
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
    
    // to check whether a borrower has repaid all their outstanding loans
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

    function returnCollateral(address _borrower, uint256 _loanIndex) public {
        Loan storage loan = loans[_borrower][_loanIndex];
        require(loan.isApproved, "Loan is not approved.");
        require(loan.isRepaid, "Loan is not repaid.");

        uint256 collateralAmount = loan.ethCollateral;
        loan.ethCollateral = 0; // Reset the collateral to avoid double withdrawals
        fundingPool.withdrawETH(collateralAmount);
        emit CollateralReturned(_borrower, _loanIndex, collateralAmount);
    }

    function setLoanAsRepaid(address _borrower, uint256 _loanIndex) public {
        loans[_borrower][_loanIndex].isRepaid = true;
    }
}
