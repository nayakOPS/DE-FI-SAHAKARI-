import React, { createContext, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";

const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);

  useEffect(() => {
    const initProvider = async () => {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const accounts = await provider.send("eth_requestAccounts", []);
        setProvider(provider);
        setSigner(signer);
        setAccount(accounts[0]);
      } else {
        console.log("No Ethereum provider found. Install MetaMask.");
      }
    };
    initProvider();
  }, []);

  const connectWallet = async () => {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const accounts = await provider.send("eth_requestAccounts", []);
      setProvider(provider);
      setSigner(signer);
      setAccount(accounts[0]);
    } else {
      console.log("No Ethereum provider found. Install MetaMask.");
    }
  };

  return (
    <Web3Context.Provider value={{ provider, signer, account, connectWallet }}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => useContext(Web3Context);
