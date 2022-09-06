import React, { Component } from 'react';

import walletImg from '../../assets/ConnectWalletBlank.png';

import './wallet.scss';

const text='PLAY \n NOW'

class Wallet extends Component {
  render(){
    return (
      <div className='wallet-container' onClick={()=>{this.props.onWalletClick()}}>
        <p>{text}</p>
        <img src={walletImg} className='wallet' />
      </div>
    );
  }
}

export default Wallet
