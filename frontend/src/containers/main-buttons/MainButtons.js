import React, {useState, Component} from 'react';

import { useNavigate } from 'react-router-dom'

import {Popup} from '../../containers';

import Button from '../../components/button/Button';

import './mainbuttons.scss';

function MainButtons() {
      const [popupText, setPopupText] = useState(false);
      const [popupHeadline, setPopupHeadline] = useState(false);
      const [showPopup, setPopup] = useState(false);

      let navigate = useNavigate();
  
      return (
         <div className="nav-scroll">
            <div className='up'>
               
               <div className="left">
                  <Button 
                     text='Whitepaper'
                     onButtonClick={()=>{window.open('https://ancientsociety.gitbook.io', '_blank');}} 
                  />
               </div>

               <div className="center"/>

               <div className="left">
                  <Button 
                     text='Play'
                     onButtonClick={()=>{
                        navigate("/game");
                     }} 
                  />
               </div>
            </div>

            {showPopup && 
               <Popup 
                  headline={popupHeadline}
                  text={popupText}
                  parentCallback_Close = {() => setPopup(false)}
               />
            }

            {/* <div className="bottom">
               <Button 
                  text='Play'
                  onButtonClick={()=>{
                     navigate("/game");
                  }} 
               />
            </div> */}

            
         </div>
      )

}

export default MainButtons
