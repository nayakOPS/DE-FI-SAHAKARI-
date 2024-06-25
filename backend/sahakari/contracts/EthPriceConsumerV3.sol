// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import { AggregatorV3Interface } from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

// Select Sepolia - Testnet for this to run
contract EthPriceConsumerV3 {
    AggregatorV3Interface internal priceFeed;

    /**
     * Network: Sepolia
     * Aggregator: ETH/USD
     * Address: 0x694AA1769357215DE4FAC081bf1f309aDC325306
     */
    constructor() {
        priceFeed = AggregatorV3Interface(
            0x694AA1769357215DE4FAC081bf1f309aDC325306
        );
        //data feed of usdc/eth for sepolia
    }

    /**
     * Returns the latest ETH/USD price.
     */
    function getLatestPrice() public view returns (int) {
        (, int price, , , ) = priceFeed.latestRoundData();

        // Debugging: Check if the data is being fetched correctly
        require(price > 0, "Invalid price returned from Chainlink");
        
        return price;
    }
}