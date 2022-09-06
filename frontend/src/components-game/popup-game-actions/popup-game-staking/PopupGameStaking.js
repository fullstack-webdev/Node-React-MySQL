import React, { Component } from 'react';

import {Button} from '../../../components';

import './popupgamestaking.scss'

import imgAncien from '../../../assets-game/ancien.webp';
import imgWood from '../../../assets-game/wood.webp';
import imgStone from '../../../assets-game/stone.webp';
// import imageBuilding from '../../../assets-game/townhall-view.jpg'
// import imageArrow from '../../../assets-game/arrow_forward_black_24dp.svg'

class PopupGameUpgrade extends Component {
    constructor(props) {
        super(props);
    }

  render(){
    
    return (

        <div className='stake'>

            <img src={this.props.image} className='building'/>

            <div className='container'>
                <div className='container-1'>
                    {(this.props.type < 4) ? <img src={getImage(this.props.type)}/> : null}
                    Status: {this.props.stake ? 'Staked' : 'Unstaked'}
                </div>

                <div className='container-2'>
                    
                    <div className='c2-row'>
                        <p>Drop per hour</p> 
                        <span>{this.props.dropQuantity}</span>
                    </div>

                    <hr/>

                    <div className='c2-row'>
                        <p>Drop per minute</p> 
                        <span>{(this.props.dropQuantity/60).toString().slice(0, 6)}</span>
                    </div>
                </div>

                <p className='unstake-warning'>Remember to set the Gas Fee to HIGH to avoid delays</p>

                {this.props.stored > 0
                    ? <p className='unstake-warning'>
                        You have {format(Math.round(this.props.stored))} {getResName(this.props.type)} to claim
                        </p>
                    : null
                }

                {this.props.upgradeStatus
                    ? <p className='unstake-warning'>
                        Building is upgrading, you will lose all the progress and won't get back the used resources
                        </p>
                    : null
                }

                <Button 
                    text= {this.props.stake ? 'Unstake' : 'Stake'}
                    onButtonClick={()=>{ this.props.onActionClick() }} 
                />
            </div>
        </div>
    );
  }  
}

function getImage(type){
    let imgType
  
    type == 1 ? 
      imgType = imgAncien
    : type == 2 ? 
      imgType = imgWood
    : type == 3 ? 
      imgType = imgStone
    : imgType = 'unknown'
  
    return imgType
}

function getResName(type){
    let name
  
    type == 1 ? 
        name = '$ANCIEN'
    : type == 2 ? 
        name = '$ANCIENWOOD'
    : type == 3 ? 
        name = '$ANCIENSTONE'
    : name = 'unknown'
  
    return name
}

function format(x) {
    let newValue = x;
    
    newValue 
    && (newValue =  x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","))
  
    return newValue
  }


export default PopupGameUpgrade;