// HomePage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../utils/Web3Provider';

const HomePage = () => {
  const { account, connectWallet } = useWeb3();
  const [address, setAddress] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (account) {
      setAddress(account);
    }
  }, [account]);

  const handleConnectWallet = async () => {
    await connectWallet();
  };

  const handleGoToDashboard = () => {
    console.log('Connected Wallet Address:', address);
    console.log('Admin Wallet Address:', '0x73fE2b14b3a53778F3F1bd2b243440995C4B68a4');

    // if (address == '0x73fE2b14b3a53778F3F1bd2b243440995C4B68a4') {
      if (address.toLowerCase() === '0x73fe2b14b3a53778f3f1bd2b243440995c4b68a4') {
      console.log("Navigating to admin");
      navigate('/admin-dashboard');
    } else {
      console.log("Navigating to member dashboard");
      navigate('/member-dashboard');
    }
  };

  return (
    <div>
      <h1>Welcome to Your DeFi Sahakari App</h1>
      <p>
        De-Fi Sahakari revolutionizes decentralized finance by integrating secure and user-friendly
        blockchain solutions, providing a seamless experience for managing financial assets and
        services. Join us to explore innovative DeFi opportunities and enhance your financial
        freedom.
      </p>
      {address ? (
        <div>
          <p>Connected Wallet Address: {address}</p>
          <button onClick={handleGoToDashboard}>Go to Dashboard</button>
        </div>
      ) : (
        <button onClick={handleConnectWallet}>Connect Wallet</button>
      )}
    </div>
  );
};

export default HomePage;
