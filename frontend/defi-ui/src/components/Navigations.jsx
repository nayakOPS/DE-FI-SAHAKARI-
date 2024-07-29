import React from 'react';
import { useWeb3 } from '../utils/Web3Provider';
import logoImage from '../assets/logo2.png'
import someLogo from '../assets/logo3.png'

const Navigation = () => {
  const { account } = useWeb3();
  return (
    <nav className="flex justify-between items-center py-4  text-white mb-8 pt-8">
      <div className="flex items-center">
        {/* <div className="bg-white p-30 rounded-full"> */}
          <img src={someLogo} alt="DeFi Sahakari Logo" className="h-12 w-auto" /> {/* Adjust class names for styling */}
            {/* <p>Empowering Transparency, Decentralizing Finance</p> */}
        {/* </div> */}
      </div>
      <ul className="flex space-x-8">
        <li ><a href="/" className="hover:underline font-bold">Home</a></li>
        <li className=""><a href="/member-dashboard" className="hover:underline font-bold">Member Dashboard</a></li>
        {account === '0x73fE2b14b3a53778F3F1bd2b243440995C4B68a4' || account ==="0xd5bd2adc0cb6c90e8803fae0e42cda55f9fd4ee7"?
        <li className=""><a href="/admin-dashboard" className="hover:underline font-bold">Admin Dashboard</a></li>
        :
        null}
        <li><a href="/member-loan-request" className="hover:underline font-bold">Loan Request</a></li>
        {account === "0x73fE2b14b3a53778F3F1bd2b243440995C4B68a4" || account ==="0xd5bd2adc0cb6c90e8803fae0e42cda55f9fd4ee7"?
        <li className=""><a href="/finance-process-admin" className="hover:underline font-bold">Finance Processor</a></li>
        :null}
      </ul>
    </nav>
  );
}

export default Navigation;