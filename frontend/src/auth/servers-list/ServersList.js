import './servers-list.scss';

import React from 'react';
import { serverConfig, servers } from '../../config/serverConfig';

import { useNavigate } from 'react-router-dom';

import { Button } from '@mui/material';

import LogoTransparent from '../../assets-game/LogoOnerow.png';
import SocialIcon from '../../components/social-icon/SocialIcon';

const linkDiscord = "https://discord.gg/ancientsociety";
const linkTwitter = "https://twitter.com/_ancientsociety";
const linkWhitepaper = "https://ancientsociety.gitbook.io/";

function LoginModal(){

        console.log('desc ', 
            servers?.filter(server => server.name == 'Alpha')[0]
            .desc.split('<br/>')
            .map(row => (row))
        );

      return (
        <>
        <div className='login-overlay'/>
        
        <div className="server-panel">
            <div className='server-list'>

                <div className='head'>
                    <img src={LogoTransparent} />
                </div>

                <div className='body'>
                    <>
                    {servers?.map(server => (
                        <div className='server'>
                            <img src={server.img}/>
                            <p className='server-desc'>
                                {server.desc.split('<br/>')
                                .map(row => (
                                    <>
                                        {row} {<br/>}
                                    </>
                                    )
                                )}
                            </p>
                            <Button variant="contained" color={server.btnColor}  size="large" onClick={()=>window.location.href=server.url}>{server.btnText}</Button> 
                        </div>
                    ))}
                    </>
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
        </div>
        
     </>
      )
}

export default LoginModal