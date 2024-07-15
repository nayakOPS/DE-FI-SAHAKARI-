import React from 'react';

const Navigation = () => {
  return (
    <nav className="flex justify-between items-baseline py-4 px-8 text-white mb-8 pt-8">
      <div className="text-2xl font-bold">DeFi Sahakari</div>
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