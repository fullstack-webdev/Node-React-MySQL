import "./game-lp.scss";

import { useEffect, useRef, useState } from "react";

import axios from "axios";

import {
  Button,
  CircularProgress,
  LinearProgress,
  SvgIcon,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

import AnnouncementIcon from "@mui/icons-material/Announcement";
import RefreshIcon from "@mui/icons-material/Refresh";
import { getRemainingTime_InMinute, msToTime } from "../../utils/utils";

import {tutorialPages} from "./tutorial.js";

const urlLiquidityPool = "https://app.uniswap.org/#/add/ETH/0xDD1DB78a0Acf24e82e511454F8e00356AA2fDF0a/10000?chain=polygon";
const urlLiquidityMyPools = "https://app.uniswap.org/#/pool?chain=polygon";

function GameLP(props) {
  const [loading, setLoading] = useState(true);
  const [blessing, setBlessing] = useState(false); //Blessing On Going
  const [blessingDone, setBlessingDone] = useState(false);
  const [liquidityProvided, setLiquidityProvided] = useState(0);
  const [blessingEndingTime, setBlessingEndingTime] = useState(0);

  const [tutorial, setTutorial] = useState(false);

  const [popupVisible, setPopupVisible] = useState(false);
  const [drop, setDrop] = useState(null);

  const [idDelegate, setIdDelegate] = useState(props.idDelegate);
  useEffect(() => {
    setIdDelegate(props.idDelegate);
  }, [props.idDelegate]);

  // Get Data
  useEffect(() => {
    getBlessing();
  }, []);

  //APIS
  const getBlessing = () => {
    setLoading(true);
    axios
      .post("/api/m1/profile/getBlessing", {
        address: props.metamask.walletAccount,
        IdDelegate: idDelegate,
      })
      .then((res) => {
        setBlessing(res.data.blessing.blessingOnGoing);
        setBlessingDone(res.data.blessing.blessingDone);
        setLiquidityProvided(res.data.liquidity);
        let timeObject = msToTime(
          getRemainingTime_InMinute(res.data.blessing.blessingEndingTime)
        );
        setBlessingEndingTime(
          `${timeObject.hours} hours ${timeObject.minutes} minutes`
        );
        setLoading(false);
      })
      .catch((error) => {
        error.response.status == 500 && props.callback_Logout();
        error.response.status == 401 && props.callback_Logout();
      });
  };
  const askForBlessing = () => {
    setLoading(true);
    axios
      .post("/api/m1/profile/askForBlessing", {
        address: props.metamask.walletAccount,
        IdDelegate: idDelegate,
      })
      .then((res) => getBlessing())
      .catch((error) => {
        error.response.status == 500 && props.callback_Logout();
        error.response.status == 401 && props.callback_Logout();
      });
  };
  const claimBlessing = () => {
    setLoading(true);
    axios
      .post("/api/m1/profile/claimBlessing", {
        address: props.metamask.walletAccount,
        IdDelegate: idDelegate,
      })
      .then((res) => {
        let dropResult = res.data.itemDrop;
        setDrop({
          image: dropResult.image,
          name: dropResult.name,
          quantity: dropResult.quantity,
        });
        setPopupVisible(true);
      })
      .catch((error) => {
        error.response.status == 500 && props.callback_Logout();
        error.response.status == 401 && props.callback_Logout();
      });
  };

  return (
    <>
      <div className="game-component game-lp">
        <div className="game-container">
          <div className="header">
            <span className="title">Divine Temple</span>
          </div>
          <div className="content">
            <div className="scroll-content">
              {loading && !tutorial ? (
                <CircularProgress size={50} sx={{ color: "gold" }} />
              ) : !loading && !tutorial ? (
                <BlessingBody
                  blessing={blessing}
                  blessingDone={blessingDone}
                  liquidityProvided={liquidityProvided}
                  blessingEndingTime={blessingEndingTime}
                  askForBlessingCallback={() => askForBlessing()}
                  refreshCallback={() => getBlessing()}
                  claimBlessingCallback={() => claimBlessing()}
                  tutorialCallback={() => setTutorial(true)}
                />
              ) : tutorial ? (
                <Tutorial tutorialExitCallback={() => setTutorial(false)} />
              ) : null}
            </div>
          </div>
        </div>

        <props.ConfirmContext.ConfirmationDialog
          open={popupVisible}
          onClose={() => {
            getBlessing();
            setPopupVisible(false);
          }}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">Blessing Reward</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              <div className="blessingReward">
                <p className="blessingRewardDrop">
                  -{" "}
                  <img src={drop?.image} className="blessingRewardDropImage" />
                  {drop?.name} x{drop?.quantity}
                </p>
                Check your Inventory to view the reward!
              </div>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                getBlessing();
                setPopupVisible(false);
              }}
            >
              Close
            </Button>
          </DialogActions>
        </props.ConfirmContext.ConfirmationDialog>
      </div>
    </>
  );
}

function Tutorial(props) {
  const [tutorialPage, setTutorialPage] = useState(0);
  const tutorialMaxPages = Object.keys(tutorialPages).length-1;

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

      <div className="tutorialHead">
        {/* <Button onClick={() => props.tutorialExitCallback()}>{`Back`}</Button> */}
        <h2>{tutorialPages[tutorialPage].headline}</h2>
      </div>

      {/* IMAGE AVAILABLE */}
      {tutorialPages[tutorialPage].image
      ? <img src={tutorialPages[tutorialPage].image} className='tutorialImg'/>
      : null}
      
      <p className='tutorialText'>{tutorialPages[tutorialPage].text}</p>

      {/* CTA? */}
      {tutorialPages[tutorialPage].cta
      ? <Button variant="outlined" className={"ctaBtn"} onClick={() => window.open(urlLiquidityPool, '_blank').focus()}>
          Open Uniswap
        </Button>
      : null}

      <div className="tutorialNav">
        <Button onClick={()=>previousPage()}>{`<`}</Button>
        <p>{`${tutorialPage+1}/${tutorialMaxPages+1}`}</p>
        <Button onClick={()=>nextPage()}>{`>`}</Button>
      </div>
    </div>
  );
}

function BlessingBody(props) {
  return (
    <>
      {props.blessing ? (
        props.blessingDone ? (
          <BlessingDone claimBlessingCallback={props.claimBlessingCallback} />
        ) : (
          <BlessingRunning blessingEndingTime={props.blessingEndingTime} />
        )
      ) : (
        <BlessingNotRunning
          liquidityProvided={props.liquidityProvided}
          refreshCallback={props.refreshCallback}
          askForBlessingCallback={props.askForBlessingCallback}
          tutorialCallback={props.tutorialCallback}
        />
      )}
    </>
  );
}

//BLESSING NOT RUNNING
function BlessingNotRunning(props) {
  return (
    <div className="blessing">
      <p>
        The Divine Temple is an ancient place where Deities manifest to bless
        those who believe.
      </p>
      <p>
        Blessings are granted to Citizens who <b>provide liquidity</b> in the
        game.
      </p>

      {/* LIQUIDITY EMPTY */}
      {!props.liquidityProvided ? (
        <>
          <p className="blessingStatus waiting">
            <SvgIcon component={AnnouncementIcon} />
            It seems you've not provided liquidity yet
            <SvgIcon
              className="icon-button max-right"
              component={RefreshIcon}
              onClick={() => props.refreshCallback()}
            />
          </p>
          <Button variant="outlined" onClick={() => props.tutorialCallback()}>
            Add Liquidity
          </Button>
        </>
      ) : null}

      {/* LIQUIDITY PROVIDED */}
      {props.liquidityProvided ? (
        <>
          <p className="blessingStatus success">
            <SvgIcon component={AnnouncementIcon} />
            Liquidity Provided: {props.liquidityProvided} $ANCIEN
            <SvgIcon
              className="icon-button max-right"
              component={RefreshIcon}
              onClick={() => props.refreshCallback()}
            />
          </p>
          <span>
            <Button
              variant="outlined"
              onClick={() => props.askForBlessingCallback()}
            >
              Ask for Blessing
            </Button>
            <Button
              className={"success-border"}
              variant="outlined"
              onClick={() => window.open(urlLiquidityMyPools, '_blank').focus()}
            >
              Add Liquidity
            </Button>
          </span>
        </>
      ) : null}
    </div>
  );
}

//BLESSING RUNNING
function BlessingRunning(props) {
  return (
    <div className="blessing">
      <p>You feel invigorated and hear an angelic voice thanking you...</p>
      <p>
        Travel back to the Temple in{" "}
        <b className="gold">{props.blessingEndingTime}</b> to check the results
        of the Blessing
      </p>
      <p className="blessingStatus warning">
        <SvgIcon component={AnnouncementIcon} />
        If you remove your liquidity during this time you won't receive any
        rewards.
      </p>
      <LinearProgress className={"full-width"} color="inherit" />
    </div>
  );
}

//BLESSING DONE
function BlessingDone(props) {
  return (
    <div className="blessing">
      <p>As soon as you step into the temple you hear a whisper...</p>
      <p>
        <b className="gold">"You're the chosen one... Citizen..."</b>
      </p>
      <p>
        A Dazzling Light fills the Temple and a Chest that appears made of
        condensed light appears in front of you
      </p>
      <p>
        Open the Chest and <b className="gold">claim your Blessing!</b>
      </p>
      <p className="blessingStatus success">
        <SvgIcon component={AnnouncementIcon} />
        Add more liquidity to receive stronger Blessings.
      </p>
      <Button variant="outlined" onClick={() => props.claimBlessingCallback()}>
        Open Chest
      </Button>
    </div>
  );
}

export default GameLP;
