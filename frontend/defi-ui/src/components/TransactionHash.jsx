// TransactionHash.js
import React from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { FaCopy } from 'react-icons/fa';
import { useState } from 'react';

const TransactionHash = ({ hash }) => {
  const [copied, setCopied] = useState(false);

  const truncateHash = (hash) => {
    const start = hash.substring(0, 8);
    const end = hash.substring(hash.length - 8);
    return `${start}...${end}`;
  };

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center space-x-2">
      <span className="text-gray-900 dark:text-slate-400 font-mono">{truncateHash(hash)}</span>
      <CopyToClipboard text={hash} onCopy={handleCopy}>
        <button className="flex items-center p-1 focus:outline-none bg-transparent hover:bg-transparent">
          <FaCopy className="text-slate-400" />
          {/* {copied && <span className="ml-2 text-sm text-green-500">Copied!</span>} */}
        </button>
      </CopyToClipboard>
    </div>
  );
};

export default TransactionHash;
