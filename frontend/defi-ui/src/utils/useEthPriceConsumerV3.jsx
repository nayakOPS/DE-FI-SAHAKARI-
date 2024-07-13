import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import EthPriceConsumerV3ABI from '../abis/EthPriceConsumerV3.json';

const priceConsumerAddress = '0xEc51B31033DB33f6A91d3e9368518Aed55459c39';

export const useEthPriceConsumerV3 = (signer) => {
  const [priceConsumerContract, setPriceConsumerContract] = useState(null);

  useEffect(() => {
    if (signer) {
      const contract = new ethers.Contract(
        priceConsumerAddress, 
        EthPriceConsumerV3ABI.abi, 
        signer);
      setPriceConsumerContract(contract);
    }
  }, [signer]);

  const getLatestPrice = async () => {
    if (!priceConsumerContract) throw new Error('Contract not initialized');
    const price = await priceConsumerContract.getLatestPrice();
    // console.log(price.toString());
    return ethers.BigNumber.from(price);

  };

  return {
    getLatestPrice,
  };
};
