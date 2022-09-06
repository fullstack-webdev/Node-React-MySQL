import React, { Component } from 'react';
import {Button} from '../../components';

import iconClose from '../../assets/close_white_24dp.svg';
import modalImg from '../../assets/modal.png';

import './popupinventory.scss'

class PopupInventory extends Component {

    constructor(props) {
        super(props);

        this.state = {    
            type: props.type
        };
    }

    setShowMenu_Close = () => {
        this.props.parentCallback_Close ( false );
    }

    getResourceName(resource){
    
        let infoToReturn = [];
    
        if (resource == 1) {
          
          infoToReturn = '$ANCIEN'
    
        } else if (resource == 2) {
          
            infoToReturn = '$ANCIENWOOD'
    
        } else if (resource == 3) {
          
            infoToReturn = '$ANCIENSTONE'
    
        } else { //console.log('getResourceInfo: Empty')
        }
    
        return infoToReturn
      }

    getPopupBody = (type, resource, quantity) => {

        if(type == 'mint') {

            return(<div className='popup-inventory-container' >
                <p>
                    Are you sure you want to withdraw 
                    <span> {quantity} {this.getResourceName( resource)} </span>
                    to Metamask?
                </p>
                <Button 
                    text='WITHDRAW'
                    style='btn-popup-mint'
                    onButtonClick={() => this.tokenMint()}
                />
            </div>)

        }else{

            return(<div className='popup-inventory-container' >
                <p>
                    Are you sure you want to deposit 
                    <span> {quantity ? quantity : 0} {this.getResourceName( resource)} </span>
                    from Metamask, in your internal wallet?
                </p>
                <Button 
                    text='DEPOSIT'
                    style='btn-popup-mint'
                    onButtonClick={() => this.tokenBurn()}
                />
            </div>)

        }

    }

    tokenMint = () => {
        this.props.callback_tokenMint(
            this.props.resource,
            this.props.quantity
        )
    }
    tokenBurn = () => { //Burn
        this.props.callback_tokenBurn(
            this.props.resource,
            this.props.quantity
        )
    }

    render(){

      return (
        <>
        <div className='overlay' onClick={() => this.setShowMenu_Close()}/>

        <div className={this.props.type == 'mint' ? 'popup-inventory filter-mint' : 'popup-inventory filter-add'}>

            <div className='head'>
                <h2 className={this.props.type == 'mint' ? 'filter-mint' : 'filter-add'}>{this.props.type}</h2>
                <img src={iconClose} onClick={() => this.setShowMenu_Close()} className="menu-icon-close" />
            </div>

            <div className='body'>

                {
                    this.props.type == 'mint'

                        ? this.getPopupBody('mint', this.props.resource, this.props.quantity)

                        : this.props.type == 'add'

                            ? this.getPopupBody('add', this.props.resource, this.props.quantity)
                            : 'error body'
                }

                <img src={modalImg} className='popup-border'/>    
                <span className='popup-overlay'/>
            </div> 

            <div className='footer'/>
        </div> 
     </>
      )
      
    }
}

function format(x) {
    let newValue = x;
    
    newValue 
    && (newValue =  x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","))
  
    return newValue
}

export default PopupInventory