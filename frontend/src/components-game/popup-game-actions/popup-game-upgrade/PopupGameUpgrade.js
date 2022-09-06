import './popupgameupgrade.scss';

import React, { Component } from 'react';

import imgAncien from '../../../assets-game/ancien.webp';
import imageArrow from '../../../assets-game/arrow_forward_black_24dp.svg';
import imgStone from '../../../assets-game/stone.webp';
import imgWood from '../../../assets-game/wood.webp';
import { Button } from '../../../components';

class PopupGameUpgrade extends Component {
    
    constructor(props) {
        super(props);

        this.state = {    
            upgradeResources: {}
        };
    }

    componentDidUpdate(){ 
        if ( JSON.stringify(this.state.upgradeResources) != JSON.stringify(this.props.upgradeResources) ) {
            this.setState({upgradeResources: this.props.upgradeResources})
        }
    }

    checkResource = (type) => {
        let result = []

        type == 'all' ? (
            (this.props.ancien >= this.props.upgradeResources.ancien
            && this.props.wood >= this.props.upgradeResources.wood
            && this.props.stone >= this.props.upgradeResources.stone)
            ? result = true
            : result = false
        ) : type == 'ancien' ? (
            this.props.ancien >= this.props.upgradeResources.ancien
            ? result = true
            : result = false
        ) : type == 'wood' ? (
            this.props.wood >= this.props.upgradeResources.wood
            ? result = true
            : result = false
        ) : type == 'stone' ? (
            this.props.stone >= this.props.upgradeResources.stone
            ? result = true
            : result = false
        ) : result = 'type__unknown'

        return result
    }

    formatTime(seconds) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.round(seconds % 60);
        return [
          h.toString() + 'h',
          m > 9 ? m.toString() + 'min' : (h ? '0' + m : m || '0').toString() + 'min'
        ].filter(Boolean).join(', ');
    }

    render(){
        
        return (

            <div className='upgrade'>

                <img src={this.props.upgradeImage} className='building'/>

                <div className='container'>
                    <div className='container-1'>
                        Level {this.props.level}
                        <span className='green'>
                            <img src={imageArrow}/> 
                            {this.props.level + 1}
                        </span>
                    </div>
                    
                    <div className='container-2'>

                        <div className='c2-row'>
                            <p>Upgrade Time:</p> 
                            <span>
                                {this.formatTime(this.props.upgradeTime)} 
                            </span>
                        </div>

                        {this.props.capacity && this.props.capacity != -1 ?
                            <>
                            <hr/>
                            <div className='c2-row'>
                                <p>Capacity</p> 
                                <span>
                                    {format(this.props.capacity)}
                                    <img src={imageArrow}/>
                                    <p className='green'>{format(this.props.upgradeCapacity)}</p>
                                </span>
                            </div>
                            </>
                        : null}

                        {this.props.dropQuantity && this.props.dropQuantity != -1 ?
                            <>
                            <hr/>
                            <div className='c2-row'>
                                <p>Drop Quantity (hourly)</p> 
                                <span>
                                    {this.props.dropQuantity}
                                    <img src={imageArrow}/>
                                    <p className='green'> {this.props.upgradeDropQuantity}</p>
                                </span>
                            </div>
                            </>
                        : null}
                    </div>

                    <span className='c3-headline'>Requirements:</span>
                    <div className='container-3'>
                        {this.state.upgradeResources.requirementsArray?.map((inventory, index) => (
                            <span key={index} className={inventory.isAllowed ? 'enough' : 'missing'}>
                                <img src={inventory.image}/>
                                <span>{inventory.quantity}</span>
                            </span>
                        ))}
                    </div>

                    {this.state.upgradeResources.upgradeAllowed
                    ?
                        <Button 
                            text='Upgrade'
                            onButtonClick={()=>{ this.state.upgradeResources.upgradeAllowed ? this.props.onActionClick() : null}} 
                        />
                    :
                        <p className='upgrade-warning'>Not enough requirements to upgrade</p>
                    }
                </div>    
            </div>
        );
  }  
}

function getImage(type){
    let imgType = null; 
  
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

export default PopupGameUpgrade;