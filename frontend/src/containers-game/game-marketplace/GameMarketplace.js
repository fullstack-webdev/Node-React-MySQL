import './game-marketplace.scss';

import {
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

import {
  MarketplaceProfile,
  TableHistory,
  TableInventory,
  TableMarketplace,
} from '../../components-game';
import { playSound } from '../../utils/sounds';

const classNameForComponent = 'game-marketplace' // ex: game-inventory
const componentTitle = 'Marketplace' // ex: Inventory
const hasTab = true // true if this component has tabs
const tabNames = ['Buy', 'Storage', 'Inventory', 'History'] // tab display names

function GameMarketplace/* Component_Name_You_Want */(props) {
    const [onLoading, setOnLoading] = useState(true)

    const [currentTabIndex, setCurrentTabIndex] = useState(0)
    const tabChanged = (index) => {
        playSound('tab')
        if (currentTabIndex === index) {
            return
        }
        setCurrentTabIndex(index)
        if (index === 0) {
            setIsMarketplaceReady(false)
            setPage(1)
            setType(null)
            getMarketplaceListings()
        }
    }

    const [idDelegate, setIdDelegate] = useState(props.idDelegate)
    useEffect(() => { setIdDelegate(props.idDelegate) }, [props.idDelegate])
    //Ancien Balance
    const [ancien, setAncien] = useState(props.inventory.ancien)

    //Vars
    const [isReady, setIsReady] = useState(false)
    const [isMarketplaceReady, setIsMarketplaceReady] = useState(false)
    const [isMarketplaceProfileReady, setIsMarketplaceProfileReady] = useState(false)
    const [isMarketplaceHistoryReady, setIsMarketplaceHistoryReady] = useState(false)
    const [tabName, setTabName] = useState('buy')

    //Json Tables
    const [jsonMarketplace, setJsonMarketplace] = useState(null)
    const [jsonMarketplaceProfile, setJsonMarketplaceProfile] = useState(null)
    const [jsonMarketplaceHistory, setJsonMarketplaceHistory] = useState(null)

    //My Listings - AdAllowed
    const [adAllowed, setAdAllowed] = useState(false)

    //Marketplace RSS Listings - Filter and Pages
    const [type, setType] = useState(null)
    const [page, setPage] = useState(1)

    //Marketplace Inventory Listings - Filter and Pages
    const [typeInventory, setTypeInventory] = useState(null)
    const [pageInventory, setPageInventory] = useState(1)
    const [filterInventory, setFilterInventory] = useState(null)

    //Next Page is Available?
    const [nextPage, setNextPage] = useState(false)

    //Marketplace History - Filter and Pages
    const [typeHistory, setTypeHistory] = useState(null)
    const [pageHistory, setPageHistory] = useState(1)
    const [nextPageHistory, setNextPageHistory] = useState(false)

    //Buy
    const [openConfirmation, setOpenConfirmation] = useState(false)
    const [openConfirmed, setOpenConfirmed] = useState(false)
    const [onBuy, setOnBuy] = useState({
        id: null,
        type: null,
        resourceName: null,
        quantity: null,
        totalPrice: null
    })

    useEffect(() => {
        // call api to get data for this component
        setOnLoading(false)
        // await getMarketplaceListings()
        // await getMyListings()
        // await getMarketplaceHistory()
        getMarketplaceListings()
        getMyListings()
        getMarketplaceHistory()
        setIsReady(true)
    }, [])
    useEffect(() => {
        //Check if Ancien (State) is different than Ancien (Props)
        ancien != props.inventory.ancien && setAncien(props.inventory.ancien)
    }, [ancien, props.inventory.ancien])

    //MY PROFILE -- START
    //###

    //My Listings
    const getMyListings = async () => {
        axios({
            method: 'post',
            url: '/api/m1/marketplace/getAccountListing',
            data: {
                address: props.metamask.walletAccount,
                idDelegate: idDelegate
            }
        })
            .then(response => {
                response.data.success ? [
                    setJsonMarketplaceProfile(response.data.data.listings),
                    setAdAllowed(response.data.data.adAllowed),
                    setIsMarketplaceProfileReady(true)
                ]
                    : null
            })
            .catch(error => {
                error.response.status == 500
                    && props.callback_Logout()

                error.response.status == 401
                    && props.callback_Logout()
            })
    }

    //Utility Funcions
    const newData = (data, inventory, adAllowedP) => {
        setJsonMarketplaceProfile(data)
        setAdAllowed(adAllowedP)
        props.gameCallback_newInventory(inventory)
        isReadyF(true)
    }

    const isReadyF = (status) => {
        // console.log('isReady: ', status)
        setIsMarketplaceProfileReady(status)
    }

    //###
    //MY PROFILE -- END



    //MARKETPLACE -- START
    //###

    //Marketplace RSS Listings
    const getMarketplaceListings = async () => {
        // console.log('marketplace/getAllListing')

        axios({
            method: 'post',
            url: '/api/m1/marketplace/getAllListing',
            data: {
                address: props.metamask.walletAccount,
                idDelegate: idDelegate,
                page: page,
                type: type,
                status: 1
            }
        })
            .then(response => {
                response.data.success ? [
                    setJsonMarketplace(response.data.data.listings),
                    setNextPage(response.data.data.nextPage),
                    setIsMarketplaceReady(true)
                ]
                    : null
            })
            .catch(error => {
                error.response.status == 500
                    && props.callback_Logout()

                error.response.status == 401
                    && props.callback_Logout()
            })
    }

    //Marketplace Inventory Listings
    const getMarketplaceInventory = async () => {
        // console.log('marketplaceInventory/getAllListing...')
        if (!typeInventory) return
        axios({
            method: 'post',
            url: '/api/m1/marketplaceInventory/getAllListing', //Inventory TO CHANGE
            data: {
                address: props.metamask.walletAccount,
                idDelegate: idDelegate,
                inventoryType: typeInventory,
                name: (filterInventory ? filterInventory : null),
                page: pageInventory,
                status: 1
            }
        })
            .then(response => {
                // console.log(response)
                response.data.success ? [
                    setJsonMarketplace(response.data.data.listings),
                    setNextPage(response.data.data.nextPage),
                    setIsMarketplaceReady(true)
                ]
                    : null
            })
            .catch(error => {
                error.response.status == 500
                    && props.callback_Logout()

                error.response.status == 401
                    && props.callback_Logout()
            })
    }

    const getMarketplaceHistory = async () => {
        // console.log('getMarketplaceListings...')

        axios.post('/api/m1/marketplace/getAllListing', {
            address: props.metamask.walletAccount,
            idDelegate: idDelegate,
            page: pageHistory,
            type: typeHistory,
            status: 2
        })
            .then(response => {
                response.data.success ? [
                    setJsonMarketplaceHistory(response.data.data.listings),
                    setNextPageHistory(response.data.data.nextPage),
                    setIsMarketplaceHistoryReady(true)
                ]
                    : null
            })
            .catch(error => {
                error.response.status == 500
                    && props.callback_Logout()

                error.response.status == 401
                    && props.callback_Logout()
            })
    }

    const buyConfirmation = (id, typeP, resourceNameP, quantityP, totalPriceP, marketP) => {
        playSound('confirm')
        // console.log('buyConfirmation: ', id, typeP, resourceNameP, quantityP, totalPriceP, marketP)

        setOnBuy({
            id: id,
            type: typeP,
            resourceName: resourceNameP,
            quantity: quantityP,
            totalPrice: totalPriceP,
            market: marketP
        })
        setOpenConfirmation(true)
    }

    const buy = () => {
        // console.log('buy... ID: ', id)
        setOpenConfirmation(false)
        setIsMarketplaceReady(false)

        axios({
            method: 'post',
            url: (onBuy.market == 'storage'
                ? '/api/m1/marketplace/buy'
                : onBuy.market == 'inventory'
                    ? '/api/m1/marketplaceInventory/buy'
                    : 'error'),
            data: {
                address: props.metamask.walletAccount,
                idDelegate: idDelegate,
                id: onBuy.id,
                status: 1,
                filter: filterInventory,
                page: (onBuy.market == 'storage'
                    ? page
                    : onBuy.market == 'inventory'
                        ? pageInventory
                        : 'error')
            }
        })
            .then(response => {
                // console.log('Response Buy: ', response)
                response.data.success
                    ? //Buy Successful
                    [
                        setJsonMarketplace(response.data.data.listings),
                        setNextPage(response.data.data.nextPage),
                        setPage(1),
                        setIsMarketplaceReady(true),
                        playSound('buy'),
                        setOpenConfirmed(true),
                        props.gameCallback_newInventory(response.data.data.inventory.resources)
                    ]
                    : //Listing not available anymore
                    [
                        setJsonMarketplace(response.data.data.listings),
                        setNextPage(response.data.data.nextPage),
                        setPage(1),
                        setIsMarketplaceReady(true),
                        props.gameCallback_newInventory(response.data.data.inventory.resources),
                        alert('Listing not available anymore')
                    ]
            })
            .catch(error => {
                error.response.status == 500
                    && props.callback_Logout()

                error.response.status == 401
                    && props.callback_Logout()
            })
    }



    //MARKETPLACE BUY TAB

    //RSS
    //setType (Filter)
    const setTypeF = (typeP) => {
        setIsMarketplaceReady(false)
        setType(typeP)
        setTypeInventory(null)
        setPage(1)
    }
    useEffect(() => {
        getMarketplaceListings()
    }, [type])

    //setPage 
    const setPageF = (pageP) => {
        // console.log('setPageF')
        setIsMarketplaceReady(false)
        setPage(pageP)
        getMarketplaceListings()
    }
    useEffect(() => {
        getMarketplaceListings()
    }, [page])

    //Refresh
    const refresh = () => {
        setIsMarketplaceReady(false)
        setIsMarketplaceProfileReady(false)
        getMarketplaceListings()
        getMyListings()
    }
    //### --- RSS

    //Inventory
    //setTypeInventory (Filter)
    const setTypeInventoryHandle = (typeInventory) => {
        setIsMarketplaceReady(false)
        setTypeInventory(typeInventory)
        setPageInventory(1)
    }
    useEffect(() => {
        // console.warn('type API')
        getMarketplaceInventory()
    }, [typeInventory])

    //setPage 
    const setPageInventoryHandle = (pageInventory) => {
        // console.log('setPageInventoryHandle')
        setIsMarketplaceReady(false)
        setPageInventory(pageInventory)
    }
    useEffect(() => {
        // console.warn('page API')
        getMarketplaceInventory()
    }, [pageInventory])

    const setFilterInventoryHandle = (filterInventory) => {
        setIsMarketplaceReady(false)
        setFilterInventory(filterInventory)
        setPageInventory(1)
    }
    useEffect(() => {
        // console.warn('filter API')
        getMarketplaceInventory()
    }, [filterInventory])

    //MARKETPLACE BUY ENDS



    //MARKETPLACE HISTORY
    //setType (Filter)
    const setTypeHistoryF = (typeP) => {
        setIsMarketplaceHistoryReady(false)
        setTypeHistory(typeP)
        setPageHistory(1)
    }
    useEffect(() => {
        getMarketplaceHistory()
    }, [typeHistory])

    //setPage
    const setPageHistoryF = (pageP) => {
        setIsMarketplaceHistoryReady(false)
        setPageHistory(pageP)
        getMarketplaceHistory()
    }
    useEffect(() => {
        getMarketplaceHistory()
    }, [pageHistory])

    //Refresh
    const refreshHistory = () => {
        setIsMarketplaceReady(false)
        setIsMarketplaceProfileReady(false)
        setIsMarketplaceHistoryReady(false)
        getMarketplaceListings()
        getMyListings()
        getMarketplaceHistory()
    }
    //MARKETPLACE HISTORY ENDS



    //###
    //MARKETPLACE -- END

    return (<>
        <div className={'game-component ' + classNameForComponent}>
            <div className='game-container'>
                <div className='header'>
                    <span className='title'>{componentTitle}</span>
                </div>
                <div className='content'>
                    {hasTab &&
                        <div className='tab-navs'>
                            {tabNames.map((tabName, index) => (
                                <div key={index} className={'tab-nav ' + (currentTabIndex === index ? 'active' : '')} onClick={() => tabChanged(index)}>{tabName}</div>
                            ))}
                        </div>}
                    <div className='scroll-content'>
                        {hasTab &&
                            <div className='tab-content'>
                                {currentTabIndex === 0 && isMarketplaceReady ?
                                    //BUY
                                    <TableMarketplace
                                        metamask={props.metamask}
                                        ancien={ancien}
                                        data={jsonMarketplace}
                                        nextPage={nextPage}

                                        type={!typeInventory ? type : typeInventory}
                                        page={!typeInventory ? page : pageInventory}
                                        filter={filterInventory}

                                        callback_buy={buyConfirmation}

                                        //RSS
                                        // callback_refresh={refresh}
                                        callback_setType={setTypeF}
                                        callback_setPage={setPageF}

                                        //Inventory
                                        callback_setTypeInventory={setTypeInventoryHandle}
                                        callback_setPageInventory={setPageInventoryHandle}
                                        callback_setFilterInventory={setFilterInventoryHandle}

                                        callback_Logout={() => props.callback_Logout()}

                                        idDelegate={idDelegate}
                                    />

                                    : currentTabIndex === 1 && isMarketplaceProfileReady ?

                                        //SELL
                                        <MarketplaceProfile
                                            metamask={props.metamask}
                                            inventory={props.inventory}
                                            data={jsonMarketplaceProfile}
                                            adAllowed={adAllowed}

                                            callback_newData={newData}
                                            callback_isReady={isReadyF}

                                            callback_Logout={() => props.callback_Logout()}

                                            idDelegate={idDelegate}
                                        />

                                        : currentTabIndex === 2 ?

                                            //INVENTORY
                                            <TableInventory
                                                metamask={props.metamask}
                                                inventory={props.inventory}
                                                callback_Logout={() => props.callback_Logout()}

                                                idDelegate={idDelegate}
                                            />

                                            : currentTabIndex === 3 && isMarketplaceHistoryReady ?

                                                //HISTORY
                                                <TableHistory
                                                    data={jsonMarketplaceHistory}
                                                    type={typeHistory}
                                                    page={pageHistory}
                                                    nextPage={nextPageHistory}

                                                    callback_refresh={refreshHistory}
                                                    callback_setType={setTypeHistoryF}
                                                    callback_setPage={setPageHistoryF}

                                                    idDelegate={idDelegate}
                                                />

                                                : <CircularProgress size={50} sx={{ color: "gold", padding: "30px" }} />
                                }
                            </div>}
                    </div>
                </div>
            </div>
            <props.ConfirmContext.ConfirmationDialog
                open={openConfirmation}
                onClose={() => setOpenConfirmation(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Shop Confirmation"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Do you want to buy <b>{onBuy.quantity} {onBuy.resourceName}</b> for <b>{onBuy.totalPrice} ANCIEN</b>?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => buy()} autoFocus>
                        Buy
                    </Button>
                </DialogActions>
            </props.ConfirmContext.ConfirmationDialog>

            <props.ConfirmContext.ConfirmedDialog
                open={openConfirmed}
                onClose={() => setOpenConfirmed(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Confirmed!"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        You received:
                        <p>
                            - {onBuy.quantity} {onBuy.resourceName}
                        </p>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenConfirmed(false)} autoFocus>
                        Ok!
                    </Button>
                </DialogActions>
            </props.ConfirmContext.ConfirmedDialog>
        </div>
        {onLoading ?
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
            : null}
    </>)
}

export default GameMarketplace // Component_Name_You_Want