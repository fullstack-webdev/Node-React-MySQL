import "./notification.scss";
import iconClose from '../../assets/close_white_24dp.svg';

import { useEffect, useRef, useState } from "react";

import axios from "axios";

import {
  Button,
  LinearProgress,
  SvgIcon,
} from "@mui/material";

function Notification(props) {
  const [visible, setVisible] = useState(true);
  const [tutorial, setTutorial] = useState(props.notification);
  useEffect(() => {
    if (!props.notification) return
    setTutorial(props.notification)
    setVisible(true)
    console.log(props.notification)
  }, [props.notification]);

  return (
    <>
      <div className={`game-component notification-handler ${visible ? 'visible' : 'notVisible'}`}>
        <div className="game-container">
          <div className="header">
            <span className="title">{tutorial.headline}</span>
          </div>
          <div className="content">
            <div className="scroll-content">
                {tutorial 
                ? <Tutorial 
                    tutorialPages={tutorial}
                    closeCallback={()=>{
                      setVisible(false)
                      props.closeCallback()
                    }}
                  /> 
                : null}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Tutorial(props) {
  //All Pages
  const [tutorialPages, setTutorialPages] = useState(props.tutorialPages.elements);
  const [tutorialMaxPages, setTutorialMaxPages] = useState(0);

  useEffect(() => {
    setTutorialPages(props.tutorialPages.elements)
    setTutorialMaxPages(Object.keys(props.tutorialPages.elements).length-1);
  }, [props.tutorialPages]);
  

  //Current Page
  const [tutorialPage, setTutorialPage] = useState(0);

  const previousPage = () => {
    if (tutorialPage == 0) return
    setTutorialPage(tutorialPage-1)
  }
  const nextPage = () => {
    if (tutorialPage == tutorialMaxPages) return
    setTutorialPage(tutorialPage+1)
  }

  return (
    <div className="tutorial">

      {/* HEADLINE AVAILABLE */}
      {tutorialPages[tutorialPage].headline
      ? <div className="tutorialHead">
        <h2>{tutorialPages[tutorialPage].headline}</h2>
      </div>
      : null}

      {/* IMAGE AVAILABLE */}
      {tutorialPages[tutorialPage].image
      ? <img src={tutorialPages[tutorialPage].image} className='tutorialImg'/>
      : null}
      
      {/* TEXT AVAILABLE */}
      {tutorialPages[tutorialPage].text
      ? <p className='tutorialText'>{tutorialPages[tutorialPage].text}</p>
      : null}

      {/* CTA? */}
      {tutorialPages[tutorialPage].cta_url
      ? <Button variant="outlined" className={"ctaBtn"}>
          <a href={tutorialPages[tutorialPage].cta_url} target='_blank'>{tutorialPages[tutorialPage].cta_text}</a>
        </Button>
      : null}

      <div className="tutorialNav">

        {tutorialMaxPages == 0 
          ? <Button variant="outlined" onClick={()=>props.closeCallback()}>{`Close`}</Button>
          : tutorialMaxPages > tutorialPage
          ?<>
            <Button onClick={()=>previousPage()}>{`<`}</Button>
              <p>{`${tutorialPage+1}/${tutorialMaxPages+1}`}</p>
            <Button onClick={()=>nextPage()}>{`>`}</Button>
          </>
          : 
            <>
              <Button onClick={()=>previousPage()}>{`<`}</Button>
                <Button variant="outlined" onClick={()=>props.closeCallback()}>{`Close`}</Button>
              <Button onClick={()=>nextPage()}>{`>`}</Button>
            </>
        }


      </div>
    </div>
  );
}

export default Notification;