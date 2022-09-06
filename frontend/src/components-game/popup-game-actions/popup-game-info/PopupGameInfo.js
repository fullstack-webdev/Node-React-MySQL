// import {Button} from '../../../components';
import './popupgameinfo.scss';

import React, { Component } from 'react';

// import imgAncien from '../../../assets-game/ancien.webp';
// import imgWood from '../../../assets-game/wood.webp';
// import imgStone from '../../../assets-game/stone.webp';

// import imageBuilding from '../../../assets-game/townhall-view.jpg'
// import imageArrow from '../../../assets-game/arrow_forward_black_24dp.svg'

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
            <div className='info'>

                <img src={this.props.image} className='building'/>

                <div className='container'>

                    <span className='c3-headline'>General Info:</span>

                    <div className='container-2'>

                        <div className='c2-row'>
                            <p>Drop per hour</p> 
                            <span>
                                {this.props.dropQuantity}
                            </span>
                        </div>

                        <hr/>

                        <div className='c2-row'>
                            <p>Drop per minute</p> 
                            <span>
                                {(this.props.dropQuantity/60).toString().slice(0, 6)}
                            </span>
                        </div>
                    </div>

                    <span className='c3-headline'>Upgrade: </span>
                    
                    {this.formatTime(this.props.upgradeTime)} 

                    <div className='container-3'>
                        {this.state.upgradeResources.requirementsArray?.map((inventory, index) => (
                            <span key={index} /* className={inventory.isAllowed ? 'enough' : 'missing'} */>
                                <img src={inventory.image}/>
                                <span>{inventory.quantity}</span>
                            </span>
                        ))}
                    </div>

                </div>    
            </div>
        );
    }  
}

function format(x) {
    let newValue = x;
    
    newValue 
    && (newValue =  x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","))
  
    return newValue
  }

export default PopupGameUpgrade;