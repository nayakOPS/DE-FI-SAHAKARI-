import { useState, useEffect } from "react";
import { ethers } from "ethers";
import MemberRegistryABI from "../abis/MemberRegistry.json";

const contractAddress = "0xdd331e03164086f09188b9ee28017D6734485CaA";

export const useMemberRegistry = (signer) => {
  const [contract, setContract] = useState(null);

  useEffect(() => {
    if (signer) {
      const contractInstance = new ethers.Contract(
        contractAddress,
        MemberRegistryABI.abi,
        signer
      );
      setContract(contractInstance);
    }
  }, [signer]);

  return contract;
};
