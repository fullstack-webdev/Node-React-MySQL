import React, { Component } from 'react';

import {Button} from '../../../components';

import './popupgameclaim.scss'

import imgAncien from '../../../assets-game/ancien.webp';
import imgWood from '../../../assets-game/wood.webp';
import imgStone from '../../../assets-game/stone.webp';
import imageArrow from '../../../assets-game/arrow_forward_black_24dp.svg'

class PopupGameClaim extends Component {
    constructor(props) {
        super(props);
    }

  render(){
    return (
        <div className='claim'>

            <img src={this.props.image} className='building'/>

            <div className='container'>
                <div className='container-1'>
                    <img src={getImage(this.props.type)}/>
                    Available: {format(roundMinOne(this.props.stored))}
                </div>

                <div className='container-2'>
                    
                    <div className='c2-row'>
                        <p>Capacity</p> 
                        <span>
                            {format(this.props.capacity)}
                        </span>
                    </div>

                    <hr/>

                    <div className='c2-row'>
                        <p>Free space</p> 
                        <span>
                            {format(this.props.capacity - roundMinOne(this.props.stored))}
                            <p className='green'>
                                {
                                    roundMinOne(
                                        ((this.props.capacity - this.props.stored)
                                        / this.props.capacity)
                                        *100
                                    )
                                }%
                            </p>
                        </span>
                    </div>
                </div>
                
                <span className='c3-headline'>
                    
                    <p>New balance</p> 

                    {/* {console.log('ancien: ', this.props.ancien, 'stored: ', this.props.stored)} */}

                    <p className='new-balance'>{
                        this.props.type == 1 ? //ancien

                        [format(roundMinOne(this.props.ancien)),
                        <img src={imageArrow}/>,
                        <span className='green'> 
                            {format(roundMinOne(this.props.ancien) + roundMinOne(this.props.stored))} 
                        </span>]
                        
                        : this.props.type == 2 ? //wood
                            
                            [format(roundMinOne(this.props.wood)),
                            <img src={imageArrow}/>,
                            <span className='green'> 
                                {format(roundMinOne(this.props.wood) + roundMinOne(this.props.stored))} 
                            </span>]

                        : this.props.type == 3 ? //stone
                            [format(roundMinOne(this.props.stone)),
                            <img src={imageArrow}/>,
                            <span className='green'> 
                                {format(roundMinOne(this.props.stone) + roundMinOne(this.props.stored))} 
                            </span>]

                        : 'undefined'
                    }</p>

                    </span>

                    {/* {console.log('test: ', roundMinOne(this.props.stored))} */}

                <Button 
                    style={
                        roundMinOne(this.props.stored) == 0 
                        ? 'btn-claim-popup disabled' 
                        : 'btn-claim-popup'
                    }
                    text='Claim' 
                    onButtonClick={()=>{
                        (roundMinOne(this.props.stored) >= 1) &&
                        this.props.onActionClick()
                    }} 
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

function roundMinOne(x) {
    let returnValue = 0;
    
    // console.log('x: ', x)

    x >= 1  
    ? returnValue = Math.floor(x)
    : returnValue = 0

    // console.log('returnValue: ', returnValue)

    return returnValue;
}

export default PopupGameClaim;