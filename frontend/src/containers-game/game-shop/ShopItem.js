//STYLE
import './shop-item.scss';

import React, {
  useEffect,
  useState,
} from 'react';

import axios from 'axios';

//MUI
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import imgAncien from '../../assets-game/ancien.webp';
import iconError from '../../assets-game/iconError.svg';
//IMAGES
import iconVerified from '../../assets-game/iconVerified.svg';
import imgStone from '../../assets-game/stone.webp';
import imgWood from '../../assets-game/wood.webp';
//CUSTOM COMPONENTS
import { ButtonCustom } from '../../components';
import { playSound } from '../../utils/sounds';

function ShopItem(props) {
    const [idDelegate, setIdDelegate] = useState(props.idDelegate)
    useEffect(() => { setIdDelegate(props.idDelegate)}, [props.idDelegate])

    //Check if the User is allowed to buy the selected item
    const [isAllowed, setIsAllowed] = useState(true);

    //Check Buildings Levels Requirements 
    useEffect(() => { 
        props.requirements.map( (item, i) => (
            item.isAllowed == false 
            && setIsAllowed(false)
        ))
    }, [props.requirements]);

    //Check Price Requirements 
    useEffect(() => { 
        props.price.ancien && props.price.ancien > props.inventory.ancien 
        && setIsAllowed(false)

        props.price.wood && props.price.wood > props.inventory.wood 
        && setIsAllowed(false)

        props.price.stone && props.price.stone > props.inventory.stone 
        && setIsAllowed(false)
    }, [props.price, props.inventory]);



    //Popup and Buy
    const [openConfirmation, setOpenConfirmation] = React.useState(false);
    const [openConfirmed, setOpenConfirmed] = React.useState(false);
    const [onBuy, setOnBuy] = useState(false);

    const [minted, setMinted] = React.useState(null);
    const [buyID, setbuyID] = useState('null');

    //Open Confirmation Popup if BuyID is Setted 
    useEffect(() => { if (buyID != 'null') setOpenConfirmation(true); }, [buyID]);

    //Close Popups
    const handleCloseConfirmation = () => { setbuyID('null'); setOpenConfirmation(false); };
    const handleCloseConfirmed = () => { setOpenConfirmed(false); };

    //The user confirmed to Buy
    const buyConfirmation = (props) => {
        playSound('confirm')
        setOpenConfirmation(false);
        setOnBuy(true)
        buy(props);
    }

    //Buy API
    const buy = (props) => {
        axios({
            method: 'post',
            url: '/api/m1/shop/buyShop',
            data: {
                id: buyID,
                address: props.metamask.walletAccount,
                idDelegate: idDelegate
            }
        })
        .then(response => {
            // console.log('response: ', response)
            setOnBuy(false)

            if (response.data.success) { 
                setMinted(response.data.data.minted);
                setbuyID('null')
                playSound('buy')
                setOpenConfirmed(true);

                //Update the RSS Inventory and refresh the Shop
                props.gameCallback_newInventory(response.data.data.inventory.resources);
                props.callback_refreshAPIs();

                //If any NFT is changed, refresh it
                if (response.data.data.hasNfts) props.gameCallback_newNFTS(response.data.data.nfts)
            }
            else{ setOnBuy(false); alert('Error!'); }
        })
        .catch(error => {
            error.response.status == 500
            && props.callback_Logout()
        
            error.response.status == 401
            && props.callback_Logout()

            if (error.response.status == 409){
                setMinted('Nothing. Was sold out.');
                setbuyID('null')
                setOpenConfirmed(true);
                props.callback_refreshAPIs();
            }
        })
    }

    return (
        <>
            {props.selected == 'none' ?
                <div className={props.supply.isAllowed ? 'shopItem' : 'shopItem notAvailable'}>
                    {props.selected == 'none' ? 
                        <span className='itemPreview' 
                            onClick={() => 
                                !props.supply.isAllowed ? null //Item Disabled/Not Available
                                : props.callback_showItem(props.id)
                        }>
                            <h3>{props.name}</h3>
                            <h4>
                                {
                                (props.supply.isAllowed && props.supply.available < props.supply.total && props.supply.available != -1) ? //Supply Available, Item with a MAX supply
                                    `Available: ${props.supply.total - props.supply.available}/${props.supply.total}`
                                : (props.supply.isAllowed && props.supply.available == -1) ? //Supply Available, Item WITHOUT a MAX supply 
                                    `Minted: ${props.supply.total}`
                                : (!props.supply.isAllowed) ? //Supply NOT Available, Next Sales released
                                    `Minted: ${props.supply.total}`
                                : null //Item Disabled/Not Available
                                }
                            </h4>
                            <img src={props.image} />
                        </span>
                        : null
                    }
                </div>
            : props.selected != 'none' && props.selected == props.id ? //&& props.available ? 
                <div className='showItem'>

                        <img src={props.image} className='itemImage'/>
                        
                        <div className='itemInfo'>

                            <h3>{props.name}</h3>

                            <div className='requirements'>
                                {props.requirements.map( (item, i) => (
                                    <Requirement 
                                        key={i}
                                        type={item.type}
                                        level={item.level}
                                        isAllowed={item.isAllowed}
                                    />
                                ))}
                            </div>

                            <div className='prices'>
                                {props.price.ancien ? 
                                    <p className={props.inventory.ancien >= props.price.ancien ? 'price isEnough' : 'price'}>
                                        <img src={imgAncien}/> {format(props.price.ancien)}
                                    </p> 
                                    : null
                                }
                                {props.price.wood ? 
                                    <p className={props.inventory.wood >= props.price.wood ? 'price isEnough' : 'price'}>
                                        <img src={imgWood}/> {format(props.price.wood)}
                                    </p> 
                                    : null
                                }
                                {props.price.stone ? 
                                    <p className={props.inventory.stone >= props.price.stone ? 'price isEnough' : 'price'}>
                                        <img src={imgStone}/> {format(props.price.stone)}
                                    </p> 
                                    : null
                                }
                            </div>

                            {props.description.split('~')[0] 
                            ? <p className='descr'>{
                                props.description.split('~')[0]
                                }</p>
                            : null
                            }
                            {props.description.split('~')[1] 
                            ? <p className='descr'>{
                                props.description.split('~')[1]
                                }</p>
                            : null
                            }

                            <ButtonCustom 
                                style={isAllowed ? 'shop-buy' : 'shop-buy disabled'}
                                text={onBuy ? <CircularProgress size={25} sx={{color:"gray"}}/> : 'Mint'}
                                onButtonClick={ () => {isAllowed ? setbuyID(props.id) : null} }
                            />
                        </div>{/*itemInfo*/}
                </div>
            : null}

                <props.ConfirmContext.ConfirmationDialog
                    open={openConfirmation}
                    onClose={handleCloseConfirmation}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">
                        {"Shop Confirmation"}  
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            Do you want to mint?
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => buyConfirmation(props)} autoFocus>
                            Mint
                        </Button>
                    </DialogActions>
                </props.ConfirmContext.ConfirmationDialog>

                <props.ConfirmContext.ConfirmedDialog
                    open={openConfirmed}
                    onClose={handleCloseConfirmed}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">
                        {"Confirmed!"}  
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            You received:
                            {
                                (Array.isArray(minted) && minted.length > 0)
                                ?
                                minted.map( item => (
                                        <p className={`isPRNG_${item.prng}_${item.prngRarity}`}>
                                            - {item.item.name}
                                        </p>
                                    ))
                                : 'Nothing to display...'
                            }
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseConfirmed} autoFocus>
                            Ok!
                        </Button>
                    </DialogActions>
                </props.ConfirmContext.ConfirmedDialog>
        </>
    )
}

function Requirement(props) {

    const getRequirementName = (type, level) => {
        // console.log('getRequirementName: ', type, level)
        if (type > 3) return false

        if (type == 1) return `Town Hall Lv.${level}`
        if (type == 2) return `Lumberjack Lv.${level}`
        if (type == 3) return `Stone Mine Lv.${level}`
    }

    return (
        <div className='require'>
            <p>{getRequirementName(props.type, props.level)}</p>
            <span>
                {props.isAllowed 
                ? <img src={iconVerified} className='isVerified'/>
                : <img src={iconError} className='isMissing'/>}
            </span>
        </div>
    )
}

function getShortData(data){
    let shortData = data;
    
    if(shortData){ 
      shortData = new Date(shortData);
      shortData = shortData.toString();
      shortData = 
        '(' +
        shortData.split(' ')[1] + ' '
        + shortData.split(' ')[2] + ') '
        + shortData.split(' ')[4].split(':')[0] + ':'
        + shortData.split(' ')[4].split(':')[1] 
    }

    return shortData 
}

function format(x) {
    let newValue = x;

    newValue 
    && (newValue =  x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","))

    return newValue
}

export default ShopItem