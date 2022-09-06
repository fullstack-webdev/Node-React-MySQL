import './marketplace-inventory.scss';

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import axios from 'axios';
import { ethers } from 'ethers';
// import mapImage from '../scholarship/map.jpg';
import { Scrollbars } from 'react-custom-scrollbars';
import { Link } from 'react-router-dom';

import styled from '@emotion/styled';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import {
  Backdrop,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  InputBase,
} from '@mui/material';
import { useWeb3React } from '@web3-react/core';

import iconBack from '../../assets-game/arrow_back.svg';
import { TableInventoryInfo } from '../../components-game';
// import BonusBar from '../../components-game/bonus/BonusBar';
// import BonusView from '../../components-game/bonus/BonusView';
import { serverConfig } from '../../config/serverConfig';
import {
  format,
  toFixed,
} from '../../utils/utils';
import { walletConnector } from '../../utils/walletConnector';
import mapImage from './marketplace_black.jpg';

const CryptoJS = require("crypto-js");

const g_mapSize = { width: 1200, height: 675 }
const imgRecipe = 'https://ancient-society.s3.eu-central-1.amazonaws.com/inventory/recipe.png'
const imgItem = 'https://ancient-society.s3.eu-central-1.amazonaws.com/inventory/item.png'
const imgTool = 'https://ancient-society.s3.eu-central-1.amazonaws.com/inventory/tool.png'
const ANCIEN_IMAGE = 'https://ancient-society.s3.eu-central-1.amazonaws.com/resources/ancien.webp'
const WOOD_IMAGE = 'https://ancient-society.s3.eu-central-1.amazonaws.com/resources/wood.webp'
const STONE_IMAGE = 'https://ancient-society.s3.eu-central-1.amazonaws.com/resources/stone.webp'

const ConfirmationDialog = styled(Dialog)`
  & > .MuiDialog-container {
    backdrop-filter: blur(2px);
  }
  & > .MuiDialog-container > .MuiPaper-root {
    background-color: #121e2a;
    border: 1px solid #ffffff26;
    box-shadow: 0px 0px 20px 5px black;
  }
  & > .MuiDialog-container > .MuiPaper-root > .MuiDialogTitle-root {
    font: bold 1.2rem Cinzel;
    color: white;
  }
  &
    > .MuiDialog-container
    > .MuiPaper-root
    > .MuiDialogContent-root
    > .MuiDialogContentText-root {
    font: normal 1.2rem Raleway;
    color: white;
    text-align: center;
    line-height: 1.5;
    word-break: break-word;
  }
  & > .MuiDialog-container > .MuiPaper-root > .MuiDialogActions-root {
    padding: 0rem 0rem 1rem 0rem !important;
  }
  &
    > .MuiDialog-container
    > .MuiPaper-root
    > .MuiDialogActions-root
    > .MuiButton-root {
    font: bold 1rem Cinzel;
    color: gray;
    border: 1px solid gray;
    margin: 0 auto;
    &:hover {
      color: white;
      border: 1px solid white;
    }
  }
`;
const ConfirmedDialog = styled(Dialog)`
  & > .MuiDialog-container {
    backdrop-filter: blur(2px);
  }
  & > .MuiDialog-container > .MuiPaper-root {
    background-color: #121e2a;
    border: 1px solid #ffffff26;
    box-shadow: 0px 0px 20px 5px black;
  }
  & > .MuiDialog-container > .MuiPaper-root > .MuiDialogTitle-root {
    font: bold 1.2rem Cinzel;
    color: white;
  }
  &
    > .MuiDialog-container
    > .MuiPaper-root
    > .MuiDialogContent-root
    > .MuiDialogContentText-root {
    font: normal 1.2rem Raleway;
    color: white;
    text-align: center;
    line-height: 1.5;
    word-break: break-word;
  }
  &
    > .MuiDialog-container
    > .MuiPaper-root
    > .MuiDialogContent-root
    > .MuiDialogContentText-root
    > p {
    font: normal 1.2rem Cinzel;
    color: white;
    text-align: center;
  }
  &
    > .MuiDialog-container
    > .MuiPaper-root
    > .MuiDialogContent-root
    > .MuiDialogContentText-root
    > p.isPRNG_true {
    color: #ffb13b;
  }
  &
    > .MuiDialog-container
    > .MuiPaper-root
    > .MuiDialogContent-root
    > .MuiDialogContentText-root
    > p.isPRNG_true_1 {
    color: #ffb13b;
  }
  &
    > .MuiDialog-container
    > .MuiPaper-root
    > .MuiDialogContent-root
    > .MuiDialogContentText-root
    > p.isPRNG_true_2 {
    color: red;
  }
  & > .MuiDialog-container > .MuiPaper-root > .MuiDialogActions-root {
    padding: 0rem 0rem 1rem 0rem !important;
  }
  &
    > .MuiDialog-container
    > .MuiPaper-root
    > .MuiDialogActions-root
    > .MuiButton-root {
    font: bold 1rem Cinzel;
    color: gray;
    border: 1px solid gray;
    margin: 0 auto;
    &:hover {
      color: white;
      border: 1px solid white;
    }
  }
`;
const ConfirmDialogs = {
    ConfirmationDialog: ConfirmationDialog,
    ConfirmedDialog: ConfirmedDialog,
};

function MarketplaceInventory() {

    const [onLoading, setOnLoading] = useState(true)
    const [res, setRes] = useState(null)
    const [inventoryData, setInventoryData] = useState([])
    const [resources, setResources] = useState({ ancien: 0, wood: 0, stone: 0 })

    const [isVisibleBuyButton, setIsVisibleBuyButton] = useState(false)
    const [buyCartData, setBuyCartData] = useState([])
    const [buyTotalQuantity, setBuyTotalQuantity] = useState(0)
    const [buyTotalPrice, setBuyTotalPrice] = useState(0)

    useEffect(() => {
        let sumQuantity = 0;
        let sumPrice = 0;

        buyCartData.forEach(data => {
            sumQuantity += data.quantity
            sumPrice += data.totalPrice
        });

        setBuyTotalQuantity(sumQuantity)
        setBuyTotalPrice(sumPrice)
    }, [buyCartData])

    const getResources = async (idDelegateData) => {
        axios.post("/api/m1/user/getResources", {
            address: walletAccount,
            idDelegate: idDelegateData,
        })
            .then((response) => {
                response.data.success
                    ? setResources({
                        ancien: response.data.data.resources.ancien,
                        wood: response.data.data.resources.wood,
                        stone: response.data.data.resources.stone,
                    })
                    : null;
            })
            .catch((error) => {
                gameButton.current.click()
            });
    }

    const getCheapestInventories = async () => {
        axios.post('/api/m1/marketplaceInventory/getCheapestInventories', {
            address: walletAccount
        })
            .then(response => {
                if (response.data.success) {
                    let resources = response.data.data.resources
                    let resourceList = []
                    for (let resource of resources) {
                        resourceList.push({
                            inventoryType: 'resource',
                            inventoryId: resource.type,
                            inventoryPrice: resource.price,
                            inventoryName: resource.type == 2 ? 'Wood' : resource.type == 3 ? 'Stone' : 'Unknown Resource',
                            inventoryImage: resource.type == 2 ? WOOD_IMAGE : resource.type == 3 ? STONE_IMAGE : 'Unknown Resource',
                            inventoryDesc: 'Wood & Stone',
                            inventoryLevel: 0
                        })
                    }
                    setRes({ items: response.data.data.items, tools: response.data.data.tools, recipes: response.data.data.recipes, resources: resourceList })
                    setInventoryData([...resourceList, ...response.data.data.items, ...response.data.data.tools, ...response.data.data.recipes])
                    setOnLoading(false)
                }
            })
            .catch(error => {
                gameButton.current.click()
            })
    }

    // integrate web3-react
    const {
        library,
        chainId,
        account,
        active,
        activate,
        deactivate,
        error,
    } = useWeb3React();

    useEffect(() => {
        error && console.log('Web3React Error', error);
        error && redirectButton.current.click();
    }, [error])

    // Check JWT for the wallet account
    const [onAuthenticate, setOnAuthenticate] = useState(false);
    useEffect(() => {
        console.log(`onAuthenticate: ${onAuthenticate}`);
    }, [onAuthenticate])
    const authenticate = () => {
        setOnAuthenticate(true);

        const JWT = getCookie(walletAccount); //Get JWT Cookie with the name(wallet account)

        JWT
            ? sendIsLogged() //If JWT Cookie is set
            : redirectButton.current.click() //If JWT Cookie is missing
    }
    const sendIsLogged = () => {
        axios({
            method: 'post',
            url: '/api/m1/auth/isLogged',
            data: {
                address: walletAccount
            }
        })
            .then(response => {
                response.data.success
                    ? loginSuccess()
                    : redirectButton.current.click();
            })
            .catch(error => {
                console.log('isLogged Error', error)
                if (error.response.status == 401) {
                    redirectButton.current.click();
                }
            });
    };
    const loginSuccess = async () => {
        const signed = await isSigned();
        console.log('signed: ', signed);
        if (!signed) {
            redirectButton.current.click();
        }
        setIsLogged(true);
    };
    // check if the account is already signed
    const isSigned = async () => {
        let signed = false;

        await axios.post('/api/m1/auth/isSigned', {
            address: account
        })
            .then(response => {
                const res = response.data
                signed = res.success
            })
            .catch(error => {
                console.log('isSigned Error', error);
            });

        return signed;
    };

    const [walletMethod, setWalletMethod] = useState('')
    useEffect(() => {
        const provider = new ethers.providers.Web3Provider(window.ethereum, "any");

        const getNetwork = async () => {
            const network = await provider.getNetwork();
            return network;
        }
        const { ethereum } = window;
        if (ethereum && ethereum.on && active) {
            console.log('provider', provider);
            setWalletProvider(provider);

            getNetwork().then((network) => {
                console.log('network', network);
                setWalletNetwork(network);
            })

            console.log('wallet method', walletMethod);
            if (walletMethod == 'injected') {
                const signer = provider.getSigner();
                console.log('signer', signer);
                setWalletSigner(signer);
            } else if (walletMethod == 'coinbaseWallet') {
                const signer = library.getSigner();
                console.log('signer', signer);
                setWalletSigner(signer);
            }

            console.log('account', account);
            setWalletAccount(account);

            if (chainId != serverConfig.blockchain.network.chainId) {
                redirectButton.current.click()
            }

            // handlers
            const handleConnect = () => {
                console.log("Handling 'connect' event")
            }
            const handleChainChanged = (newChainId) => {
                console.log("Chain changed", newChainId, walletMethod);
                if (newChainId != serverConfig.blockchain.network.chainId) {
                    redirectButton.current.click()
                }
            }
            const handleAccountsChanged = (accounts) => {
                console.log("Handling 'accountsChanged' event with payload", accounts)
                redirectButton.current.click()
            }
            const handleNetworkChanged = (networkId) => {
                console.log("Handling 'networkChanged' event with payload", networkId)
                // this doesn't happen usually
                redirectButton.current.click()
            }

            ethereum.on('connect', handleConnect)
            ethereum.on('chainChanged', handleChainChanged)
            ethereum.on('accountsChanged', handleAccountsChanged)
            ethereum.on('networkChanged', handleNetworkChanged)

            return () => {
                if (ethereum.removeListener) {
                    ethereum.removeListener('connect', handleConnect)
                    ethereum.removeListener('chainChanged', handleChainChanged)
                    ethereum.removeListener('accountsChanged', handleAccountsChanged)
                    ethereum.removeListener('networkChanged', handleNetworkChanged)
                }
            }
        }
    }, [active, chainId, account, walletMethod])

    const [isLogged, setIsLogged] = useState(false)
    // connected wallet account
    const [walletProvider, setWalletProvider] = useState(null);
    const [walletAccount, setWalletAccount] = useState(null);
    const [walletSigner, setWalletSigner] = useState(null);
    const [walletNetwork, setWalletNetwork] = useState(null);

    const walletInit = async () => {
        console.log('first of page load');
        const orgWallet = window.localStorage.getItem("wallet");
        console.log('wallet method: ', orgWallet);
        if (orgWallet && orgWallet != 'undefined') {
            console.log('activate start');
            setWalletMethod(orgWallet);
            if (orgWallet == 'injected') {
                activateInjectedProvider('MetaMask');
            } else if (orgWallet == 'coinbaseWallet') {
                activateInjectedProvider('CoinBase');
            }
            activate(walletConnector[orgWallet]);
            // wallet value : injected, walletConnect, coinbaseWallet
        } else {
            redirectButton.current.click()
        }
    }
    const activateInjectedProvider = (providerName) => {
        const { ethereum } = window;

        if (!ethereum?.providers) {
            return undefined;
        }

        let provider;
        switch (providerName) {
            case 'CoinBase':
                provider = ethereum.providers.find(({ isCoinbaseWallet }) => isCoinbaseWallet);
                break;
            case 'MetaMask':
                provider = ethereum.providers.find(({ isMetaMask }) => isMetaMask);
                break;
        }
        console.log('providers', ethereum.providers);
        console.log('selected provider', provider);
        if (provider) {
            ethereum.setSelectedProvider(provider);
        }
    }
    useEffect(() => {
        if (active && walletProvider && walletAccount && walletSigner && walletNetwork && chainId == serverConfig.blockchain.network.chainId && !onAuthenticate) {
            console.log('authenticate begin', walletNetwork);
            authenticate();
        }
    }, [active, walletProvider, walletAccount, walletSigner, walletNetwork, chainId, onAuthenticate])

    // Cookie CRUD
    const getCookie = (c_name) => {
        let c_start; let c_end;

        if (document.cookie.length > 0) {
            c_start = document.cookie.indexOf(c_name + "=");
            if (c_start != -1) {
                c_start = c_start + c_name.length + 1;
                c_end = document.cookie.indexOf(";", c_start);
                if (c_end == -1) {
                    c_end = document.cookie.length;
                }
                return decodeURI(document.cookie.substring(c_start, c_end));
            }
        }
        return "";
    };

    useEffect(() => {
        setOnLoading(true)
        if (process.env.REACT_APP_ENV) {
            setWalletAccount(process.env.REACT_APP_MOBILE_WALLET)
            setIsLogged(true)
        } else {
            walletInit();
        }
    }, [])

    const [idDelegate, setIdDelegate] = useState(null);
    useEffect(() => {
        if (isLogged) {
            console.log(window.location.href);
            let idDelegateData = null;
            let delegateParam = new URLSearchParams(window.location.search).get('delegate');
            console.log(delegateParam);
            idDelegateData = delegateParam;
            setIdDelegate(idDelegateData);
            console.log('call basic get apis');
            getResources(idDelegateData)
            getCheapestInventories()
        }
    }, [isLogged])

    const gameButton = useRef(null)
    const redirectButton = useRef(null)
    const gameDelegateButton = useRef(null)

    const { windowSize } = useWindowSize()
    const [mapSize, setMapSize] = useState({ width: 0, height: 0 })
    useEffect(() => {
        const widthScale = windowSize.width / g_mapSize.width
        const heightScale = windowSize.height / g_mapSize.height
        const scale = Math.max(widthScale, heightScale)
        setMapSize({ width: g_mapSize.width * scale, height: g_mapSize.height * scale })
    }, [windowSize])

    const [currentTab, setCurrentTab] = useState('all')
    const tabChanged = (tabName) => {
        if (currentTab == tabName) {
            tabName = 'all'
        }
        setCurrentTab(tabName)
        if (tabName == 'all') {
            setInventoryData([...res.resources, ...res.items, ...res.tools, ...res.recipes])
        } else {
            setInventoryData([...res[tabName + 's']])
        }
    }

    const [filterValue, setFilterValue] = useState('')
    const [detailVisible, setDetailVisible] = useState(false)
    const [currentInventory, setCurrentInventory] = useState({})

    const onCloseDetailView = () => {
        setDetailVisible(false)
    }

    const onOpenBuyNowConfirm = () => {
        setIsOpenConfirm(true)
    }

    const [isOpenConfirm, setIsOpenConfirm] = useState(false)
    const [actionResModalOpen, setActionResModalOpen] = useState(false)
    const [actionRes, setActionRes] = useState(null)
    const [reload, setReload] = useState(false)

    const onDoAction = () => {
        setOnLoading(true)
        onCloseConfirmModal()
        let buyCartIds = []
        buyCartData.map((data) => { buyCartIds.push(data.id) })

        axios.post('/api/m1/marketplaceInventory/buyResourceAndInventory', {
            address: walletAccount,
            buyIds: buyCartIds,
            market: buyCartData[0].market,
            idDelegate: idDelegate,
        })
            .then(response => {
                console.log(response.data)
                if (response.data.success) {

                    setActionRes(response.data)
                    setActionResModalOpen(true)
                    setReload(!reload)
                    setResources({ ...resources, ancien: response.data.data.ancien })
                    getCheapestInventories()
                    setOnLoading(false)
                    // setDetailVisible(false)
                }
            })
            .catch(error => {
                console.log(error)
            })
    }

    const onCloseConfirmModal = () => {
        setIsOpenConfirm(false)
    }

    const onCloseActionResModal = () => {
        setActionResModalOpen(false)
    }

    return (<>
        <div className="marketplace-inventory-page">
            <img className='background-image' src={mapImage} style={{ width: mapSize.width, height: mapSize.height }} />
            <div className='resources'>
                <div className='resource ancien'>
                    <img src={ANCIEN_IMAGE} />
                    <span>{format(toFixed(resources.ancien))}</span>
                </div>
            </div>
            <div className='page-content'>
                <Backdrop className='apiLoader'
                    sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                    open={onLoading}
                >
                    <span className='apiCallLoading'></span>
                    <span className='loader'></span>
                </Backdrop>
                <div className='gamePanel'>
                    <Link to={"/game?b=9071234" + (idDelegate == null ? '' : `&delegate=${idDelegate}`)}>
                        <IconButton className='gameBtn' ref={gameDelegateButton}>
                            <KeyboardReturnIcon />
                        </IconButton>
                    </Link>
                </div>
                <div className='gamePanel' style={{ display: "none" }}>
                    <Link to="/game">
                        <IconButton className='gameBtn' ref={redirectButton}>
                            <KeyboardReturnIcon />
                        </IconButton>
                    </Link>
                </div>
                <div style={{ display: "none" }}>
                    <Link to={"/game?b=9071234"}>
                        <IconButton className='gameBtn' ref={gameButton}>
                        </IconButton>
                    </Link>
                </div>
                <div className='page-container'>
                    <div className='header'>
                        <div className='page-title'>
                            <span>Ancient Marketplace</span>
                        </div>
                    </div>
                    <div className='body'>
                        {!detailVisible && <>
                            <div className='list-header'>
                                {!onLoading && <>
                                    <div className='inventory-tab-desc'>
                                        {currentTab}
                                    </div>
                                    <div className='inventory-filter'>
                                        <Box
                                            sx={{ p: '0rem 0.4rem 0rem 1rem', display: 'flex', alignItems: 'center', bgcolor: 'rgba(0, 0, 0, 0.7)', border: 1, borderColor: 'rgba(255,254,235,0.4)', borderRadius: 2 }}
                                        >
                                            <InputBase
                                                sx={{ ml: 1, flex: 1, color: 'wheat' }}
                                                placeholder="Search"
                                                value={filterValue}
                                                inputProps={{ 'aria-label': 'Search' }}
                                                onChange={e => setFilterValue(e.target.value)}
                                            />
                                            <IconButton
                                                type="submit"
                                                sx={{ p: '10px', color: 'rgba(255,254,235,0.4)' }} aria-label="search"
                                                onClick={() => {
                                                    console.log(filterValue)
                                                }}>
                                                <SearchIcon />
                                            </IconButton>
                                        </Box>
                                    </div>
                                    <div className='inventory-tabs'>
                                        <IconButton className={`inventory-type-tab resource ` + (currentTab == 'resource' ? ' selected' : '')} onClick={() => tabChanged('resource')} aria-label="resource">
                                            <img src={WOOD_IMAGE} /><img src={STONE_IMAGE} />
                                        </IconButton>
                                        <IconButton className={'inventory-type-tab' + (currentTab == 'item' ? ' selected' : '')} onClick={() => tabChanged('item')} aria-label="item">
                                            <img src={imgItem} />
                                        </IconButton>
                                        <IconButton className={'inventory-type-tab' + (currentTab == 'tool' ? ' selected' : '')} onClick={() => tabChanged('tool')} aria-label="tool">
                                            <img src={imgTool} />
                                        </IconButton>
                                        <IconButton className={'inventory-type-tab' + (currentTab == 'recipe' ? ' selected' : '')} onClick={() => tabChanged('recipe')} aria-label="recipe">
                                            <img src={imgRecipe} />
                                        </IconButton>
                                    </div>
                                </>}
                            </div>
                            <div className='list-content'>
                                <Scrollbars
                                    style={{ width: '100%', height: '100%' }}
                                    autoHide={false}
                                    renderThumbVertical={props => <div {...props} className="thumb-vertical" />}
                                >
                                    <div className='mk-inventory-list'>
                                        {
                                            inventoryData.map((inventory, index) => ((inventory.inventoryName.toLowerCase().includes(filterValue.toLowerCase()) || inventory.inventoryLevel.toString().toLowerCase().includes(filterValue.toLowerCase())) &&
                                                <div
                                                    className='mk-inventory'
                                                    key={index}
                                                    onClick={(e) => {
                                                        // if (inventory.inventoryType != 'tool' || e.target.className === 'bonus-view') {
                                                        setCurrentInventory(inventory)
                                                        setDetailVisible(true)
                                                        // }
                                                    }}
                                                >
                                                    {inventory.inventoryType == 'tool' && <>
                                                        {/* <BonusBar info={inventory.bonuses} /> */}
                                                        {/* <BonusView icon={true} info={inventory.bonuses} /> */}
                                                    </>}
                                                    <div className='mk-inventory-main'>
                                                        <div className='mk-inventory-image'>
                                                            <img src={inventory.inventoryImage} />
                                                        </div>
                                                        <div className='mk-inventory-desc'>
                                                            <div className='mk-inventory-type'>
                                                                {inventory.inventoryType}
                                                            </div>
                                                            <div className='mk-inventory-price'>
                                                                $:<span>{inventory.inventoryPrice}</span><img src={ANCIEN_IMAGE} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className='mk-inventory-name'>
                                                        <div className='mk-name'>
                                                            <span className='mk-sname'>{inventory.inventoryName}</span>{inventory.inventoryType == 'tool' && <span className='mk-inventory-level'> LVL +{inventory.inventoryLevel}</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        }
                                    </div>
                                </Scrollbars>
                            </div>
                        </>}
                        {detailVisible &&
                            <div className='detailView'>
                                <div className='container'>
                                    <div className='detail-header'>
                                        <div className='backBtn' onClick={onCloseDetailView}>
                                            <img className='backImg' src={iconBack} />
                                            <span className='backText'>Back</span>
                                        </div>
                                        {isVisibleBuyButton &&
                                            <IconButton className='buyButton' onClick={onOpenBuyNowConfirm}>
                                                <ShoppingCartOutlinedIcon /> <span>BUY NOW</span>
                                            </IconButton>
                                        }
                                    </div>
                                    <div className='detail-info'>
                                        <div className='detail-spec'>
                                            <div className='detail-left'>
                                                <div className='inventory-image'>
                                                    <img src={currentInventory.inventoryImage} />
                                                    {currentInventory.inventoryType == 'tool' && <>
                                                        {/* <BonusBar info={currentInventory.bonuses} />
                                                        <BonusView icon={true} info={currentInventory.bonuses} /> */}
                                                    </>}
                                                </div>
                                                <div className='inventory-name'><span className='inventory-sname'>{currentInventory.inventoryName}</span>{currentInventory.inventoryType == 'tool' && <span className='inventory-level'> LVL +{currentInventory.inventoryLevel}</span>}</div>
                                            </div>

                                            <div className='detail-right'>
                                                {currentInventory.inventoryType == 'resource' ? <span className='inventory-description'>{currentInventory.inventoryDesc}</span>
                                                    : <span className='inventory-description text-intent'>{currentInventory.inventoryDesc}</span>}
                                            </div>

                                        </div>
                                        <div className='detail-table'>

                                            <TableInventoryInfo
                                                currentInventory={currentInventory}
                                                callback_visibleButton={setIsVisibleBuyButton}
                                                callback_buyCartData={setBuyCartData}
                                                walletAccount={walletAccount}
                                                reload={reload}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        }
                    </div>
                </div>
            </div>
        </div>
        <ConfirmDialogs.ConfirmationDialog
            className="confirm-panel"
            open={isOpenConfirm}
            onClose={onCloseConfirmModal}
        >
            <DialogTitle>
                Do you want to buy?
            </DialogTitle>
            <DialogContent>
                <div className='buyInventory'>
                    {buyCartData.map((row, index) => (
                        <div className='drop' key={index}>
                            <img className='drop-image' src={row.image} />
                            <div className='drop-desc'><span className='drop-quantity'>{row.quantity} x {row.name}</span> <span className='drop-price'>x{row.totalPrice} Ancien</span></div>
                        </div>
                    ))}
                    <div className='totalQuantity'>Total {buyCartData[0]?.name}: <span className='colorYellowGreen'>{buyTotalQuantity}</span></div>
                    <div className='totalPrice'>Total Spent: <span className='colorYellowGreen'>{toFixed(buyTotalPrice)}</span> Ancien</div>
                    {resources.ancien < buyTotalPrice && <div className='alreadyBought colorRed'>
                        Your ancien is not enough.
                    </div>}
                </div>
            </DialogContent>
            <DialogActions>
                {resources.ancien < buyTotalPrice ? <Button onClick={onDoAction} disabled > Buy now </Button> : <Button onClick={onDoAction} autoFocus > Buy now </Button>}
            </DialogActions>
        </ConfirmDialogs.ConfirmationDialog>

        <ConfirmDialogs.ConfirmedDialog
            open={actionResModalOpen}
            onClose={onCloseActionResModal}
        >
            <DialogTitle>
                You bought
            </DialogTitle>
            <DialogContent>
                {actionRes?.success ?
                    <>
                        {actionRes?.data.listings.length != 0 && <>
                            <div className='buyInventory'>
                                {actionRes?.data.listings.map((row, index) => (
                                    <div className='drop' key={index}>
                                        <img className={'drop-image' + (row.bought != 1 ? ' disable-image' : '')} src={row.image} />
                                        <div className='drop-desc'><span className={'drop-quantity' + (row.bought != 1 ? ' line-through' : '')}>{row.quantity} x {row.name}</span> <span className={'drop-price' + (row.bought != 1 ? ' line-through' : '')}>x{row.totalPrice} Ancien</span></div>
                                    </div>
                                ))}
                            </div>
                            <div className='totalQuantity'>Total {actionRes?.data.listings[0].name}: <span className='colorYellowGreen'>{actionRes?.data.totalQuantity}</span></div>
                            <div className='totalPrice'>Total Spent: <span className='colorYellowGreen'>{toFixed(actionRes?.data.totalPrice)}</span> Ancien</div>
                        </>}
                        {actionRes?.data.hasAlreadyBoughtInventory && <div className='alreadyBought colorRed'>
                            There's already bought inventory in your buy-list.
                        </div>}
                    </>
                    :
                    <DialogContentText>
                        {actionRes?.error.errorMessage}
                    </DialogContentText>
                }
            </DialogContent>
            <DialogActions>
                <Button onClick={onCloseActionResModal} autoFocus>
                    Ok!
                </Button>
            </DialogActions>
        </ConfirmDialogs.ConfirmedDialog>
    </>
    )
}

function useWindowSize() {
    const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })

    useLayoutEffect(() => {
        function updateWindowSize() {
            setWindowSize({ width: window.innerWidth, height: window.innerHeight })
        }
        window.addEventListener('resize', updateWindowSize)
        updateWindowSize()

        return () => {
            window.removeEventListener('resize', updateWindowSize)
        }
    }, [])

    return { windowSize }
}

export default MarketplaceInventory