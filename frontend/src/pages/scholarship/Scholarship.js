import './scholarship.scss';

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import axios from 'axios';
import { ethers } from 'ethers';
import { Link } from 'react-router-dom';

import styled from '@emotion/styled';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import SaveIcon from '@mui/icons-material/Save';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Backdrop,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Switch,
  TextField,
} from '@mui/material';
import { useWeb3React } from '@web3-react/core';

import { serverConfig } from '../../config/serverConfig';
import { isAddress } from '../../utils/utils';
import { walletConnector } from '../../utils/walletConnector';
import mapImage from './map.jpg';

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
  & > .MuiDialog-container > .MuiPaper-root > .MuiDialogContent-root > .MuiDialogContentText-root {
    font: normal 1.2rem Raleway; 
    color: white;
    text-align: center;
    line-height: 1.5;
    word-break: break-word;
  }
  & > .MuiDialog-container > .MuiPaper-root > .MuiDialogActions-root {
    padding: 0rem 0rem 1rem 0rem !important;
  }
  & > .MuiDialog-container > .MuiPaper-root > .MuiDialogActions-root > .MuiButton-root {
    font: bold 1rem Cinzel; 
    color: gray;
    border: 1px solid gray;
    margin: 0 auto;
    &:hover {
      color: white;
      border: 1px solid white;
    }
  }
`
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
  & > .MuiDialog-container > .MuiPaper-root > .MuiDialogContent-root > .MuiDialogContentText-root {
    font: normal 1.2rem Raleway; 
    color: white;
    text-align: center;
    line-height: 1.5;
    word-break: break-word;
  }
  & > .MuiDialog-container > .MuiPaper-root > .MuiDialogContent-root > .MuiDialogContentText-root > p {
    font: normal 1.2rem Cinzel; 
    color: white;
    text-align: center;
  }
  & > .MuiDialog-container > .MuiPaper-root > .MuiDialogContent-root > .MuiDialogContentText-root > p.isPRNG_true {
    color: #ffb13b;
  }
  & > .MuiDialog-container > .MuiPaper-root > .MuiDialogActions-root {
    padding: 0rem 0rem 1rem 0rem !important;
  }
  & > .MuiDialog-container > .MuiPaper-root > .MuiDialogActions-root > .MuiButton-root {
    font: bold 1rem Cinzel; 
    color: gray;
    border: 1px solid gray;
    margin: 0 auto;
    &:hover {
      color: white;
      border: 1px solid white;
    }
  }
`

const delegationList = [
    'claim',
    'upgrade',
    'marketplace',
    'shop',
    'transfer',
    'profile',
    'inventory',
    'fisherman'
]
const permissionObj = {}
const delegationObj = {}
for ( let delegation of delegationList ) {
    delegationObj[delegation] = false
    permissionObj[delegation] = delegation.slice(0, 3).toUpperCase()
}

function Scholarship() {
    const [onLoading, setOnLoading] = useState(true)
    const [delegateData, setDelegateData] = useState([])
    const [conDelegateData, setConDelegateData] = useState({})

    const delegateChanged = (curDelegate) => {
        const conDelegate = conDelegateData[curDelegate.id]
        for ( let x in conDelegate.delegations ) {
            if ( conDelegate.delegations[x] != curDelegate.delegations[x] ) {
                return true
            }
        }
        if ( conDelegate['isAllowed'] != curDelegate['isAllowed'] ) {
            return true
        }
        return false
    }

    const [doingAction, setDoingAction] = useState(false)
    const [searchData, setSearchData] = useState('')
    const onSearchDataChange = (e) => {
        setSearchData(e.target.value)
    }
    const onPanelChange = (idDelegate) => (e, expanded) => {
        setDelegateData(delegateData.map((delegate) => (delegate.id === idDelegate ? {...delegate, expanded: !delegate.expanded} : delegate)))
    }
    const onDeputyAllow = (e, idDelegate) => {
        setDelegateData(delegateData.map((delegate) => (delegate.id === idDelegate ? {...delegate, isAllowed: !delegate.isAllowed} : delegate)))
        e.stopPropagation()
    }
    const onDelegationChange = (pDelegate, delegation) => {
        pDelegate.delegations[delegation] = !pDelegate.delegations[delegation]
        setDelegateData(delegateData.map((delegate) => (
            delegate.id === pDelegate.id ?
            {...delegate, delegations: JSON.parse(JSON.stringify(pDelegate.delegations))}
            : delegate)))
    }

    const [currentDelegate, setCurrentDelegate] = useState('')
    const [confirmModalOpen, setConfirmModalOpen] = useState(false)
    const [resModalOpen, setResModalOpen] = useState(false)
    const [actionType, setActionType] = useState('')
    const [actionRes, setActionRes] = useState({})
    const onResetDuty = (e, pDelegate) => {
        const expanded = pDelegate.expanded
        setDelegateData(delegateData.map((delegate) => (delegate.id === pDelegate.id ? {...JSON.parse(JSON.stringify(conDelegateData[pDelegate.id])), expanded: expanded} : delegate)))
        e.stopPropagation()
    }
    const onSaveDeputy = (e, delegate) => {
        setActionType('save')
        setCurrentDelegate(delegate)
        e.stopPropagation()
        setConfirmModalOpen(true)
    }
    const onRemoveDeputy = (e, delegate) => {
        setActionType('remove')
        setCurrentDelegate(delegate)
        e.stopPropagation()
        setConfirmModalOpen(true)
    }
    const onCloseConfirmModal = () => {
        setConfirmModalOpen(false)
    }
    const onCloseResModal = () => {
        setResModalOpen(false)
    }
    const saveDeputy = () => {
        setDoingAction(true)
        console.log(currentDelegate)
        axios.post('/api/m1/delegation/updateDelegate', {
            address: walletAccount,
            delegate: currentDelegate
        })
        .then(response => {
            if ( response.data.success ) {
                setDelegateData(delegateData.map((delegate) => (delegate.id === currentDelegate.id ? JSON.parse(JSON.stringify(currentDelegate)) : delegate)))

                const newConDelegateData = JSON.parse(JSON.stringify(conDelegateData))
                newConDelegateData[currentDelegate.id] = currentDelegate
                setConDelegateData(JSON.parse(JSON.stringify(newConDelegateData)))
            }
            setActionRes(response.data)
            setResModalOpen(true)
            setDoingAction(false)
        })
        .catch(error => {
            console.log(error)
        })
    }
    const removeDeputy = () => {
        setDoingAction(true)
        axios.post('/api/m1/delegation/deleteDelegate', {
            address: walletAccount,
            idDelegate: currentDelegate.id,
            deputy: currentDelegate.deputy
        })
        .then(response => {
            setDelegateData(delegateData.filter((delegate) => (delegate.id != currentDelegate.id)))
            setActionRes(response.data)
            setResModalOpen(true)
            setDoingAction(false)
        })
        .catch(error => {
            console.log(error)
        })
    }

    const {windowSize} = useWindowSize()
    const address_format = (addr) => {
        const length = windowSize.width < 450 ?
            5
            : windowSize.width < 700 ?
            10
            :  windowSize.width < 800 ?
            15
            : windowSize.width < 900 ?
            20
            : 25
        return addr.length > length ? (addr.slice(0, length) + '...') : addr
    }
    const permission_format = (delegations) => {
        let desc = ''
        for ( let delegation in delegations ) {
            if ( delegations[delegation] == 1 ) {
                desc += (desc == '' ? '' : ', ') + permissionObj[delegation]
            }
        }
        const length = windowSize.width < 450 ?
            5
            : windowSize.width < 700 ?
            10
            :  windowSize.width < 800 ?
            20
            : windowSize.width < 900 ?
            25
            : 40
        return desc.length > length ? (desc.slice(0, length) + '...') : desc
    }

    const [addModalOpen, setAddModalOpen] = useState(false)
    const onCloseAddModal = () => {
        setAddModalOpen(false)
    }
    const [newDeputy, setNewDeputy] = useState('')
    const onAdd = () => {
        onCloseAddModal()
        setDoingAction(true)
        axios.post('/api/m1/delegation/addDelegate', {
            address: walletAccount,
            deputy: newDeputy
        })
        .then(response => {
            if ( response.data.success ) {
                let newDelegateData = JSON.parse(JSON.stringify(delegateData))
                const newDelegate = response.data.data.newDelegate

                const newConDelegateData = JSON.parse(JSON.stringify(conDelegateData))
                newConDelegateData[newDelegate.id] = newDelegate
                setConDelegateData(JSON.parse(JSON.stringify(newConDelegateData)))

                newDelegateData.unshift({...JSON.parse(JSON.stringify(newDelegate)), expanded: true})
                setDelegateData(newDelegateData)
            }
            setActionRes(response.data)
            setResModalOpen(true)
            setDoingAction(false)
        })
        .catch(error => {
            console.log(error)
        })
    }
    const [newDeputyErrorName, setNewDeputyErrorName] = useState('')

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
        if ( process.env.REACT_APP_ENV ) {
            setWalletAccount(process.env.REACT_APP_MOBILE_WALLET)
            setIsLogged(true)
        } else {
            walletInit();
        }
    }, [])

    useEffect(() => {
        if ( isLogged ) {
            axios.post('/api/m1/delegation/getDelegates', {
                address: walletAccount
            })
            .then(response => {
                if ( response.data.success ) {
                    const delegates = response.data.data
                    let constDelegateData = {}
                    for ( let delegate of delegates ) {
                        constDelegateData[delegate.id] = delegate
                    }
                    setConDelegateData(JSON.parse(JSON.stringify(constDelegateData)))
                    setDelegateData(delegates.map((delegate, index) => (index == 0 ? {...delegate, expanded: true} : {...delegate, expanded: false})))
                    setOnLoading(false)
                }
            })
            .catch(error => {
                gameButton.current.click()
            })
        }
    }, [isLogged])

    const gameButton = useRef(null)
    const redirectButton = useRef(null)

    return (<>
        <div className="scholarship-page">
            <img className='background-image' src={mapImage} />
            <div className='gamePanel'>
                <Link to="/game?b=9071234">
                    <IconButton className='gameBtn' ref={gameButton}>
                        <KeyboardReturnIcon />
                    </IconButton>
                </Link>
            </div>
            <div className='gamePanel' style={{display: "none"}}>
                <Link to="/game">
                    <IconButton className='gameBtn' ref={redirectButton}>
                        <KeyboardReturnIcon />
                    </IconButton>
                </Link>
            </div>
            <div className='page-content'>
                <Backdrop
                    sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                    open={onLoading || doingAction}
                >
                    <CircularProgress size={50} sx={{color:"gold"}} />
                </Backdrop>
                <div className='page-container'>
                    <div className='header'>
                        <div className='page-title'>
                            <span>Scholarship</span>
                        </div>
                    </div>
                    <div className='body'>
                        <div className='list-header'>
                            <div className='wallet'>
                                <span className='label'>Wallet</span>
                                <div className='search'>
                                    <TextField
                                        onChange={onSearchDataChange}
                                        value={searchData}
                                        label="Search"
                                        placeholder='Wallet Address: 0x...'
                                        variant="filled"
                                        />
                                </div>
                            </div>
                            <div className='permission'>
                                <span className='label'>Permission</span>
                            </div>
                        </div>
                        
                        <div className={'list-content' + (onLoading || doingAction ? ' hide' : '')}>
                            { delegateData.map((delegate, index) => ( (delegate.deputy.includes(searchData) || delegate.disDeputy.includes(searchData)) &&
                                <Accordion key={index}
                                    expanded={delegate.expanded}
                                    onChange={onPanelChange(delegate.id)}
                                    >
                                    <AccordionSummary expandIcon={<ExpandMoreIcon className={delegate.isAllowed ? ' isAllowed' : ''} />}>
                                        <div className='summary'>
                                            <div className='left'>
                                                <Checkbox
                                                    className={'wallet-checkbox' + (delegate.isAllowed ? ' isAllowed' : '')}
                                                    checked={delegate.isAllowed}
                                                    onClick={(e) => {onDeputyAllow(e, delegate.id)}}
                                                    />
                                                <span className={'wallet-address' + (delegate.isAllowed ? ' isAllowed' : '')}>{address_format(delegate.disDeputy)}</span>
                                            </div>
                                            <div className='right'>
                                                {windowSize.width > 600 && <span className={'permission-desc' + (delegate.isAllowed ? ' isAllowed' : '')}>
                                                    {permission_format(delegate.delegations)}
                                                </span>}
                                                <IconButton className={'resetBtn' + (delegateChanged(delegate) ? ' show' : '')} onClick={(e) => delegateChanged(delegate) && onResetDuty(e, delegate)} aria-label="reset">
                                                    <CancelIcon />
                                                </IconButton>
                                                <IconButton className={'saveBtn' + (delegateChanged(delegate) ? ' show' : '')} onClick={(e) => delegateChanged(delegate) && onSaveDeputy(e, delegate)} aria-label="save">
                                                    <SaveIcon />
                                                </IconButton>
                                                <IconButton className='deleteBtn show' onClick={(e) => {onRemoveDeputy(e, delegate)}} aria-label="delete">
                                                    <DeleteIcon />
                                                </IconButton>
                                            </div>
                                        </div>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <div className='details'>
                                            { delegationList.map((delegation, pIndex) => (
                                                <div key={pIndex} className='permission-switch'>
                                                    <FormControlLabel
                                                        control={
                                                            <Switch
                                                                disabled={!delegate.isAllowed}
                                                                checked={delegate.delegations[delegation]}
                                                                onChange={() => {onDelegationChange(delegate, delegation)}}
                                                                />
                                                        }
                                                        label={delegation}
                                                        />
                                                </div>
                                            ))
                                            }
                                        </div>
                                    </AccordionDetails>
                                </Accordion>
                            ))}
                        </div>
                    </div>
                    <div className='footer'>
                        <Button onClick={() => {setAddModalOpen(true)}} variant="contained">Add New Wallet</Button>
                    </div>
                </div>
            </div>

            <Dialog id='scholarship-add-modal' open={addModalOpen} onClose={onCloseAddModal}>
                <DialogTitle>Add</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Please enter the Metamask Wallet Address..
                    </DialogContentText>
                    <TextField
                        onChange={(e) => {
                            let address = e.target.value
                            if ( isAddress(address) ) {
                                setNewDeputyErrorName('')
                            } else {
                                setNewDeputyErrorName('Invalid format address')
                            }
                            setNewDeputy(e.target.value)
                        }}
                        value={newDeputy}
                        label="Wallet Address"
                        placeholder='Wallet Address: 0x...'
                        variant="filled"
                        helperText={newDeputyErrorName}
                        error={!!newDeputyErrorName}
                        required
                        />
                </DialogContent>
                <DialogActions>
                    <Button disabled={newDeputy == '' || !!newDeputyErrorName} onClick={onAdd}>Add</Button>
                </DialogActions>
            </Dialog>

            <ConfirmationDialog
                open={confirmModalOpen}
                onClose={onCloseConfirmModal}
            >
                <DialogTitle>
                    Confirm
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Do you want to {actionType} the "{currentDelegate.disDeputy}" deputy?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        onCloseConfirmModal()
                        if ( actionType == 'save' ) {
                            saveDeputy()
                        } else if ( actionType == 'remove' ) {
                            removeDeputy()
                        }
                    }} autoFocus>
                        Sure
                    </Button>
                </DialogActions>
            </ConfirmationDialog>

            <ConfirmedDialog
                open={resModalOpen}
                onClose={onCloseResModal}
            >
                <DialogTitle>
                    {actionRes.success ? "Success!" : 'Failed!'}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {actionRes.data?.message}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onCloseResModal} autoFocus>
                        Ok!
                    </Button>
                </DialogActions>
            </ConfirmedDialog>
        </div>
        </>
    )
}

function useWindowSize() {
    const [windowSize, setWindowSize] = useState({width: 0, height: 0})
    
    useLayoutEffect(() => {
        function updateWindowSize() {
            setWindowSize({width: window.innerWidth, height: window.innerHeight})
        }
        window.addEventListener('resize', updateWindowSize)
        updateWindowSize()

        return () => {
            window.removeEventListener('resize', updateWindowSize)
        }
    }, [])
  
    return {windowSize}
}

export default Scholarship