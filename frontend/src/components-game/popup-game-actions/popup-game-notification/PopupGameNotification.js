import React, { Component } from 'react';

import {Button} from '../../../components';

import './popupgamenotification.scss'

import imgAncien from '../../../assets-game/ancien.webp';
import imgWood from '../../../assets-game/wood.webp';
import imgStone from '../../../assets-game/stone.webp';

class PopupGameNotification extends Component {
    constructor(props) {
        super(props);

        this.state = {
            amount: null
        };
    }

  render(){
    return (
        <div className='notification'>
            <img src={this.props.image} className='building'/>

            <div className='container'>
                <div className='container-1'>
                    Level {this.props.level}
                    <span className='green'>
                        Upgrade is done
                    </span>
                </div>
                
                {
                this.props.type != 4
                ? <div className='container-2'>
                    
                    <div className='c2-row'>
                        <p>New Capacity</p> 
                        <span>
                            {format(this.props.capacity)}
                        </span>
                    </div>

                    <hr/>

                    <div className='c2-row'>
                        <p>New Drop per Hour</p> 
                        <span>
                            {format(this.props.dropQuantity)}
                        </span>
                    </div>

                    <hr/>

                    <div className='c2-row'>
                        <p>New Drop per Minute</p> 
                        <span>
                            {(this.props.dropQuantity/60).toString().slice(0, 6)}
                        </span>
                    </div>
                </div>
                : null
                }

                <Button 
                    text='Ok' 
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

function format(x) {
    let newValue = x;
    
    newValue 
    && (newValue =  x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","))
  
    return newValue
  }

export default PopupGameNotification;