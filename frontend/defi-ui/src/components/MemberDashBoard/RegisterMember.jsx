import React, { useState } from "react";
import { useWeb3 } from "../../utils/Web3Provider";
import { useMemberRegistry } from "../../utils/useMemberRegistry";
import { useNavigate } from "react-router-dom";

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
    <div>
      <h1>Register Member</h1>
      <input
        type="text"
        placeholder="Enter your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button onClick={handleRegister}>Register</button>
    </div>
  );
};

export default RegisterMember;
