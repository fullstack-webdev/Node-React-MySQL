import React, { Component } from 'react';

import Explanation from '../../components/explanation/Explanation'

import './explanations.scss';

const e1p1 = [
  'Stake your Buildings to ', 
  <b>earn $ANCIEN</b>,
  ' and ',
  <b>RESOURCES.</b>
]
const e1p2 = [
  'Hold/Stake your $ANCIEN to ', 
  <b>get special rewards</b>,
  ' and airdrops.'
]

const e2p1 = [
  'Spend $RESOURCES to ', 
  <b>upgrade your Buildings for more rewards.</b>
]
const e2p2 = [
  'Customize your Buildings and your Hero to be ', 
  <b>get special rewards</b>,
  ' unique.'
]

const e3p1 = [
  <b>Be the Master of your future</b>,
  ', war or peace?', 
]
const e3p2 = [
  'Overcome your enemies to ', 
  <b>reach the top</b>,
  ' of the Leaderboards.'
]


class Explanations extends Component {
  render(){
    return (
      <div className='explanations'>
        <h2>{this.props.headline}</h2>

        <div className='container'>
          <Explanation
            imagedesktop='short-top'
            imagemobile='short-top'
            headline='PLAY-TO-EARN'
            p1={e1p1}
            p2={e1p2}
          />
          <Explanation
            imagedesktop='long-top'
            imagemobile='short-top'
            headline='CUSTOMIZE & UPGRADE'
            p1={e2p1}
            p2={e2p2}
          />
          <Explanation
            imagedesktop='short-top'
            imagemobile='short-top'
            headline='REACH THE TOP'
            p1={e3p1}
            p2={e3p2}
          />
        </div>

      </div>
    );
  }  
}

export default Explanations
