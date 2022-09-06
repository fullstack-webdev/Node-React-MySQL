import React, { Component } from 'react';
import { useNavigate } from 'react-router-dom'

import iconClose from '../../assets/close_white_24dp.svg';

import {Wallet, Button, SocialIcon} from '../../components'

const linkGame = "https://www.ancientsociety.io/game";
const linkWhitepaper = "https://ancientsociety.gitbook.io/";
const linkOpensea = "https://linktr.ee/ancientsociety";
const linkDiscord = "https://discord.gg/ancientsociety";
const linkTwitter = "https://twitter.com/_ancientsociety";

function NavbarMobile(props) {

  const navigate = useNavigate();

  return (
    <div className='navbar-mobile-container'>
          <div className='navbar-head'>
            <h2 className=''>MENU</h2>
            <img src={iconClose} onClick={() => props.parentCallback_Close (false)} className="menu-icon-close" />
          </div>
   
          <div className='navbar-body'>
            <Wallet onWalletClick={()=> navigate("/game")}/>
            
            <div className='socials'>
              <SocialIcon type="gameInfo" onIconClick={()=>{window.open(linkWhitepaper)}}/>
              <SocialIcon type="discord" onIconClick={()=>{window.open(linkDiscord)}}/>
              <SocialIcon type="twitter" onIconClick={()=>{window.open(linkTwitter)}}/>
            </div>  
          </div>  

        </div> 
  )
}

export default NavbarMobile