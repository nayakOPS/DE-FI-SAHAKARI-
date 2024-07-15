import React from 'react';
import logoImage from '../assets/logo2.png'

const Navigation = () => {
  return (
    <nav className="flex justify-between items-baseline py-4 px-8 text-white mb-8 pt-8">
      <div className="flex items-center">
        <div className="bg-white p-30 rounded-full">
          <img src={logoImage} alt="DeFi Sahakari Logo" className="h-16 w-auto object-cover " /> {/* Adjust class names for styling */}
            {/* <p>Empowering Transparency, Decentralizing Finance</p> */}
        </div>
      </div>
      <ul className="flex space-x-8">
        <li ><a href="/" className="hover:underline">Home</a></li>
        <li className=""><a href="/member-dashboard" className="hover:underline">Member Dashboard</a></li>
        <li className=""><a href="/admin-dashboard" className="hover:underline">Admin Dashboard</a></li>
        <li className=""><a href="/member-loan-request" className="hover:underline">Loan Request</a></li>
        <li className=""><a href="/finance-process-admin" className="hover:underline">Finance Processor</a></li>
      </ul>
    </nav>
  );
}

export default Navigation;