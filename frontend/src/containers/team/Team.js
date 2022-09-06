import React, { Component } from 'react';

import { CallToAction, TeamMember } from '../../components';

import './team.scss';

import Members from './TeamJSON';

const CTA_Headline = 'SEIZE THE POWER.\n JOIN ANCIENT SOCIETY.'
const CTA_Button = 'JOIN US'

const linkDiscord = "https://discord.gg/ancientsociety"

class Team extends Component {
  render(){
    return (
      <div className='team'>
          <h2>{this.props.headline}</h2>

          <div className='container'>

          {Members.map((item, i) => (
              <div key={i}>
                  <TeamMember 
                      image={item.image}
                      name={item.name}
                      description={item.description}
                      twitter={item.twitter}
                  />
              </div>
          ))}

          </div>

          <CallToAction
            headline={CTA_Headline}
            button={CTA_Button}
            onCTAClick={()=>{window.open(linkDiscord)}}
          />
      </div>
    );
  }  
}

export default Team
