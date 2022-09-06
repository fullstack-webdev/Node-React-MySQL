import React, { Component } from 'react';

import Leaderboard from '../../components/leaderboard/Leaderboard';

import './leaderboards.scss';

class Leaderboards extends Component {
  render(){
    return (
      <div className='leaderboards'>
          <Leaderboard type='pvp' />
          <Leaderboard type='pve' />
      </div>
    );
  }  
}

export default Leaderboards
