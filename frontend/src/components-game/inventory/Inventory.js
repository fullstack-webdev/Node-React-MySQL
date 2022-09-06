import './inventory.scss';

import React, { Component } from 'react';

import imageAncient from '../../assets-game/ancien.webp';
import imageStone from '../../assets-game/stone.webp';
import imageWood from '../../assets-game/wood.webp';
import {
  format,
  toFixed,
} from '../../utils/utils';

class Inventory extends Component {
    constructor(props) {
        super(props);
    
        this.state = {
            settings: props.settings,
            inventory: props.inventory
        }

        this.random = Math.floor(Date.now())
    }

    componentDidUpdate() {
        if (this.state.settings != this.props.settings){
            this.setState({settings: this.props.settings}, () => {
                this.random = Math.floor(Date.now())
            })
        }
        if (this.state.inventory != this.props.inventory){
            this.setState({inventory: this.props.inventory})
        }
    }

    render(){

        return (

            <div className='inventory'>
                
                <img src={`${this.state.settings.profileImage}?${this.random}`} className='profile'/>

                <div className='resources'>
                    <span className='resource ancien'>
                        <img src={imageAncient}/>
                        <p>{ format( toFixed(this.state.inventory.ancien) ) }</p>
                    </span>
                    <span className='resource wood'>
                        <img src={imageWood}/>
                        <p>{ format( toFixed(this.state.inventory.wood) ) }</p>
                    </span>
                    <span className='resource stone'>
                        <img src={imageStone}/>
                        <p>{ format( toFixed(this.state.inventory.stone) ) }</p>
                    </span>
                </div>

            </div>

        )
    
    }

}

export default Inventory   