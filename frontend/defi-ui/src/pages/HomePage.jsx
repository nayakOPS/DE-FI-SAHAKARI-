// HomePage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../utils/Web3Provider';
import './HomePage.css';
import Navigation from '../components/Navigations';

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
    <div className='w-5/6 m-auto '>
    <Navigation/>
    <div className="mt-8 px-40 py-4 h-screen">
      {/* <h1 className='text-3xl font-bold text-center'>DeFi Sahakari</h1> */}

      <div className='mt-16 text-center'>
        <h1 className='font-bold'>Welcome to Your DeFi Sahakari App</h1>
        <p className='w-4/5 mx-auto mt-4'>
        Welcome to De-Fi Sahakari, a decentralized finance (DeFi) application committed to revolutionizing the cooperative finance landscape in Nepal. Our project addresses a critical issue prevalent in traditional cooperative societies: the lack of transparency and accountability, which often leads to financial scams and mismanagement.
        </p>
        <h2 className='font-bold'>Our Mission</h2>
        <p className='w-4/5 mx-auto mt-4'>
        We aim to bring transparency, trust, and security to the cooperative finance system using blockchain technology. By leveraging the immutable and decentralized nature of blockchain, we ensure that all transactions are transparent, verifiable, and tamper-proof.
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
    </div>
  );
};

export default HomePage;
