import React, { Component } from 'react';

import './socialicon.scss'

import iconOpensea from '../../assets/iconOpensea.png';
import iconDiscord from '../../assets/iconDiscord.png';
import iconTwitter from '../../assets/iconTwitter.png';

import iconGameSettings from '../../assets-game/icon-settings.png';
import iconGameInfo from '../../assets-game/icon-info.png';
import iconGameDiscord from '../../assets-game/icon-discord.png';
import iconGameLogout from '../../assets-game/icon-logout.png';

class SocialIcon extends Component {
  render(){
    return (
      <img 
        src={getImage(this.props.type)} 
        className= {
          (this.props.style ? this.props.style : null) 
          + " social-icon " 
          + isDisabled(this.props.type)
        }
        onClick={()=>{this.props.onIconClick()}}
      />
    );
  }  
}

function getImage(type){

  let imageToReturn;

  (type === 'opensea') ? 
  imageToReturn=iconOpensea 
  : 
  (type === 'discord') ? 
  imageToReturn=iconDiscord
  :
  (type === 'twitter') ? 
  imageToReturn=iconTwitter
  :
  (type === 'gameSettings') ? 
  imageToReturn=iconGameSettings
  :
  (type === 'gameInfo') ? 
  imageToReturn=iconGameInfo
  :
  (type === 'gameDiscord') ? 
  imageToReturn=iconGameDiscord
  :
  (type === 'gameLogout') ? 
  imageToReturn=iconGameLogout
  :
  imageToReturn='error'

  return imageToReturn
}


function isDisabled(type){

  let valueToReturn = 'enabled';

  // (type === 'opensea') ? 
  // valueToReturn='disabled' 
  // : 
  // valueToReturn='enabled'

  return valueToReturn
}

export default SocialIcon;