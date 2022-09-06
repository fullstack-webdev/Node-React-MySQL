import React, { Component } from 'react';

import './button.scss';

class Button extends Component {

  render(){

    return (
        <div className={'btn-a ' + this.props.style} onClick={()=>{this.props.onButtonClick()}}>
            <span className={'btn-span ' + this.props.style}>
              {this.props.text}
            </span>
        </div>
    );
  }  
}

export default Button;