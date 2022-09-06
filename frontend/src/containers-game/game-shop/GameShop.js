import './game-shop.scss';
import 'react-toastify/dist/ReactToastify.css';

import {
  useEffect,
  useState,
} from 'react';

import axios from 'axios';

import CircularProgress from '@mui/material/CircularProgress';

import { playSound } from '../../utils/sounds';
import LotteryItem from './LotteryItem';
import ShopItem from './ShopItem';

const classNameForComponent = 'game-shop' // ex: game-inventory
const componentTitle = 'Ancient Shop' // ex: Inventory
const hasTab = true // true if this component has tabs
const tabNames = ['Shop', 'My Tickets'] // tab display names

function GameShop/* Component_Name_You_Want */(props) {
    const [ onLoading, setOnLoading ] = useState(true)
    useEffect(() => {
        // call api to get data for this component
        setOnLoading(false)
        getShop();
        getTickets();
    }, [])

    const [ currentTabIndex, setCurrentTabIndex ] = useState(0)
    const tabChanged = (index) => {
        playSound('tab')
        if ( index === 0 ) {
            setSelected('none')
        }
        setCurrentTabIndex(index)
    }

    const [idDelegate, setIdDelegate] = useState(props.idDelegate)
    useEffect(() => { setIdDelegate(props.idDelegate)}, [props.idDelegate])

    const [ shopItems, setShopItems ] = useState(null)
    const [ lotteryItems, setLotteryItems ] = useState(null)
    const [ nextDraws, setNextDraws ] = useState(true)

    const [ isReady, setIsReady ] = useState(false)
    const [ childReady, setChildReady ] = useState(true)
    
    const [ selected, setSelected ] = useState('none')

    useEffect(() => {
        shopItems && lotteryItems && childReady && setIsReady(true)
    }, [shopItems, lotteryItems, childReady])

    //Get Shop
    const getShop = async () => {
        axios({
            method: 'post',
            url: '/api/m1/shop/getShop',
            data: {
                address: props.metamask.walletAccount,
                idDelegate: idDelegate
            }
        })
        .then(response => {
            // console.log('response: ', response)

            response.data.success ? 
            setShopItems(response.data.data.catalog)
            : null
        })
        .catch(error => {
            error.response.status == 500
            && props.callback_Logout()
        
            error.response.status == 401
            && props.callback_Logout()
        })
    }

    //Get My Purchases
    const getTickets = async () => {
        axios({
            method: 'post',
            url: '/api/m1/ticket/getTickets',
            data: {
                address: props.metamask.walletAccount,
                idDelegate: idDelegate
            }
        })
        .then(response => {
            // console.log('getTickets: ', response)

            response.data.success ? 
            [setLotteryItems(response.data.data.tickets),
            setNextDraws(response.data.data.nextDraws)]
            : null
        })
        .catch(error => {
            error.response.status == 500
            && props.callback_Logout()
        
            error.response.status == 401
            && props.callback_Logout()
        })
    }
    
    const refreshAPIs = async () => {
        await getShop();
        await getTickets(); 
        setIsReady(true)
        setChildReady(true)
        setSelected('none')
    }

    return ( <>
        <div className={'game-component ' + classNameForComponent}>
            <div className='game-container'>
                <div className='header'>
                    <span className='title'>{componentTitle}</span>
                </div>
                <div className='content'>
                    { hasTab &&
                    <div className='tab-navs'>
                        { tabNames.map((tabName, index) => (
                            <div key={index} className={'tab-nav ' + (currentTabIndex === index ? 'active' : '')} onClick={() => tabChanged(index)}>{tabName}</div>
                        ))}
                    </div>}
                    <div className='scroll-content'>
                        { hasTab && 
                        <div className='tab-content'>
                            { currentTabIndex === 0 &&
                            <div className='shop-items'>
                                {!isReady ? <CircularProgress size={50} sx={{color:"gold"}}/> : null}
                                { shopItems?.map((item, i) => (
                                    <ShopItem
                                        key = {i}

                                        ConfirmContext={props.ConfirmContext}
                                        
                                        metamask = {props.metamask}
                                        inventory = {props.inventory}

                                        id = {item.id}
                                        name = {item.name}
                                        description = {item.description}
                                        image = {item.image}
                                        category = {item.category}
                                        price = {item.price}
                                        requirements = {item.requirements}

                                        supply = {item.supply}
                                        openAgain = {item.openAgain}

                                        selected = {selected}
                                        
                                        callback_showItem = {(id) => [playSound('touch'), setSelected(id)]}
                                        callback_refreshAPIs = {() => refreshAPIs() }
                                        callback_onLoading = {(status) => [setIsReady(status), setChildReady(status)]}
                                    
                                        gameCallback_newNFTS = {props.gameCallback_newNFTS}
                                        gameCallback_newInventory = {props.gameCallback_newInventory}

                                        idDelegate={idDelegate}
                                    />
                                ))}
                            </div>
                            }
                            { currentTabIndex === 1 &&
                            <>
                                <div className='next-draws'>
                                    {Array.isArray(nextDraws) && nextDraws.length > 0
                                        ? nextDraws?.map((item, i) => (
                                            <>
                                                <span className='draw'>
                                                    <b>{item.type}</b> Next Draw
                                                    <p>{getShortData(item.date)}</p>
                                                </span>
                                                    
                                            </>
                                        ))
                                        : !isReady ? <CircularProgress size={50} sx={{color:"gold"}}/> : null
                                    }
                                </div>
                                <div className='lottery-tickets'>
                                    {Array.isArray(lotteryItems) && lotteryItems.length > 0 
                                        ? lotteryItems.map((item, i) => (
                                            <LotteryItem
                                                key = {i}
                                                info = {item}
                                                type = {item.type}    
                                                image = {item.image}    
                                                quantity = {item.quantity}    
                                                status = {item.status}  
                                            />
                                        ))
                                        : isReady ? <p>Nothing to see, buy your first Lottery Ticket!</p> : null
                                    }
                                </div>
                            </>
                            }
                        </div>}
                    </div>
                </div>
            </div>
        </div>
        { onLoading ?
            <div className='game-on-loading'>
                <div className="sk-cube-grid">
                    <div className="sk-cube sk-cube1"></div>
                    <div className="sk-cube sk-cube2"></div>
                    <div className="sk-cube sk-cube3"></div>
                    <div className="sk-cube sk-cube4"></div>
                    <div className="sk-cube sk-cube5"></div>
                    <div className="sk-cube sk-cube6"></div>
                    <div className="sk-cube sk-cube7"></div>
                    <div className="sk-cube sk-cube8"></div>
                    <div className="sk-cube sk-cube9"></div>
                </div>
            </div>
        : null }
    </>)
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

export default GameShop // Component_Name_You_Want