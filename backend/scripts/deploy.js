const { ThirdwebSDK } = require("@thirdweb-dev/sdk");
const { ethers } = require("hardhat");

async function main() {
    const sdk = new ThirdwebSDK("sepolia");
    const wallet = sdk.getSigner();
    const deployer = new ethers.Wallet(wallet);

    console.log("Deploying contracts with the account:", deployer.address);

    const MemberRegistry = await ethers.getContractFactory("MemberRegistry");
    const memberRegistry = await MemberRegistry.deploy();
    await memberRegistry.deployed();
    console.log("MemberRegistry deployed to:", memberRegistry.address);

    const usdcAddress = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238"; // USDC contract address

    const FundingPool = await ethers.getContractFactory("FundingPool");
    const fundingPool = await FundingPool.deploy(memberRegistry.address, usdcAddress);
    await fundingPool.deployed();
    console.log("FundingPool deployed to:", fundingPool.address);

    const LoanManager = await ethers.getContractFactory("LoanManager");
    const loanManager = await LoanManager.deploy(fundingPool.address);
    await loanManager.deployed();
    console.log("LoanManager deployed to:", loanManager.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
