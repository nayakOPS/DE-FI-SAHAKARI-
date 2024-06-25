// SPDX-License-Identifier: MIT
// Original source file: https://github.com/Uniswap/v2-periphery/blob/master/contracts/interfaces/IUniswapV2Router02.sol
// Original source file: https://github.com/Uniswap/v2-core/blob/master/contracts/interfaces/IUniswapV2Factory.sol
pragma solidity 0.8.26;


import "./FundingPool.sol";
import "./LoanManager.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import  "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol";



// FinancialProcessor contract handles interest accrual, loan approvals, and collateral liquidation
contract FinanceProcessor is Ownable, Pausable, AccessControl {
    FundingPool public fundingPool;
    LoanManager public loanManager;

    uint256 public interestRate = 5; // Annual interest rate in percentage 5%
    uint256 public collateralRatio = 150; // 150%

    bytes32 public constant MEMBER_ROLE = keccak256("MEMBER_ROLE");

    IUniswapV2Router02 public uniswapRouter;
    IUniswapV2Factory public uniswapFactory;
    address public usdcAddress; // Address of USDC token contract

    // this modifier ensure that the caller is a registered member with the 'MEMBER_ROLE
    modifier onlyRegisteredMember() {
        require(fundingPool.memberRegistry().getMember(msg.sender).isRegistered, "Only registered members can perform this action.");
        require(hasRole(MEMBER_ROLE, msg.sender), "Caller is not a registered member.");
        _;
    }

    event InterestAccrued(address indexed member, uint256 interestAmount);//emitted when interest is accrued to a members' balance
    event CollateralLiquidated(address indexed borrower, uint256 loanIndex, uint256 collateralAmount);//emitted when a borrowers collateral is liquidated


    constructor(address _fundingPoolAddress, address _loanManagerAddress, address _routerAddress, address _usdcAddress)  Ownable(msg.sender){
        fundingPool = FundingPool(_fundingPoolAddress);
        loanManager = LoanManager(_loanManagerAddress);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MEMBER_ROLE, msg.sender);

        // Initialize Uniswap router and factory
        uniswapRouter = IUniswapV2Router02(_routerAddress);
        usdcAddress = _usdcAddress;
        uniswapFactory = IUniswapV2Factory(uniswapRouter.factory());
    }

    // calculates daily interest on a members's USDC balance
    function accrueInterest(address _member) public onlyOwner {
        uint256 balance = fundingPool.getUSDCBalance(_member);
        uint256 interest = balance * interestRate / 100 / 365; // Daily interest calculation
        fundingPool.addUSDCBalance(_member, interest);
        emit InterestAccrued(_member, interest);
    }

    // distribute the interest to all members
    function distributeInterest() public onlyOwner {
        address[] memory members = fundingPool.memberRegistry().getAllMembers();
        for (uint256 i = 0; i < members.length; i++) {
            // calls accureInterest for each member
            accrueInterest(members[i]);
        }
    }

    // approves and disburses a loan to a borrower
    function processLoanApproval(address _borrower, uint256 _loanIndex) public onlyOwner {
        loanManager.approveLoan(_borrower, _loanIndex);
        loanManager.disburseLoan(_borrower, _loanIndex);
    }

    // process the loan repayment by a registered member
    function processLoanRepayment(address _borrower, uint256 _loanIndex, uint256 _amount) public onlyRegisteredMember {
        loanManager.repayLoan(_borrower, _loanIndex, _amount);
    }

    // function to perform the swap of ETH for USDC tokens using Uniswap:
    function swapEthForUsdc(uint256 _ethAmount) internal returns (uint256) {
        address[] memory path = new address[](2);
        path[0] = uniswapRouter.WETH(); // WETH address on the deployed network (could be different if not mainnet)
        path[1] = usdcAddress;

        // Perform the swap
        uint256[] memory amounts = uniswapRouter.swapExactETHForTokens{value: _ethAmount}(
            0, // accept any amount of USDC
            path,
            address(this), // receive tokens to this contract
            block.timestamp + 3600 // 1 hour deadline
        );

        return amounts[1]; // Return amount of USDC received
}


    // Liquidates a borrower's collateral if the loan is overdue and not repaid.
    // Withdraws the collateral in ETH and converts it to USDC.
    function liquidateCollateral(address _borrower, uint256 _loanIndex) public onlyOwner {
        // currently this does not include a mechanism to swap ETh for USDC
        LoanManager.Loan[] memory loans = loanManager.getLoans(_borrower); //accessing the array of loans first
        LoanManager.Loan memory loan = loans[_loanIndex]; //then accessing the specific loan using the index

        require(!loan.isRepaid, "Loan is already repaid.");
        require(block.timestamp > loan.dueDate, "Loan due date has not passed.");

        // Liquidate collateral
        fundingPool.withdrawETH(loan.ethCollateral);
        // Swap ETH for USDC
        uint256 usdcReceived = swapEthForUsdc(loan.ethCollateral);
        // Deposit received USDC into FundingPool
        fundingPool.depositUSDC(usdcReceived);
         // Mark loan as repaid
        loanManager.setLoanAsRepaid(_borrower, _loanIndex);

        emit CollateralLiquidated(_borrower, _loanIndex, loan.ethCollateral);
    }
    
    

    //  USDC interest accrued for a member.
    function getUSDCInterestAccrued(address _member) public view returns (uint256) {
        return fundingPool.getUSDCInterestAccrued(_member);
    }
    
    // Checks loan status and liquidates collateral if overdue or not paid
    function checkAndLiquidate(address _borrower, uint256 _loanIndex) external onlyOwner {
        LoanManager.Loan[] memory loans = loanManager.getLoans(_borrower);
        LoanManager.Loan memory loan = loans[_loanIndex];

        if (!loan.isRepaid && block.timestamp > loan.dueDate) {
            liquidateCollateral(_borrower, _loanIndex);
        }
    }

    //  returns ETH collateral for a specific loan.
    // function getEthCollateral(address _borrower) public view returns (uint256) {
    //     return loanManager.loans(_borrower);
    // }
}

// explain what all these code is doing , and how it is connecting and processig with other relevant contract