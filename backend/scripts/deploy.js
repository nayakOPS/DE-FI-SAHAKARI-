const { ThirdwebSDK } = require("@thirdweb-dev/sdk");
const { ethers } = require("hardhat");

async function main() {
    const sdk = new ThirdwebSDK("rinkeby");
    const wallet = sdk.getSigner();
    const deployer = new ethers.Wallet(wallet);

    console.log("Deploying contracts with the account:", deployer.address);

    const MemberRegistry = await ethers.getContractFactory("MemberRegistry");
    const memberRegistry = await MemberRegistry.deploy();
    await memberRegistry.deployed();
    console.log("MemberRegistry deployed to:", memberRegistry.address);

    const FundingPool = await ethers.getContractFactory("FundingPool");
    const fundingPool = await FundingPool.deploy(memberRegistry.address);
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
