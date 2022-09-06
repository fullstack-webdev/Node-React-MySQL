import React, { Component } from 'react';
import { CustomizerChanger } from '../../components';

import FullSetCR from '../../assets/CR.webp';

import imgLoading from '../../assets/loader.gif'

import iconUp from '../../assets/expand_less_white_24dp.svg';
import iconDown from '../../assets/expand_more_white_24dp.svg';


import './customizer.scss';

class Customizer extends Component {

    state = { 
        loading: true,
        newImage: "", 
        active: 0,
        mobileVisible: [
            true,
            true,
            true,
            false,
            false,
            false
        ]
    }

    callbackFunction = (childData) => {
        this.setState({loading: true, newImage: childData})
    }

    setActive = (childerID) => {
        this.state.active != childerID
        ? this.setState({active: childerID})
        : this.setState({loading: false})
    }

    isLoaded = () => {
        this.setState({loading: false})
    }

    mobileChangerSwap = () => {
        console.log('Up...')
        console.log('Array: ', this.state.mobileVisible)

        var arrayToShift = this.state.mobileVisible; 

        for (var i = 0; i < 3; i++) {
            arrayToShift.unshift(arrayToShift.pop());
            console.log(i, ':   ', arrayToShift)
        }

        console.log('Array post shift: ', arrayToShift)
        this.setState({mobileVisible: arrayToShift})
    }

    render(){

        return (
        <div className='customizer'>
            
            <h2>{this.props.headline}</h2>
            
            <div className='container'>
                
                <div className='display'>
                    <img 
                        src=
                            {this.state.newImage[1] == null ? //[1] after img import
                                FullSetCR
                                :
                                this.state.newImage[1] //[1] after img import
                            } 
                        onLoad={this.isLoaded}
                    />
                    
                </div>
                
                {this.state.loading  
                    ? <img src={imgLoading} className='onLoading'/>
                    : null
                }

                <div className='controllers'>

                    <img 
                        src={iconUp}
                        className='mobile-changer-icon'
                        onClick={this.mobileChangerSwap }
                    />

                    <div className='c-r'>

                        <CustomizerChanger 
                            type='0' 
                            mobileVisible = {this.state.mobileVisible[0]}
                            active={this.state.active} 
                            parentCallback_Image = {this.callbackFunction} 
                            parentCallback_Active = {this.setActive}
                        />

                        <CustomizerChanger 
                            type='1' 
                            mobileVisible = {this.state.mobileVisible[1]}
                            active={this.state.active} 
                            parentCallback_Image = {this.callbackFunction} 
                            parentCallback_Active = {this.setActive}
                        />
                        
                        <CustomizerChanger 
                            type='2' 
                            mobileVisible = {this.state.mobileVisible[2]}
                            active={this.state.active} 
                            parentCallback_Image = {this.callbackFunction} 
                            parentCallback_Active = {this.setActive}
                        />

                    {/* </div> */}

                    {/* <div className='c-r'> */}

                        <CustomizerChanger 
                            type='3' 
                            mobileVisible = {this.state.mobileVisible[3]}
                            active={this.state.active} 
                            parentCallback_Image = {this.callbackFunction} 
                            parentCallback_Active = {this.setActive}
                        />
                        
                        <CustomizerChanger 
                            type='4' 
                            mobileVisible = {this.state.mobileVisible[4]}
                            active={this.state.active} 
                            parentCallback_Image = {this.callbackFunction} 
                            parentCallback_Active = {this.setActive}
                        />

                    {/* </div> */}

                    {/* <div className='c-r'> */}

                        <CustomizerChanger 
                            type='5' 
                            mobileVisible = {this.state.mobileVisible[5]}
                            active={this.state.active} 
                            parentCallback_Image = {this.callbackFunction} 
                            parentCallback_Active = {this.setActive}
                        />
                        
                    </div>

                    <img 
                        src={iconDown}
                        className='mobile-changer-icon'
                        onClick={this.mobileChangerSwap }
                    />


                </div>

            </div>
        </div>
        );
    }  
}

export default Customizer;
