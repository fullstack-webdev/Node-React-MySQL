import './home.scss';

import React, {
  useEffect,
  useState,
} from 'react';

import {
  Features,
  Navbar
} from '../../containers';

import {
  Bk,
  Partners
} from '../../components';

const section3_Headline = 'WHAT IS ANCIENT SOCIETY?'
const section4_Headline = 'Customize your Heroes'
const section5_Headline = 'NFTs - Age 0 & 1'
const section7_Headline = 'ANCIENT ROADMAP'
const section8_Headline = 'ANCIENT TEAM'

function Home() {
  return (
      <div className="App">
          <div className='section-1'>
            <Navbar />
            <Features/>
            <Bk/>
            <Partners/>
          </div>
      </div>
  )
}

export default Home