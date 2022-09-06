import './marketplace-profile.scss';

import React, { Component } from 'react';

import axios from 'axios';

import Button from '../../components/button/Button';
import Table from '../table/TableProfile';

class MarketplaceProfile extends Component {
    constructor(props) {
        super(props);
    
        this.state = {

            //Inventory
            inventory:{
                wood: props.inventory.wood,
                stone: props.inventory.stone,
            },

            //toSell
            resource: '',
            quantity: '',
            price: '',
            timeDays: '',
            timeHours: '',

            //Table
            data: props.data,

            //AdAllowed
            adAllowed: props.adAllowed,

            idDelegate: null
        }
    
        //Functions Binding
        this.sellAgain = this.sellAgain.bind(this);
        this.cancel = this.cancel.bind(this);
        this.remove = this.remove.bind(this);
    }

    componentDidUpdate(){
        this.state.idDelegate != this.props.idDelegate
        && this.setState({idDelegate: this.props.idDelegate})
        // console.log('Profile Updated, props.data: ', this.props.data)

        //Check if Data (State) is different than Data (Props)
        this.state.data != this.props.data
        && this.setState({data: this.props.data})

        //Check if adAllowed (State) is different than adAllowed (Props)
        this.state.adAllowed != this.props.adAllowed
        && this.setState({adAllowed: this.props.adAllowed})

        //Check if Inventory (State) is different than Inventory (Props)
        this.state.inventory != this.props.inventory
        && this.setState({inventory: this.props.inventory})
    }

    isQuantityBelowMax(quantity){
        let infoToReturn = null;
    
        if (this.state.resource == 2) {
            parseInt(quantity) <= this.state.inventory.wood 
            ? infoToReturn = true
            : infoToReturn = false
        } else if (this.state.resource == 3) {
            parseInt(quantity) <= this.state.inventory.stone 
            ? infoToReturn = true
            : infoToReturn = false
        } else { infoToReturn = false }
    
        // console.log('infoToReturn: ', infoToReturn)
        return infoToReturn
    }

    sell(){
        const data =  {
            address: this.props.metamask.walletAccount,
            idDelegate: this.state.idDelegate,
            type: this.state.resource,
            quantity: this.state.quantity,
            price: this.state.price, //Price per Unit
            duration: getSeconds(this.state.timeDays, this.state.timeHours)
        }

        // console.log('sell: ', data)

        this.props.callback_isReady(false)
        
        axios({
            method: 'post',
            url: '/api/m1/marketplace/createAd',
            data: data
        })
        .then(response => {
            response.data.success ? 
             this.props.callback_newData(response.data.data.listings, response.data.data.inventory.resources, response.data.data.adAllowed)
             : null
        })
        .then(() =>
            this.reset()
        )
        .then(() =>
            this.props.callback_isReady(true)
        )
        .catch(error => {
            error.response.status == 500
            && this.props.callback_Logout()
        
            error.response.status == 401
            && this.props.callback_Logout()
        })
    }



    cancel(id){ //If Ad Active
        const data =  {
            address: this.props.metamask.walletAccount,
            idDelegate: this.state.idDelegate,
            id: id
        }

        // console.log('cancel: ', data)

        this.props.callback_isReady(false)

        axios({
            method: 'post',
            url: '/api/m1/marketplace/cancelAd',
            data: data
        })
        .then(response => {
            response.data.success ? 
             this.props.callback_newData(response.data.data.listings, response.data.data.inventory.resources, response.data.data.adAllowed)
             : null
        })
        .then(() =>
            this.reset()
        )
        .then(() =>
            this.props.callback_isReady(true)
        )
        .catch(error => {
            error.response.status == 500
            && this.props.callback_Logout()
        
            error.response.status == 401
            && this.props.callback_Logout()
        })
    }



    remove(id){ //If Ad Expired of Sold
        const data =  {
            address: this.props.metamask.walletAccount,
            idDelegate: this.state.idDelegate,
            id: id
        }

        // console.log('remove: ', data)
        
        this.props.callback_isReady(false)

        axios({
            method: 'post',
            url: '/api/m1/marketplace/removeAd',
            data: data
        })
        .then(response => {
            response.data.success ? 
             this.props.callback_newData(response.data.data.listings, response.data.data.inventory.resources, response.data.data.adAllowed)
             : null
        })
        .then(() =>
            this.reset()
        )
        .then(() =>
            this.props.callback_isReady(true)
        )
        .catch(error => {
            error.response.status == 500
            && this.props.callback_Logout()
        
            error.response.status == 401
            && this.props.callback_Logout()
        })
    }


    //Utility Funcions
    sellAgain(type, quantity, price, time){
        this.setState({
            resource: type,
            quantity: quantity,
            price: price,
            timeDays: '',
            timeHours: '',
        })
    }
    reset(){
        this.setState({
            resource: '', 
            quantity: '',
            price: '',
            timeDays: '',
            timeHours: ''
        })

        this.myFormRef.reset();
    }



    render(){

        return (

            <div className='marketplace-profile'>
                
                <div className='new-announce'>
                    <p>Sell Something</p>

                    <form ref={(el) => this.myFormRef = el}>
                        <div className='inputs'>
                            <span>Resource 
                                <select 
                                    name='Resource' 
                                    defaultValue='Select'
                                    value={this.state.resource}
                                    onChange={(e) => 
                                        this.setState({ 
                                            resource: e.target.value, 
                                            quantity: '',
                                            price: '',
                                            timeDays: '',
                                            timeHours: ''
                                        })
                                    }
                                > 
                                    <option value="" disabled hidden>Select</option>
                                    <option value="2">Wood</option>
                                    <option value="3">Stone</option>
                                </select>
                            </span>
                            
                            <span>Quantity 
                                <input 
                                    disabled={!this.state.resource}
                                    placeholder='00'
                                    type='number'
                                    maxLength="6"
                                    value={this.state.quantity}
                                    onKeyPress={(e) => {
                                        // console.log(e.code)
                                        if (e.code === 'Minus') {
                                            e.preventDefault();
                                        } else if (e.code === 'NumpadSubtract') {
                                            e.preventDefault();
                                        }else if (e.code === 'Period') {
                                            e.preventDefault();
                                        }else if (e.code === 'NumpadDecimal') {
                                            e.preventDefault();
                                        }else if (e.code === 'Equal') {
                                            e.preventDefault();
                                        }else if (e.code === 'NumpadAdd') {
                                            e.preventDefault();
                                        }else if (e.code === 'Comma') {
                                            e.preventDefault();
                                        }else if (e.code === 'KeyE') {
                                            e.preventDefault();
                                        }
                                    }}
                                    onChange={(e) => {
                                        // console.log('e: ', e)
                                        if(e.target.value == 0){ //Min limit
                                            this.setState({ quantity: '' })
                                        } else if ( Number.isInteger(parseInt(e.target.value)) && this.isQuantityBelowMax(e.target.value) ){ //Is Below Max limit
                                            this.setState({ quantity: parseInt(e.target.value) })
                                        } 
                                    }}
                                />
                            </span>
                            
                            <span>$Ancien per Unit 
                                <input 
                                    disabled={!this.state.quantity || parseInt(this.state.quantity) <= 0}
                                    placeholder='0.00'
                                    type='number'
                                    maxLength="5"
                                    step=".01"
                                    value={this.state.price}
                                    onKeyPress={(e) => {
                                        if (e.code === 'Minus') {
                                            e.preventDefault();
                                        }else if (e.code === 'NumpadSubtract') {
                                            e.preventDefault();
                                        }else if (e.code === 'Equal') {
                                            e.preventDefault();
                                        }else if (e.code === 'NumpadAdd') {
                                            e.preventDefault();
                                        }else if (e.code === 'Comma') {
                                            e.preventDefault();
                                        }else if (e.code === 'KeyE') {
                                            e.preventDefault();
                                        }
                                    }}
                                    onChange={(e) => {
                                        if(e.target.value == '00'){ 
                                            this.setState({ price: '0' })
                                        } else if ( e.target.value.toString().length > 8){
                                            null
                                        } else if (
                                            e.target.value.toString().split('.').length > 1
                                            && e.target.value.toString().split('.')[1].length > 2
                                        ) { null
                                        } else { 
                                            this.setState({ price: e.target.value })
                                        } 
                                    }}
                                />
                                <h3>Ancien</h3>
                                {   
                                    this.state.price > 0
                                        ? <h4>
                                            <b>Total:</b> {
                                            format(Math.trunc( (this.state.price * this.state.quantity) * 100) / 100)
                                            } Ancien
                                        </h4>
                                        : null
                                }
                            </span>
                            
                            <span>Time 
                                <div className='time'>

                                    <div className='days-container'>
                                        <h3 className='days'>Days</h3>
                                        <input 
                                            placeholder='00'
                                            maxLength="3" 
                                            disabled={!this.state.price || parseFloat(this.state.price) <= 0}
                                            type='number'
                                            value={this.state.timeDays}
                                            onKeyPress={(e) => {
                                                // console.log(e.code)
                                                if (e.code === 'Minus') {
                                                    e.preventDefault();
                                                } else if (e.code === 'NumpadSubtract') {
                                                    e.preventDefault();
                                                }else if (e.code === 'Period') {
                                                    e.preventDefault();
                                                }else if (e.code === 'NumpadDecimal') {
                                                    e.preventDefault();
                                                }else if (e.code === 'Equal') {
                                                    e.preventDefault();
                                                }else if (e.code === 'NumpadAdd') {
                                                    e.preventDefault();
                                                }else if (e.code === 'Comma') {
                                                    e.preventDefault();
                                                }else if (e.code === 'KeyE') {
                                                    e.preventDefault();
                                                }
                                            }}
                                            onChange={(e) => {
                                                if(e.target.value == 0){ //Min limit
                                                    this.setState({ timeDays: '' })
                                                } else if ( e.target.value <= 28 ){ //Is Below Max limit
                                                    this.setState({ timeDays: parseInt(e.target.value) })
                                                } else {
                                                    this.setState({ timeDays: '28' })
                                                }
                                            }}
                                        />
                                    </div>

                                    <div className='hours-container'>
                                        <h3 className='hours'>hr</h3>
                                        <input 
                                            placeholder='00'
                                            maxLength="2" 
                                            disabled={!this.state.price || parseFloat(this.state.price) <= 0}
                                            type='number'
                                            value={this.state.timeHours}
                                            onKeyPress={(e) => {
                                                // console.log(e.code)
                                                if (e.code === 'Minus') {
                                                    e.preventDefault();
                                                } else if (e.code === 'NumpadSubtract') {
                                                    e.preventDefault();
                                                }else if (e.code === 'Period') {
                                                    e.preventDefault();
                                                }else if (e.code === 'NumpadDecimal') {
                                                    e.preventDefault();
                                                }else if (e.code === 'Equal') {
                                                    e.preventDefault();
                                                }else if (e.code === 'NumpadAdd') {
                                                    e.preventDefault();
                                                }else if (e.code === 'Comma') {
                                                    e.preventDefault();
                                                }else if (e.code === 'KeyE') {
                                                    e.preventDefault();
                                                }
                                            }}
                                            onChange={(e) => {
                                                if(e.target.value == 0){ //Min limit
                                                    this.setState({ timeHours: '' })
                                                } else if ( e.target.value <= 23 ){ //Is Below Max limit
                                                    this.setState({ timeHours: parseInt(e.target.value) })
                                                } else {
                                                    this.setState({ timeHours: '23' })
                                                }
                                            }}
                                        />
                                    </div>
                                
                                </div>
                            </span>
                        </div>
                    </form>

                    {
                        !this.state.adAllowed
                            ? <h5 className='mrkt-error'>Max listings reached: 10</h5>
                            : null
                    }

                    <div className='buttons'>
                        <Button
                            style='btn-reset'
                            text='Reset' 
                            onButtonClick={()=>{ this.reset() }}
                        />
                        <Button
                            style={
                                this.state.adAllowed
                                && this.state.resource
                                && this.state.quantity
                                && this.state.price && this.state.price > 0
                                && (this.state.timeDays || this.state.timeHours)
                                ? 'btn-sell' : 'btn-sell disabled'
                            }
                            
                            text='Sell' 
                            onButtonClick={()=>{
                                if(
                                    this.state.adAllowed
                                    && this.state.resource
                                    && this.state.quantity
                                    && this.state.price && this.state.price > 0
                                    && (this.state.timeDays || this.state.timeHours)
                                ){
                                    this.sell()
                                }else{
                                    // console.log("Not allowed")
                                }
                            }} 
                        />
                    </div>
                </div>

                {Array.isArray(this.state.data) && this.state.data.length
                    ? 
                        <Table 
                            data={this.state.data}
                            callback_sellAgain={this.sellAgain}
                            callback_cancel={this.cancel}
                            callback_remove={this.remove}
                            callback_onLoading={this.props.isReady}
                        />
                    : 
                        <p className='mrkt-error'>Nothing to see, create your first listing</p>
                }

            </div>

        )
    
    }

}

function getSeconds(days, hours){
    return (days*24*60*60) + (hours*60*60) 
}

function format(x) {
    let newValue = x;
  
    newValue 
    && (newValue =  x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","))

    return newValue
}

export default MarketplaceProfile   