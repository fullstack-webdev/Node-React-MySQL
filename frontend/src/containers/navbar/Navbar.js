import React, {useState} from 'react';
import { useNavigate } from 'react-router-dom'

import './navbar.scss';

import iconOpen from '../../assets/menu_white_24dp.svg';
import Logo from '../../components/logo/Logo'
import Wallet from '../../components/wallet/Wallet'
import SocialIcon from '../../components/social-icon/SocialIcon'
import NavbarMobile from './NavbarMobile';

import {Popup} from '../../containers';

const linkGame = "https://www.ancientsociety.io/game";
const linkWhitepaper = "https://ancientsociety.gitbook.io/";
const linkOpensea = "https://linktr.ee/ancientsociety";
const linkDiscord = "https://discord.gg/ancientsociety";
const linkTwitter = "https://twitter.com/_ancientsociety";

const Navbar = () => {

    const [popupText, setPopupText] = useState(false);
    const [popupHeadline, setPopupHeadline] = useState(false);
    const [showPopup, setPopup] = useState(false);

    const [showMenu, setShowMenu] = useState(false);

    let navigate = useNavigate();

    return (
      <div className='navbar'>
        <div className='navbar-left'>
          <Logo />
        </div>
        <div className='navbar-right'>
          <div className='navbar-scroll'>
            <SocialIcon type="gameInfo" onIconClick={()=>{window.open(linkWhitepaper)}}/>
            <SocialIcon type="discord" onIconClick={()=>{window.open(linkDiscord)}}/>
            <SocialIcon type="twitter" onIconClick={()=>{window.open(linkTwitter)}}/>
            
            <Wallet 
              onWalletClick={()=>{
              navigate("/game");
            }}/>

          </div>
          <img src={iconOpen} onClick={() => setShowMenu(true)} className="menu-icon-open" />
            
          {showMenu ? <NavbarMobile parentCallback_Close = {() => setShowMenu(false)}/> : null}
  
        </div>

        {showPopup ? 
            <Popup 
              headline={popupHeadline}
              text={popupText}
              parentCallback_Close = {() => setPopup(false)}
            />
        : null}
      </div>
    )

}

export default Navbar
