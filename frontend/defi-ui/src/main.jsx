import React from 'react';
import ReactDOM from 'react-dom/client';
import AppRouter from './AppRouter.jsx' 
import './index.css';
import { Web3Provider } from './utils/Web3Provider.jsx';


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Web3Provider>
     <AppRouter />
    </Web3Provider>
  </React.StrictMode>,
)
