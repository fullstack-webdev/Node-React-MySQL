import './index.css';

import React from 'react';

import { ethers } from 'ethers';
import ReactDOM from 'react-dom/client';

import { Web3ReactProvider } from '@web3-react/core';

import App from './App';

const getLibrary = (provider) => {
  const library = new ethers.providers.Web3Provider(provider);
  return library;
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // <React.StrictMode>
  <Web3ReactProvider getLibrary={getLibrary}>
    <App />
  </Web3ReactProvider>
  // </React.StrictMode>
);
