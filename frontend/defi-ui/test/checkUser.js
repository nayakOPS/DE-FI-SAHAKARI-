async function checkUserBalanceAndAllowance(userAddress, contract) {
    try {
        const balance = await contract.balanceOf(userAddress);
        const allowance = await contract.allowance(userAddress, contract.address);

        console.log(`Balance: ${balance.toString()}`);
        console.log(`Allowance: ${allowance.toString()}`);

        return { balance, allowance };
    } catch (error) {
        console.error("Error checking balance and allowance: ", error);
        throw error;
    }
}


checkUserBalanceAndAllowance("0xbAD786F30511868e82D61a7eeB5c141A08432f7E","0x3d392B423b6B847930C15e1C749E93Af59f5cE55")