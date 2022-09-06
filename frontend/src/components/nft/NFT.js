import React, { Component } from 'react';

import imgTownhall from '../../assets/NFTtownhall.webp';
import imgLumberjack from '../../assets/NFTlumberjack.webp';
import imgStonemine from '../../assets/NFTstonemine.webp';
import imgLands from '../../assets/NFTlands.webp';
import imgGoldmine from '../../assets/NFTgoldmine.webp';

class NFT extends Component {
  render(){

    let info = getInfo(this.props.type);

    return (
  
            <li>
                <h4>{info[2]}</h4>
                <span>
                    <h3>{info[1]}</h3>
                    <p>{info[3]}</p>
                </span>
                <img src={info[0]} />
            </li>

    );
  }  
}

function getInfo(type){

    let infoToReturn = [];
  
    if (type === 'townhall') { 
        infoToReturn[0]= imgTownhall
        infoToReturn[1]='Town Hall' 
        infoToReturn[2]='Release: Q2 2022' 
        infoToReturn[3]='The Town Hall is the core NFT in the game, produces $ANCIEN' 
    
    } else if (type === 'lumberjack') {
        infoToReturn[0]= imgLumberjack
        infoToReturn[1]='Lumberjack' 
        infoToReturn[2]='Release: Q2 2022'
        infoToReturn[3]='The Lumberjack produces $ANCIENWOOD' 

    } else if (type === 'stonemine') {
        infoToReturn[0]= imgStonemine
        infoToReturn[1]='Stone Mine' 
        infoToReturn[2]='Release: Q2 2022'
        infoToReturn[3]='The Stone Mine produces $ANCIENSTONE' 
    
    } else if (type === 'lands') {
        infoToReturn[0]= imgLands
        infoToReturn[1]='Lands' 
        infoToReturn[2]='Release: Q2 2022'
        infoToReturn[3]='Land Owners will passively earn $ANCIEN / $RESOURCES'    
    
    } else if (type === 'goldmine') {
        infoToReturn[0]= imgGoldmine
        infoToReturn[1]='Gold Mine' 
        infoToReturn[2]='Release: Q3 2022'
        infoToReturn[3]='The Gold Mine will drop $ANCIENGOLD' 
    
    } else {
        infoToReturn = 'error'
    }
  
    return infoToReturn
  }

export default NFT;