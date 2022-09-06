import React, { Component } from 'react';
import ReCAPTCHA from 'react-google-recaptcha'

//MUI
import CircularProgress from '@mui/material/CircularProgress'
import { Button } from '@mui/material';

//IMAGES
import imgWallet from '../../assets-game/ConnectWalletWords.webp';
import LogoTransparent from '../../assets-game/LogoOnerow.png';
import iconVerified from '../../assets-game/iconVerified.svg';
import iconError from '../../assets-game/iconError.svg';

//STYLES
import './signupmodal.scss'

//COMPONENTS
import SocialIcon from '../../components/social-icon/SocialIcon';

//LINKS
const linkDiscord = "https://discord.gg/ancientsociety";
const linkTwitter = "https://twitter.com/_ancientsociety";
const linkWhitepaper = "https://ancientsociety.gitbook.io/";

//CAPTCHA
const CAPTCHA_KEY = '6Lfjo_4fAAAAAKBgNp6NnugqVjMZGXilQZ0hKHvZ'

class SignupModal extends Component {

    constructor(props) {
        super(props);

        this.state = {
            captchaValue: null
        };
    }

    captchaConfirmed(captcha){
        this.setState({captchaValue: captcha}, 
            () => {
                console.log('Captcha done')
                this.sendCaptcha()
            }
        )
    }

    sendCaptcha(){
        this.props.onActionClick(this.state.captchaValue)
    }
    
    render(){

        return (
            <>
                <div className='signup-overlay'/>

                <div className='signup-modal'>

                    <div className='head'>
                        <img src={LogoTransparent} />
                    </div>

                    <div className='body'>
                        <ReCAPTCHA 
                            sitekey={CAPTCHA_KEY}
                            onChange={(key) => this.captchaConfirmed(key)}
                        />
                    </div> 

                    <div className='socialIcons'>
                        <SocialIcon 
                            type="gameInfo" 
                            onIconClick={()=>{window.open(linkWhitepaper)}}
                        />
                        <SocialIcon 
                            type="gameDiscord" 
                            onIconClick={()=>{window.open(linkDiscord)}}
                        />
                        <SocialIcon 
                            type="twitter" 
                            onIconClick={()=>{window.open(linkTwitter)}}
                        />
                    </div>
                </div> 
            </>
      )
      
    }
}

export default SignupModal