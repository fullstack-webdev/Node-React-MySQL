import './partners.scss'

import React from 'react'

import Umbria from './assets/umbria.webp';
import Chainstack from './assets/chainstack.png';
import Flag from './assets/flag.png';
import Coinbase from './assets/coinbase.png';
import Minteazy from './assets/minteazy.png';

function Partners() {
  return (
    <div className='Partners'>
      <h2>Powered By</h2>
      <div className='partners-list'>
        
        <a href='https://www.coinbase.com/' target="_blank">
          <img className='partner-orizontal' src={Coinbase}/>
        </a>
        <a href='https://bridge.umbria.network/bridge/ethereum-polygon/eth#' target="_blank">
          <img className='partner' src={Umbria}/>
        </a>
        <a href='https://chainstack.com/build-better-with-polygon/' target="_blank">
          <img className='partner' src={Chainstack}/>
        </a>
        <a href='https://www.forlootandglory.io/' target="_blank">
          <img className='partner' src={Flag}/>
        </a>
        <a href='https://www.minteazy.dev/' target="_blank">
          <img className='partner-orizontal' src={Minteazy}/>
        </a>
      </div>
    </div>
  )
}

export default Partners