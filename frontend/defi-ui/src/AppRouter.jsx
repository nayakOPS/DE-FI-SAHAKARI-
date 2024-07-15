// AppRouter.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminDashboard from './pages/AdminDashBoard';
import MemberDashboard from './pages/MemberDashBoard';
import HomePage from './pages/HomePage';
import RegisterMember from './components/MemberDashBoard/RegisterMember';
import MemberLoanRequest from './components/MemberDashBoard/MemberLoanRequest';
import AdminLoanApproval from './components/AdminDahBoard/AdminLoanApproval'
import AdminFinanceProcessor from './components/AdminDahBoard/AdminFinanceProcessor';

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage/>} />
        <Route path="/admin-dashboard" element={<AdminDashboard/>} />
        <Route path="/member-dashboard" element={<MemberDashboard/>} />
        <Route path="/register-member" element={<RegisterMember />} />
        <Route path="/member-loan-request" element={<MemberLoanRequest />} />
        <Route path="/badminloan-approval" element={<AdminLoanApproval/>} />
        <Route path="/finance-process-admin" element={<AdminFinanceProcessor/>} />
      </Routes>
    </Router>
  );
};

export default AppRouter;