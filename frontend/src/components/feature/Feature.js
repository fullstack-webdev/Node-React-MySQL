import './feature.scss';

import React, { Component } from 'react';

import imgFisherman from '../../assets/fm.webp';
import imgTownhall10 from '../../assets/th.webp';
import imgLumberjack10 from '../../assets/lj.webp';
import imgStonemine10 from '../../assets/sm.webp';
import imgLands from '../../assets/lands.webp';
import SocialIcon from '../social-icon/SocialIcon';

class Feature extends Component {
  render(){
    let info = getInfo(this.props.type);

    return (
        <div className='feature'>
            <img 
                src={info[0]} 
                className={`${this.props.direction} ftr-border`}
                onClick={()=> window.open(info[3])}
            /> 
            <div className=
            {(this.props.direction == 'image-first') 
            ? 'text image-first'
            :'text text-first'}>
                <h2 className={this.props.type=='lands' ? 'lands' : null}>{info[1]}</h2>    
                <p>{info[2]}</p>
                <div className='iconsHomePage'>
                    <SocialIcon 
                        type='opensea' 
                        style='iconHomePage'
                        onIconClick={()=>window.open(info[3])}/> 
                    <SocialIcon 
                        type='gameInfo' 
                        style='iconHomePage'
                        onIconClick={()=>window.open(info[4])}/> 
                </div>
            </div>
        </div>
    );
  }  
}

function getInfo(type){

    let infoToReturn = [];
  
    if (type === 'townhall') {
        infoToReturn[0]=imgTownhall10
        infoToReturn[1]='Town Hall' 
        infoToReturn[2]='The Town Hall is the core NFT in the game. Staking a Town Hall will allow players to earn $ANCIEN' 
        infoToReturn[3]='https://opensea.io/collection/ancienttownhall'
        infoToReturn[4]='https://ancientsociety.gitbook.io/ancient-society-whitepaper/gameplay-in-ancient-society/buildings/town-hall'

    } else if (type === 'lumberjack') {
        infoToReturn[0]=imgLumberjack10
        infoToReturn[1]='Lumberjack' 
        infoToReturn[2]='The Lumberjack produces $ANCIENWOOD, a main resource needed to upgrade buildings' 
        infoToReturn[3]='https://opensea.io/collection/ancientlumberjack'
        infoToReturn[4]='https://ancientsociety.gitbook.io/ancient-society-whitepaper/gameplay-in-ancient-society/buildings/lumberjack'

    } else if (type === 'stonemine') {
        infoToReturn[0]=imgStonemine10
        infoToReturn[1]='Stone Mine' 
        infoToReturn[2]='The Stone Mine produces $ANCIENSTONE, another resource needed to upgrade buildings' 
        infoToReturn[3]='https://opensea.io/collection/ancientstonemine'
        infoToReturn[4]='https://ancientsociety.gitbook.io/ancient-society-whitepaper/gameplay-in-ancient-society/buildings/stone-mine'

    } else if (type === 'lands') {
        infoToReturn[0]=imgLands
        infoToReturn[1]='Lands' 
        infoToReturn[2]='Ancient Society will have different types of Lands with unique rarities and in-game perks' 
        infoToReturn[3]='https://opensea.io/collection/ancientland'
        infoToReturn[4]='https://ancientsociety.gitbook.io/ancient-society-whitepaper/gameplay-in-ancient-society/lands'

    } else if (type === 'fisherman') {
        infoToReturn[0]=imgFisherman
        infoToReturn[1]="Fisherman" 
        infoToReturn[2]="The Fisherman's Hut is the newest NFT around here. Designed for active players" 
        infoToReturn[3]='https://opensea.io/collection/ancientfisherman'
        infoToReturn[4]='https://ancientsociety.gitbook.io/ancient-society-whitepaper/gameplay-in-ancient-society/fishing'

    } else {
        infoToReturn = 'error'
    }
  
    return infoToReturn
  }

export default Feature;