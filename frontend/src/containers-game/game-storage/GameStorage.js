//STYLES
import './game-storage.scss';
import 'react-toastify/dist/ReactToastify.css';

import React, { Component } from 'react';

import axios from 'axios';
import { ethers } from 'ethers';
//TOAST
import {
  toast,
  ToastContainer,
} from 'react-toastify';

// import Icon from '@mui/material/Icon';
import InfoIcon from '@mui/icons-material/Info';
//MUI
import {
  FormControlLabel,
  Switch,
} from '@mui/material';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';

//IMAGES
import imgAncien from '../../assets-game/ancien.webp';
import imgDivider from '../../assets-game/divider.svg';
import imgStone from '../../assets-game/stone.webp';
import imgWood from '../../assets-game/wood.webp';
//COMPONENTS
import { ButtonCustom } from '../../components';
import { MarketplaceProfile } from '../../components-game';
import Voucher from '../../components-game/voucher/Voucher';
import { serverConfig } from '../../config/serverConfig';
import { playSound } from '../../utils/sounds';
import {
  format,
  getResourceName,
  isAddress,
  isENS,
  toFixed,
} from '../../utils/utils';

const allowanceERC20 = serverConfig?.erc20.available
const classNameForComponent = 'game-inventory' // ex: game-inventory
const componentTitle = 'Storage' // ex: Inventory
const hasTab = true // true if this component has tabs

class GameStorage extends Component {

    constructor(props) {
        super(props);

        this.state = {
            //What to Show
            tabNames: [],
            currentTabIndex: 0,
            vouchersAvailable: props.vouchers?.length,

            //Popup
            showPopup: false,
            popupType: false,
            openConfirmation: false,

            //InfoRewardPopup
            anchorEl: null,
            open: false,

            //Resources
            resourceSelected: 1,
            toAdd: '',
            toMint: '',

            //Transfer
            transfer: !allowanceERC20,
            transferAddress: '',

            //API onLoading
            onLoading: false,

            //Balance in Metamask
            metamaskResources: props.metamaskResources,

            //Delegate
            idDelegate: null,
            delegationData: {},

            //Json Tables
            jsonMarketplaceProfile: null,

            //My Listings - AdAllowed
            adAllowed: false,

            //Alerts
            alert: props.alert,

            //Ready
            isMarketplaceProfileReady: false
        }

        //ERC20 Contract & ABIs
        this.ERC20 = props.ERC20,

            //Functions Binding
            this.tokenMint = this.tokenMint.bind(this);
        this.tokenBurn = this.tokenBurn.bind(this);
        this.getMyListings = this.getMyListings.bind(this);
        this.newData = this.newData.bind(this);
        this.isReadyF = this.isReadyF.bind(this);
        this.handlePopoverClose = this.handlePopoverClose.bind(this);
        this.handlePopoverOpen = this.handlePopoverOpen.bind(this);
    }

    componentDidMount() {
        if (allowanceERC20 && this.state.vouchersAvailable) {
            this.setState({ tabNames: ['Resources', 'Sell', 'My Tokens'] }) // tab display names
        } else {
            this.setState({ tabNames: ['Resources', 'Sell'] }) // tab display names
        }
    }

    componentDidUpdate() {
        if (this.state.idDelegate != this.props.idDelegate) {
            this.setState({ idDelegate: this.props.idDelegate })
        }

        if (JSON.stringify(this.state.delegationData) != JSON.stringify(this.props.delegationData)) {
            if (this.props.idDelegate != null) {
                this.setState({ transfer: this.props.delegationData.transfer == 1 })
                if (this.props.delegationData.transfer == 0) {
                    this.setState({
                        currentTabIndex: 1,
                    }, () => {
                        this.getMyListings()
                    })
                }
            }
            this.setState({ delegationData: this.props.delegationData })
        }

        //Vouchers
        (!this.props.vouchers && this.state.currentTabIndex == 2) &&
            this.setState({
                currentTabIndex: 0,
                tabNames: ['Resources', 'Sell'],
            })

        //Alert
        if (this.state.alert != this.props.alert) {
            this.setState({ alert: this.props.alert })
        }

        //Check if metamaskResources (State) is different than metamaskResources (Props)
        if (this.state.metamaskResources != this.props.metamaskResources) {
            this.setState({ metamaskResources: this.props.metamaskResources })
        }
    }

    handlePopoverOpen = (event) => {
        this.setState({ anchorEl: event.currentTarget, open: Boolean(event.currentTarget), id: "simple-popover" });
    };

    handlePopoverClose = (event) => {
        this.setState({ anchorEl: event.currentTarget, open: false, id: undefined });
    };

    getResourceInfo(resource) {

        let infoToReturn = [];
        infoToReturn.amount = 0;

        if (resource == 1) {

            infoToReturn.amount = this.props.inventory.ancien
            infoToReturn.image = imgAncien

        } else if (resource == 2) {

            infoToReturn.amount = parseInt(this.props.inventory.wood)
            infoToReturn.image = imgWood

        } else if (resource == 3) {

            infoToReturn.amount = this.props.inventory.stone
            infoToReturn.image = imgStone

        } else { //console.log('getResourceInfo: Empty')
        }

        return infoToReturn
    }

    //My Listings
    async getMyListings() {
        this.setState({ isMarketplaceProfileReady: false })
        axios({
            method: 'post',
            url: '/api/m1/marketplace/getAccountListing',
            data: {
                address: this.props.metamask.walletAccount,
                idDelegate: this.state.idDelegate
            }
        })
            .then(response => {
                response.data.success ? [
                    this.setState({
                        jsonMarketplaceProfile: response.data.data.listings,
                        adAllowed: response.data.data.adAllowed,
                        isMarketplaceProfileReady: true
                    })
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
    newData = (data, inventory, adAllowedP) => {
        this.setState({
            jsonMarketplaceProfile: data,
            adAllowed: adAllowedP
        })
        this.props.gameCallback_newInventory(inventory)
        this.isReadyF(true)
    }

    isReadyF = (status) => {
        // console.log('isReady: ', status)
        this.setState({
            isMarketplaceProfileReady: status
        })
    }

    async tokenBurn(resource, quantity) {
        // console.log('tokenBurn: ', resource, quantity)
        this.setState({
            // showPopup: false,
            toAdd: '',
            toMint: ''
        })

        let contractAddress = null;
        let contract = null;
        let burn = null;
        let receipt = null;

        //Get New Quantity
        let newQuantity = quantity;
        if (resource == 1) { newQuantity += this.props.inventory.ancien }
        else if (resource == 2) { newQuantity += this.props.inventory.wood }
        else if (resource == 3) { newQuantity += this.props.inventory.stone }
        else return false
        let resources = { newAmount: (newQuantity) };

        //Get the Contract Address
        if (resource == 1) { contractAddress = this.ERC20.contractAncien }
        else if (resource == 2) { contractAddress = this.ERC20.contractWood }
        else if (resource == 3) { contractAddress = this.ERC20.contractStone }
        else return false

        //Initialize the Contract Object
        contract = new ethers.Contract(contractAddress, this.ERC20.ABI, this.props.metamask.walletSigner);

        try {
            burn = await contract.burn(
                this.props.metamask.walletAccount,
                quantity
            )
            // console.log('Burn Result... ', burn)

            if (burn) {
                let toastLoading = this.loading('Deposit... Almost done!')

                receipt = await burn.wait();
                // console.log('Receipt ', receipt)

                if (receipt) {
                    // console.log('Burn success')

                    setTimeout(() => {
                        toast.update(toastLoading, {
                            render: "Done, your token will be available soon!",
                            type: "success",
                            isLoading: false,
                            autoClose: 3000
                        });
                    }, 0);

                    playSound('mint');

                    //Alert Off if Deposit Ancien Qt>5
                    if (resource == 1 && quantity >= 5) {
                        console.log('Remove Alert Deposit Done')
                        this.props.callback_removeAlert()
                    }

                    this.setMetamaskResource(resource, quantity)
                    this.props.callback_getBalance()
                    this.props.gameCallback_newInventory(resources, resource); //quantity, type
                }
            }

        } catch (err) {
            this.notify(err.message)
        }
    }//tokenBurn



    tokenMint = () => {
        // console.log('tokenMint: ', resource, quantity)
        const resource = this.state.resourceSelected;
        const quantity = this.state.toMint;

        this.setState({
            openConfirmation: false,
            onLoading: true,
            toAdd: '',
            toMint: ''
        })

        axios({
            method: 'post',
            url: '/api/c1/contract/createVoucher',
            data: {
                address: this.props.metamask.walletAccount,
                idDelegate: this.state.idDelegate,
                type: resource,
                quantity: quantity
            }
        })
            .then(response => {
                try {
                    if (response.data.success) {

                        this.props.callback_addVoucher({
                            id: response.data.data.voucher.id,
                            type: response.data.data.voucher.type,
                            quantity: response.data.data.voucher.quantity,
                            signature: response.data.data.voucher.signature,
                            blockNumber: response.data.data.voucher.blockNumber
                        });

                        playSound('mint');
                        this.props.callback_getBalance()
                        this.props.gameCallback_newInventory(response.data.data, resource);
                        this.setState({
                            onLoading: false,
                            currentTabIndex: 2,
                            tabNames: ['Resources', 'Sell', 'My Tokens']
                        })

                    } else {
                        this.props.callback_Logout() //Logout because the user forced the API
                    }
                } catch (err) {
                    console.error(err)
                }
            })
            .catch(error => {
                // console.error('Error axios.getVouchers: ', error);

                error.response.status == 500
                    && this.props.callback_Logout()

                error.response.status == 401
                    && this.props.callback_Logout()
            })

    }//tokenMint



    checkVoucherisCreable = (type) => {
        let isCreable = true;

        if (Array.isArray(this.props.vouchers) && this.props.vouchers.length) {
            this.props.vouchers.map((item, i) => {
                if (item.type == type) { isCreable = false }
            })
        }

        return isCreable;
    }



    async addToMetamask(type) {

        let contractAddress = null;
        let tokenSymbol = null;

        //Get the Contract Address
        if (type == 1) {
            contractAddress = this.ERC20.contractAncien;
            tokenSymbol = 'ANCIEN';
        } else if (type == 2) {
            contractAddress = this.ERC20.contractWood;
            tokenSymbol = 'ANCIENWOOD';
        } else if (type == 3) {
            contractAddress = this.ERC20.contractStone;
            tokenSymbol = 'ANCIENSTONE';
        } else return false

        let tokenAdd = await ethereum.request({
            method: 'wallet_watchAsset',
            params: {
                type: 'ERC20',
                options: {
                    address: contractAddress,
                    symbol: tokenSymbol,
                    decimals: 18,
                    image: null,
                },
            },
        });
    }



    resourceAvailable(type) {
        let balance = 0;

        if (type == 1) {
            balance = this.state.metamaskResources.ancien;
        } else if (type == 2) {
            balance = this.state.metamaskResources.wood;
        } else if (type == 3) {
            balance = this.state.metamaskResources.stone;
        } else return false

        return balance
    }

    setMetamaskResource(type, quantity) {
        if (type == 1) {
            this.setState({
                metamaskResources: {
                    ancien: (this.state.metamaskResources.ancien - parseInt(quantity)),
                    wood: this.state.metamaskResources.wood,
                    stone: this.state.metamaskResources.stone,
                }
            });
        } else if (type == 2) {
            this.setState({
                metamaskResources: {
                    ancien: this.state.metamaskResources.ancien,
                    wood: (this.state.metamaskResources.wood - parseInt(quantity)),
                    stone: this.state.metamaskResources.stone,
                }
            });
        } else if (type == 3) {
            this.setState({
                metamaskResources: {
                    ancien: this.state.metamaskResources.ancien,
                    wood: this.state.metamaskResources.wood,
                    stone: (this.state.metamaskResources.stone - parseInt(quantity)),
                }
            });
        } else return false
    }

    transferSetting() {
        this.setState({
            transfer: !this.state.transfer
        })
    }

    sendTransfer() {
        this.setState({ openConfirmation: false, toMint: '' })
        let toastLoading = this.loading('Sending... Almost done!')

        axios.post('/api/m1/user/directTransfer', {
            address: this.props.metamask.walletAccount,
            idDelegate: this.state.idDelegate,
            receiver: this.state.transferAddress,
            type: this.state.resourceSelected,
            quantity: this.state.toMint
        })
            .then(response => {

                if (response.data.success) {
                    this.props.gameCallback_newInventory(response.data.data, this.state.resourceSelected);

                    setTimeout(() => {
                        toast.update(toastLoading, {
                            render: "Done, transfer completed!",
                            type: "success",
                            isLoading: false,
                            autoClose: 3000
                        });
                    }, 0);
                } else {
                    setTimeout(() => {
                        toast.update(toastLoading, {
                            render: `Error: ${response.data.error.errorMessage}`,
                            type: "error",
                            isLoading: false,
                            autoClose: 3000
                        });
                    }, 0);
                }

            })
            .catch(error => {
                error.response.status == 500 && this.props.callback_Logout()
                error.response.status == 401 && this.props.callback_Logout()
            })
    }

    async checkTransfer() {
        //TRANSFER INPUT CHECK
        if (this.state.toMint.toString().length && this.state.transfer) {

            //ENS
            if (isENS(this.state.transferAddress)) {
                this.setState({ resolvingENS: true })

                try {

                    const _NODE_URL = 'https://mainnet.infura.io/v3/45eb0e4b59274a35afc5493241b5faf9'
                    const _endPoint = new ethers.providers.JsonRpcProvider(_NODE_URL);

                    let resolvedAddress = await _endPoint.resolveName(this.state.transferAddress)
                    this.setState({ resolvingENS: false })

                    resolvedAddress
                        ? [playSound('confirm'), this.setState({ transferAddress: resolvedAddress }, () => this.setState({ openConfirmation: true }))]
                        : this.notify("Must be a valid ENS address")

                } catch (error) {
                    console.log(error)
                    this.notify(error)
                }

                //ADDRESS
            } else if (isAddress(this.state.transferAddress)) {
                playSound('confirm')
                this.setState({ openConfirmation: true })

                //ERROR
            } else {
                playSound('toast')
                this.notify("Must be a valid address")
            }

            //Withdraw
        } else {
            if (this.state.toMint.toString().length) {
                this.checkVoucherisCreable(this.state.resourceSelected)
                    ? [playSound('confirm'), this.setState({ openConfirmation: true })]
                    : [playSound('toast'), this.notify('You already have a Voucher to mint')]
            } else {
                playSound('toast')
                this.notify("Can't be empty")
            }

        }
    }

    tabChanged = (index) => {
        playSound('tab')
        //Sell
        if (index === 1) { this.getMyListings() }

        if (this.state.currentTabIndex === index) {
            return
        }
        this.setState({
            currentTabIndex: index
        })
    }

    loading = (message) => toast.loading(message);
    notify = (error) => toast.error(error);

    render() {
        const open = Boolean(this.state.anchorEl);

        return (

            <div className={'game-component ' + (this.props.isVisible ? 'game-inventory' : 'game-inventory notVisible')}>

                <div className='game-container'>
                    <div className='header'>
                        <span className='title'>{componentTitle}</span>
                    </div>
                    <div className='content'>
                        {hasTab &&
                            <div className='tab-navs'>
                                {this.state.tabNames.map((tabName, index) => ((this.state.idDelegate == null || (index == 0 && this.state.delegationData.transfer == 1) || (index == 1 && this.state.delegationData.marketplace == 1)) &&
                                    <div key={index} className={'tab-nav ' + (this.state.currentTabIndex === index ? 'active' : '')} onClick={() => this.tabChanged(index)}>{tabName}</div>
                                ))}
                            </div>}
                        <div className='scroll-content'>
                            {hasTab &&
                                <div className='tab-content'>
                                    {this.state.currentTabIndex === 0 ? <>

                                        <div className='resources'>
                                            <div
                                                className=
                                                {this.state.resourceSelected == 1
                                                    ? 'resource ancien selected'
                                                    : 'resource ancien'
                                                }
                                                onClick={() => [playSound('touch'), this.setState({ resourceSelected: 1, toMint: '', toBurn: '' })]}
                                            >
                                                <img src={imgAncien} />
                                                <span>{format(toFixed(this.props.inventory.ancien))}</span>
                                            </div>

                                            <div
                                                className=
                                                {this.state.resourceSelected == 2
                                                    ? 'resource wood selected'
                                                    : 'resource wood'
                                                }
                                                onClick={() => [playSound('touch'), this.setState({ resourceSelected: 2, toMint: '', toBurn: '' })]}
                                            >
                                                <img src={imgWood} />
                                                <span>{format(toFixed(this.props.inventory.wood))}</span>
                                            </div>

                                            <div
                                                className=
                                                {this.state.resourceSelected == 3
                                                    ? 'resource stone selected'
                                                    : 'resource stone'
                                                }
                                                onClick={() => [playSound('touch'), this.setState({ resourceSelected: 3, toMint: '', toBurn: '' })]}
                                            >
                                                <img src={imgStone} />
                                                <span>{format(toFixed(this.props.inventory.stone))}</span>
                                            </div>

                                        </div>

                                        {this.state.alert.length && this.state.idDelegate == null ?
                                            <div className='alert'>
                                                You are eligible for a reward! Deposit at least 5 $ANCIEN to receive it right now.
                                                <Typography
                                                    aria-owns={this.state.open ? 'mouse-over-popover' : undefined}
                                                    aria-haspopup="true"
                                                    onMouseEnter={this.handlePopoverOpen}
                                                    onMouseLeave={this.handlePopoverClose}
                                                >
                                                    <InfoIcon sx={{ fontSize: 25 }} />
                                                </Typography>
                                            </div> : null}

                                        <div className='mint-burn'>

                                            {(allowanceERC20) &&
                                                <div className='action mint'>
                                                    <FormControlLabel control={<Switch checked={this.state.transfer} onChange={() => this.state.idDelegate == null && this.transferSetting()} />} />
                                                    <div className='display'>

                                                        <span>

                                                            <img
                                                                src={this.getResourceInfo(this.state.resourceSelected).image}
                                                                onClick={() => this.addToMetamask(this.state.resourceSelected)}
                                                            />

                                                            <input
                                                                disabled={this.state.resourceSelected ? false : true}
                                                                placeholder='0'
                                                                maxLength="9"
                                                                value={this.state.toMint}
                                                                onChange={(e) => {
                                                                    if (e.target.value == 0) { //Min limit
                                                                        this.setState({ toMint: '' })
                                                                    } else if (!Number.isInteger(parseInt(e.target.value))) { //is Not Int
                                                                        this.setState({ toAdd: '' })
                                                                    } else if (e.target.value <= this.getResourceInfo(this.state.resourceSelected).amount) { //Max limit
                                                                        this.setState({ toMint: parseInt(e.target.value) })
                                                                    } else {
                                                                        this.setState({
                                                                            toMint: this.getResourceInfo(this.state.resourceSelected).amount > 0
                                                                                ? parseInt(this.getResourceInfo(this.state.resourceSelected).amount)
                                                                                : ''
                                                                        })  //Max
                                                                    }
                                                                }
                                                                }
                                                            />
                                                        </span>

                                                        {this.state.resourceSelected
                                                            ? <p>Your balance: {format(parseInt(this.getResourceInfo(this.state.resourceSelected).amount))}</p>
                                                            : <p>Select a resource</p>
                                                        }
                                                    </div>
                                                    {this.state.transfer &&
                                                        <input
                                                            disabled={this.state.resourceSelected ? false : true}
                                                            className='addressInput'
                                                            placeholder='0x000000 / ens.eth'
                                                            maxLength="42"
                                                            value={this.state.transferAddress}
                                                            onChange={(e) => {
                                                                if (e.target.value == '') { //Min limit
                                                                    this.setState({ transferAddress: '' })
                                                                } else {
                                                                    this.setState({ transferAddress: e.target.value })
                                                                }
                                                            }}
                                                        />
                                                    }
                                                    {!this.state.showPopup
                                                        ? <ButtonCustom
                                                            style='btn-action btn-mint'
                                                            text={
                                                                this.state.transfer
                                                                    ? this.state.resolvingENS
                                                                        ? <CircularProgress size={20} />
                                                                        : 'Send'
                                                                    : 'Withdraw'
                                                            }
                                                            onButtonClick={() => this.checkTransfer()}
                                                        />
                                                        : null
                                                    }
                                                </div>
                                            }

                                            {(!allowanceERC20) &&
                                                <div className='action mint'>
                                                    <div className='display'>

                                                        <span>

                                                            <img
                                                                src={this.getResourceInfo(this.state.resourceSelected).image}
                                                                onClick={() => this.addToMetamask(this.state.resourceSelected)}
                                                            />

                                                            <input
                                                                disabled={this.state.resourceSelected ? false : true}
                                                                placeholder='0'
                                                                maxLength="9"
                                                                value={this.state.toMint}
                                                                onChange={(e) => {
                                                                    if (e.target.value == 0) { //Min limit
                                                                        this.setState({ toMint: '' })
                                                                    } else if (!Number.isInteger(parseInt(e.target.value))) { //is Not Int
                                                                        this.setState({ toAdd: '' })
                                                                    } else if (e.target.value <= this.getResourceInfo(this.state.resourceSelected).amount) { //Max limit
                                                                        this.setState({ toMint: parseInt(e.target.value) })
                                                                    } else {
                                                                        this.setState({
                                                                            toMint: this.getResourceInfo(this.state.resourceSelected).amount > 0
                                                                                ? parseInt(this.getResourceInfo(this.state.resourceSelected).amount)
                                                                                : ''
                                                                        })  //Max
                                                                    }
                                                                }
                                                                }
                                                            />
                                                        </span>

                                                        {this.state.resourceSelected
                                                            ? <p>Your balance: {format(parseInt(this.getResourceInfo(this.state.resourceSelected).amount))}</p>
                                                            : <p>Select a resource</p>
                                                        }
                                                    </div>
                                                    {this.state.transfer &&
                                                        <input
                                                            disabled={this.state.resourceSelected ? false : true}
                                                            className='addressInput'
                                                            placeholder='0x000000 / ens.eth'
                                                            maxLength="42"
                                                            value={this.state.transferAddress}
                                                            onChange={(e) => {
                                                                if (e.target.value == '') { //Min limit
                                                                    this.setState({ transferAddress: '' })
                                                                } else {
                                                                    this.setState({ transferAddress: e.target.value })
                                                                }
                                                            }}
                                                        />
                                                    }
                                                    {!this.state.showPopup
                                                        ? <ButtonCustom
                                                            style='btn-action btn-mint'
                                                            text={
                                                                this.state.transfer
                                                                    ? this.state.resolvingENS
                                                                        ? <CircularProgress size={20} />
                                                                        : 'Send'
                                                                    : 'Withdraw'
                                                            }
                                                            onButtonClick={() => this.checkTransfer()}
                                                        />
                                                        : null
                                                    }
                                                </div>
                                            }

                                            {(this.state.idDelegate == null && allowanceERC20) && <img src={imgDivider} className='img-arrow' />}

                                            {(this.state.idDelegate == null && allowanceERC20) &&
                                                <div className='action add'>

                                                    <div className='display'>
                                                        <span>
                                                            <img src={this.getResourceInfo(this.state.resourceSelected).image} />
                                                            <input
                                                                disabled={this.state.resourceSelected ? false : true}
                                                                placeholder='0'
                                                                maxLength="9"
                                                                value={this.state.toAdd}
                                                                onChange={(e) => {
                                                                    if (e.target.value == 0) { //Min limit
                                                                        this.setState({ toAdd: '' })
                                                                    } else if (e.target.value > this.resourceAvailable(this.state.resourceSelected)) { //Max limit
                                                                        this.setState({ toAdd: parseInt(this.resourceAvailable(this.state.resourceSelected)) })
                                                                    } else if (Number.isInteger(parseInt(e.target.value))) { //is Int
                                                                        this.setState({ toAdd: parseInt(e.target.value) })
                                                                    } else {
                                                                        this.setState({
                                                                            toAdd: ''
                                                                        })  //Not a Number
                                                                    }
                                                                }
                                                                }
                                                            />
                                                        </span>

                                                        {this.state.resourceSelected
                                                            ? <p>Available: {this.resourceAvailable(this.state.resourceSelected)}</p>
                                                            : <p>Select a resource</p>
                                                        }
                                                    </div>

                                                    {!this.state.showPopup
                                                        ? <ButtonCustom
                                                            style={'btn-action btn-add'}
                                                            text='Deposit'
                                                            onButtonClick={() => {
                                                                if (this.state.toAdd.toString().length) {
                                                                    this.tokenBurn(this.state.resourceSelected, this.state.toAdd)
                                                                } else {
                                                                    playSound('toast')
                                                                    this.notify("Can't be empty")
                                                                }
                                                            }
                                                            }
                                                        />
                                                        : null
                                                    }

                                                </div>}

                                        </div>
                                    </> : null}

                                    {this.state.currentTabIndex == 1 ? this.state.isMarketplaceProfileReady ?

                                        <MarketplaceProfile
                                            metamask={this.props.metamask}
                                            inventory={this.props.inventory}
                                            data={this.state.jsonMarketplaceProfile}
                                            adAllowed={this.state.adAllowed}

                                            callback_newData={this.newData}
                                            callback_isReady={this.isReadyF}

                                            callback_Logout={() => this.props.callback_Logout()}

                                            idDelegate={this.props.idDelegate}
                                        />
                                        : <CircularProgress size={50} sx={{ color: "gold", padding: "30px" }} />
                                        : null}


                                    {(this.state.currentTabIndex === 2 && Array.isArray(this.props.vouchers) && this.props.vouchers.length && !this.state.showPopup)
                                        ? <div className='vouchers' id='vouchers'>
                                            <h2>My Tokens</h2>
                                            {this.props.vouchers.map((item, i) => (
                                                <Voucher
                                                    key={i}
                                                    arrayIndex={i}

                                                    resourceImage={
                                                        item.type == 1
                                                            ? imgAncien
                                                            : item.type == 2
                                                                ? imgWood
                                                                : item.type == 3
                                                                    ? imgStone
                                                                    : 'error'
                                                    }

                                                    metamask={this.props.metamask}
                                                    ERC20={this.ERC20}

                                                    id={item.id}
                                                    type={item.type}
                                                    quantity={item.quantity}
                                                    signature={item.signature}
                                                    blockNumber={item.blockNumber}

                                                    callback_getBalance={this.props.callback_getBalance}
                                                    callback_removeVoucher={this.props.callback_removeVoucher}
                                                    callback_ToastLoading={(message) => toast.loading(message)}
                                                    callback_ToastError={(error) => toast.error(error)}
                                                />
                                            ))}
                                        </div>
                                        : null}

                                </div>}
                        </div>
                    </div>

                    <Popover
                        id="mouse-over-popover"
                        sx={{
                            pointerEvents: 'none',
                        }}
                        open={this.state.open}
                        anchorEl={this.state.anchorEl}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        onClose={this.handlePopoverClose}
                        disableRestoreFocus
                    >
                        <Typography sx={{ p: 1 }}>
                            After the deposit, you will receive <b>{this.state.alert.length && this.state.alert[0]?.info?.name} x
                                {this.state.alert.length && this.state.alert[0]?.info?.quantity}</b>
                        </Typography>
                    </Popover>

                </div>

                {this.state.onLoading
                    ?
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

                <ToastContainer
                    position="top-right"
                    autoClose={1500}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                />

                <this.props.ConfirmContext.ConfirmationDialog
                    open={this.state.openConfirmation}
                    onClose={() => this.setState({ openConfirmation: false })}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">
                        {this.state.transfer
                            ? 'Transfer Confirmation'
                            : 'Withdraw Confirmation'}
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            {this.state.transfer
                                ? `Do you want to transfer ${this.state.toMint} ${getResourceName(this.state.resourceSelected)} to ${this.state.transferAddress}?`
                                : `Do you want to withdraw ${this.state.toMint} ${getResourceName(this.state.resourceSelected)}?`
                            }
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() =>
                            this.state.transfer
                                ? this.sendTransfer()
                                : this.tokenMint()
                        } autoFocus>
                            {this.state.transfer
                                ? 'Transfer'
                                : 'Withdraw'
                            }
                        </Button>
                    </DialogActions>
                </this.props.ConfirmContext.ConfirmationDialog>

            </div>
        )
    }
}

export default GameStorage