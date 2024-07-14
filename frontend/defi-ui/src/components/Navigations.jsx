import React from 'react';

const Navigation = () => {
  return (
    <nav className="flex justify-between items-center py-4 px-8 bg-gray-800 text-white">
      <div className="text-2xl font-bold">Logo</div>
      <ul className="flex space-x-8">
        <li className="menu-item"><a href="#home" className="hover:underline">Home</a></li>
        <li className="menu-item"><a href="#about" className="hover:underline">About</a></li>
        <li className="menu-item"><a href="#services" className="hover:underline">Services</a></li>
        <li className="menu-item"><a href="#contact" className="hover:underline">Contact</a></li>
      </ul>
    </nav>
  );
}

export default Navigation;