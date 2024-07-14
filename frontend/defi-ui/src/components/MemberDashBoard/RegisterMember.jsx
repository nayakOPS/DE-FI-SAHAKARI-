import React, { useState } from "react";
import { useWeb3 } from "../../utils/Web3Provider";
import { useMemberRegistry } from "../../utils/useMemberRegistry";
import { useNavigate } from "react-router-dom";
import Navigation from "../Navigations";

const RegisterMember = () => {
  const { signer, account } = useWeb3();
  const contract = useMemberRegistry(signer);
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      const tx = await contract.registerMember(name);
      await tx.wait();
      navigate("/member-dashboard");
    } catch (error) {
      console.error("Error registering member:", error);
    }
  };

  return (
    <div className="w-5/6 m-auto h-screen">
      <Navigation/>
    <div className="px-40 py-4 mt-16">
      <h1 className='text-3xl text-teal-200 font-bold mb-12'>Register Member</h1>
      <div className="w-2/5">
      <label htmlFor="company" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
        Your Name
      </label>
      <input
        type="text"
        placeholder="Enter your name"
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button 
      onClick={handleRegister}
      className="text-white mt-4 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
      >Register</button>
      </div>
    </div>
    </div>
  );
};

export default RegisterMember;
