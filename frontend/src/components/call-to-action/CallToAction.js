import React, { Component } from 'react';
import Button from '../button/Button';

import './calltoaction.scss';

class CallToAction extends Component {
  render(){
    return (
        <div className='call-to-action'>
            <h2>
                {this.props.headline}
            </h2> 
            {this.props.button != null ?
              <Button 
                text={this.props.button} 
                onButtonClick={()=>{this.props.onCTAClick()}} 
              />
              : null
            }
        </div>
    );
  }  
}

export default CallToAction;