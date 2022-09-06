import React, { Component } from 'react';

import { RoadmapElement } from '../../components';

import imgArrow from '../../assets/section7-arrow.png';

import './roadmap.scss';

const element1_headline = [<b>Q2 2022</b>, '\n Age 0 (Age of Stone)']
const element1_paragraphs = [
    'NFT Buildings Release (Town Hall, Lumberjack and Stone Mine)',
    'Upgrade (Building) System',
    'Resources Marketplace',
    'NFTs Staking',
    'Lands Release',
];
const element2_headline = [<b>Q3 2022</b>, '\n  Age 1 (Age of Tyrants)']
const element2_paragraphs = [
    'Beta-Game Release',
    'Quests & Experience',
    'Chests & Skins',
    'Leaderboard',
];
const element3_headline = [<b>Q4 2022</b>, '\n Age 2 (Age of Exploration)']
const element3_paragraphs = [
    'Gold Mine, Diamond Mine',
    'Laboratory, Fisherman’s Hut and more…',
    'Customable Heroes for each Building',
    'PvE Alliance',
    'Colonies'
] 
const element4_headline = [<b>Q1 2023</b>, '\n Age 3 (Age of War)']
const element4_paragraphs = [
    'PvP System',
    'Roadmap 2.0 and beyond'
] 
  

class Roadmap extends Component {
  render(){
    return (
      <div className='roadmap'>
          <h2>{this.props.headline}</h2>

          <div className='container'>

            <RoadmapElement 
                headline={element1_headline}
                paragraphs={element1_paragraphs}
            />
            <img src={imgArrow} />
            <RoadmapElement 
                headline={element2_headline}
                paragraphs={element2_paragraphs}
            />
            <img src={imgArrow} />
            <RoadmapElement 
                headline={element3_headline}
                paragraphs={element3_paragraphs}
            />
            <img src={imgArrow} />
            <RoadmapElement 
                headline={element4_headline}
                paragraphs={element4_paragraphs}
            />

          </div>
      </div>
    );
  }  
}

export default Roadmap
