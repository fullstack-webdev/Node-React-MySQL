import React, { useState, useEffect } from 'react';

import { CallToAction, Feature } from '../../components';

import { useNavigate } from 'react-router-dom'

import './features.scss';

const section2_CTA_Button = 'PLAY NOW'

const Features = (props) => {
    let navigate = useNavigate();

    return (
      <div className='features'>
          
        <div className='container'>
            <Feature type='townhall' direction='image-first'/>
            <hr/>
            <Feature type='lumberjack' direction='text-first'/>
            <hr/>
            <Feature type='stonemine' direction='image-first'/>
            <hr/>
            <Feature type='fisherman' direction='text-first'/>
            <hr/>
            <Feature type='lands' direction='image-first'/>
        </div>

        <CallToAction 
            // headline={section2_CTA_Headline}
            button={section2_CTA_Button}
            onCTAClick={()=>{
              navigate("/game");
            }}
          />

        
      </div>
    )

}

export default Features
