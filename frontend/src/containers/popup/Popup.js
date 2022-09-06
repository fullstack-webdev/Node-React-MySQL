import React, { Component } from 'react';

import iconClose from '../../assets/close_white_24dp.svg';
import modalImg from '../../assets/modal.png';

import './popup.scss'

class Popup extends Component {

    constructor(props) {
        super(props);
    }

    setShowMenu_Close = () => {
        this.props.parentCallback_Close ( false );
    }
    
    render(){

      return (
        <>
        <div className='overlay' onClick={() => this.setShowMenu_Close()}/>

        <div className='popup'>
            <div className='head'>
                <h2>{this.props.headline}</h2>
                <img src={iconClose} onClick={() => this.setShowMenu_Close()} className="menu-icon-close" />
            </div>
            <div className='body'>
                <p>{this.props.text}</p>
                <img src={modalImg} className='popup-border'/>    
                <span className='popup-overlay'/>
            </div> 
            <div className='footer'/>
        </div> 
        </>
      )
      
    }
}

export default Popup