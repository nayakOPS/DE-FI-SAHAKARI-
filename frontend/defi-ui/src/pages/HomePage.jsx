// HomePage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../utils/Web3Provider';
import './HomePage.css';

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

    if (address.toLowerCase() === '0x73fe2b14b3a53778f3f1bd2b243440995c4b68a4') {
      console.log("Navigating to admin");
      navigate('/admin-dashboard');
    } else {
      console.log("Navigating to member dashboard");
      navigate('/member-dashboard');
    }
  };

  return (
    <div className="w-5/6 m-auto mt-8 px-40 py-4 h-screen">
      <h1 className='text-3xl font-bold'>DeFi Sahakari</h1>

      <div className='mt-32 text-center'>
        <h1 className='font-bold'>Welcome to Your DeFi Sahakari App</h1>
        <p className='w-4/5 mx-auto mt-4'>
          De-Fi Sahakari revolutionizes decentralized finance by integrating secure and user-friendly
          blockchain solutions, providing a seamless experience for managing financial assets and
          services. Join us to explore innovative DeFi opportunities and enhance your financial
          freedom.
        </p>
        {address ? (
          <div className='mt-8'>
            <p>Connected to Wallet</p>
            <div className='bg-slate-200 w-fit mx-auto px-2 py-1 rounded-3xl my-2'>
              <p className='text-teal-800 text-sm'>{address}</p>
            </div>
            <button onClick={handleGoToDashboard}>Go to Dashboard</button>
          </div>
        ) : (
          <button onClick={handleConnectWallet}>Connect Wallet</button>
        )}
      </div>
    </div>
  );
};

export default HomePage;
