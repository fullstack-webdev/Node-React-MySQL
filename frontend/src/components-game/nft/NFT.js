import 'react-toastify/dist/ReactToastify.css';
import './nft.scss';

import { Component } from 'react';

import axios from 'axios';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';

import CircularProgress from '@mui/material/CircularProgress';

import imgAncien from '../../assets-game/ancien.webp';
import imgBuildersMissing from '../../assets-game/buildersMissing.png';
import iconClose from '../../assets-game/iconClose.svg';
import iconInfoNFT from '../../assets-game/info-icon-nft.png';
import imgUpgrading from '../../assets-game/loading-spinner.gif';
import imgUpgradeMaxLevel from '../../assets-game/maxLevel.webp';
import imgStone from '../../assets-game/stone.webp';
import imgUpgrade from '../../assets-game/upgrade.png';
import imgWood from '../../assets-game/wood.webp';
import { Button } from '../../components';
import { PopupGame } from '../../containers-game';
import { playSound } from '../../utils/sounds';
import { roundMinOne } from '../../utils/utils';

class NFT extends Component {

    constructor(props) {
        super(props);

        this.state = {
            onApiCall: false,

            // upgrade requirements for NFT
            upgradeResources: [],

            //Popup
            showPopup: false,
            popupType: false,

            //IsVisible
            isVisible: props.isVisible,
            uniqueID: props.uniqueID,

            //Building Info
            nft: {
                //Building Info Const
                id: props.nft.id,
                type: props.nft.type,
                stake: props.nft.stake,
                name: props.nft.name,

                //Building Info (Editable by Upgrade)
                level: props.nft.level,
                levelMax: props.nft.levelMax,
                image: props.nft.image,
                imageSprite: props.nft.imageSprite,
                description: props.nft.description,
                moreInfo: props.nft.moreInfo,
                stored: props.nft.stored,
                capacity: props.nft.capacity,
                dropQuantity: props.nft.dropQuantity,
                dropInterval: props.nft.dropInterval,
                upgradeImage: props.nft.levelMax ? null : props.nft.upgradeImage,
                upgradeTime: props.nft.upgradeTime,
                upgradeCapacity: props.nft.upgradeCapacity,
                upgradeDropQuantity: props.nft.upgradeDropQuantity,
                upgradeResources: props.nft.upgradeResources,
                upgradeStatus: props.nft.upgradeStatus,
                upgradeEndingTime: props.nft.upgradeEndingTime,
                upgradeFirstLogin: props.nft.upgradeFirstLogin,
            },

            //Building Drop 
            initDate: new Date(),
            droppedTotal: 0,

            //Timer
            time: {
                hours: 0,
                minutes: 0,
                seconds: 0,
                milliseconds: 0,
            },
            duration: null,

            idDelegate: null,
            delegationData: {}
        };

        this.upgradeTimer = null,
            this.dropTimer = null,

            //Staking Contract & ABIs
            this.ERCStaking = props.ERCStaking,

            //721 Contract & ABIs
            this.ERC721 = props.ERC721,

            //Functions Binding
            this.startTimer = this.start.bind(this);
        this.stakingApproved = this.stakingApproved.bind(this);
    }

    componentDidMount() {
        //Start Upgrade Timer if building is upgrading
        if (this.state.nft.upgradeStatus && this.upgradeTimer === null) { this.startTimer(); }

        //Notification if upgradeFirstLogin
        if (this.state.nft.upgradeFirstLogin) { this.upgradeWasDone(); }
    }

    componentDidUpdate() {
        if (this.state.idDelegate != this.props.idDelegate) {
            this.setState({ idDelegate: this.props.idDelegate })
        }
        if (JSON.stringify(this.state.delegationData) != JSON.stringify(this.props.delegationData)) {
            this.setState({ delegationData: this.props.delegationData })
        }

        //Check if isVisible (State) is different than isVisible (Props)
        if (this.state.isVisible != this.props.isVisible) {

            if (this.props.isVisible.toString() == this.state.uniqueID.toString()) {
                const buildingType = ['', 'townhall', 'lumberjack', 'stonemine', 'fisherman']
                playSound(buildingType[this.state.nft.type])
            }
            this.setState({ onApiCall: false, isVisible: this.props.isVisible })
        }

        //Check if it is Staked && Not Upgrading && Timer NOT Started yet 
        // => Start Timer
        if ((this.state.nft.stake && !this.state.nft.upgradeStatus)
            && (this.dropTimer == undefined || this.dropTimer == null)) {

            // console.log('Start Drop Timer: ', this.state.nft.id);
            this.dropTimer = setInterval( //Timer to calculate Drop per second
                () => this.getDrop(),
                1000
            )

        } else { //NFT on Upgrade (Just started)
            ((!this.state.nft.stake || this.state.nft.upgradeStatus) && this.dropTimer)
                && [clearInterval(this.dropTimer), this.dropTimer = null]
        }

        //Check if Upgrade just started (when online) => Start Timer
        if (this.state.nft.upgradeStatus && this.state.duration == null) {
            // console.log('is on Upgrade => Start Timer')
            this.startTimer();
        }

        //Check if onClaimAll
        if (this.props.onClaimAll) this.claim()

        //Check if NFT (State) is different than NFT (Props)
        if (this.state.nft != this.props.nft) {
            // console.log('Different NFT State!')
            this.setState({ nft: this.props.nft })
        }
    }

    componentWillUnmount() {
        clearInterval(this.dropTimer);
    }

    getDrop() {
        const dropQuantity = this.state.nft.dropQuantity;
        const dropInterval = this.state.nft.dropInterval;

        const dropPerSecond = dropQuantity / dropInterval;

        var timeNow = new Date();

        //Max Capacity Reached
        if (!(parseFloat(this.state.nft.stored + this.state.droppedTotal) < parseFloat(this.state.nft.capacity))) {
            this.props.parentCallback_newClaimable(this.state.nft.type, this.state.nft.capacity)
            return null
        }

        //Add New Value to Stored
        this.setState({ droppedTotal: this.state.droppedTotal + dropPerSecond }, () => {
            this.props.parentCallback_newClaimable(this.state.nft.type, this.state.nft.stored + this.state.droppedTotal)
        })

    }

    //Upgrade -- Timer Funcs (upgradeEndingTime)
    //*************************************** 
    getRemainingTime = (endingTime) => {
        var startDate = new Date();
        var endDate = new Date(endingTime);
        var diff = endDate.getTime() - startDate.getTime();

        return diff / 1000 / 60 //return minutes
    }

    msToTime(duration) {
        let milliseconds = parseInt((duration % 1000));
        let seconds = Math.floor((duration / 1000) % 60);
        let minutes = Math.floor((duration / (1000 * 60)) % 60);
        let hours = Math.floor((duration / (1000 * 60 * 60)));

        hours = hours.toString().padStart(2, '0');
        minutes = minutes.toString().padStart(2, '0');
        seconds = seconds.toString().padStart(2, '0');
        milliseconds = milliseconds.toString().padStart(3, '0');

        return {
            hours,
            minutes,
            seconds,
            milliseconds
        };
    }

    start = () => {
        this.setState({ duration: (this.getRemainingTime(this.state.nft.upgradeEndingTime)) * 60 * 1000 })
        if (!this.upgradeTimer) {
            this.setState({
                startTime: Date.now()
            }, () => this.upgradeTimer = setInterval(() => this.run(), 1000))
        }
    }

    run = () => {
        //Count Down
        const diff = Date.now() - this.state.startTime;
        let remaining = this.state.duration - diff;
        if (remaining < 0) { remaining = 0; }
        this.setState(() => ({ time: this.msToTime(remaining) }));
        // console.log('remaining: ', remaining)

        //Upgrade just ended
        if (remaining === 0 && this.state.nft.upgradeStatus && this.upgradeTimer) {
            // console.log('Upgrade just ended, upgradeTimer:', this.upgradeTimer)

            clearInterval(this.upgradeTimer);
            // console.log('upgradeTimer post clear: ', this.upgradeTimer)

            this.upgradeTimer = null;
            // console.log('upgradeTimer post clear2: ', this.upgradeTimer)

            this.getUpgradedData();
        }
    }
    //*************************************** 
    //Upgrade -- Timer Funcs (upgradeEndingTime)

    async stakingApproved(id, type, newStatus = 0) {
        // console.log('stakingApproved...', id, type, newStatus)

        this.setState({
            showPopup: false
        }, () => {
            this.props.gameCallback_onPopup(false);
        });

        const actionToDo = newStatus ? 'Staking' : 'Unstaking';
        // console.log(actionToDo + '...')

        let contractAddress = null;
        let contract = null;
        let stake = null;

        let contractAddress721 = null;
        let contract721 = null;
        let isApproved = null;
        let approve = null;

        let receipt = null;

        //Get the Contract Address (Staking)
        if (type == 1) { contractAddress = this.ERCStaking.contractTownhall }
        else if (type == 2) { contractAddress = this.ERCStaking.contractLumberjack }
        else if (type == 3) { contractAddress = this.ERCStaking.contractStonemine }
        else if (type == 4) { contractAddress = this.ERCStaking.contractFisherman }
        else return false

        //Initialize the Contract Object (Staking)
        contract = new ethers.Contract(contractAddress, this.ERCStaking.ABI, this.props.metamask.walletSigner);


        //Get the Contract Address (721)
        if (type == 1) { contractAddress721 = this.ERC721.contractTownhall }
        else if (type == 2) { contractAddress721 = this.ERC721.contractLumberjack }
        else if (type == 3) { contractAddress721 = this.ERC721.contractStonemine }
        else if (type == 4) { contractAddress721 = this.ERC721.contractFisherman }
        else return false

        //Initialize the Contract Object (721)
        contract721 = new ethers.Contract(contractAddress721, this.ERC721.ABI, this.props.metamask.walletSigner);

        try {

            if (!newStatus) {//Unstake

                // console.log('I want to unstake!')
                stake = await contract.unstake(this.state.nft.id)

                // console.log(actionToDo + ' Result... ', stake)

                if (stake) {
                    let toastLoading = this.loading(actionToDo + '... Almost done!')

                    receipt = await stake.wait();
                    // console.log('Receipt ', receipt)

                    this.staking_getEventFromBE(id, type, newStatus, toastLoading);
                }
                //END --- Stake/Unstake

            }

        } catch (err) {
            this.notify(err.message)
        }
    }

    async staking_getEventFromBE(id, type, newStatus, toastLoading) {
        //Vars
        let i = 0;
        const maxTimeout = 5;
        let serverApproved = false;
        let builders = null;
        let wait = 1;

        //Loop until BE confirms or Logout
        for (i; i < maxTimeout; i++) {
            // console.log('For i:', i)

            await axios.post('/api/m1/buildings/isStake', {
                address: this.props.metamask.walletAccount,
                idDelegate: this.state.idDelegate,
                id: id,
                type: type,
                newStatus: newStatus
            }
            )
                .then(response => {
                    if (response.data.success) {
                        builders = response.data.data.builders;
                        serverApproved = true;
                    }
                })
                .catch(error => {
                    error.response.status == 500
                        && this.props.callback_Logout()

                    error.response.status == 401
                        && this.props.callback_Logout()
                })

            serverApproved
                ? i = maxTimeout
                : await new Promise(wait => setTimeout(wait, 1000 * i));
        }

        if (serverApproved) {
            let x = { ...this.state }
            x.nft.stake = !x.nft.stake;
            this.setState({ ...x })

            this.props.parentCallback_newBuilders(builders)
            if (!x.nft.stake) { this.props.callback_buildingUnstake(this.state.nft); }

            toast.update(toastLoading, {
                render: "Done!",
                type: "success",
                isLoading: false,
                autoClose: 3000
            });
        } else {
            this.props.callback_Logout();
        }

    }

    claimApproved = (json, type) => {
        this.props.parentCallback_newInventory(json, type, false)
        playSound('buildingClaim')
        let x = { ...this.state }
        x.nft.stored = json.newStored;
        this.setState({ ...x })
        this.setState({ droppedTotal: 0 })
        this.setState({ onClaim: false })
    }

    claim = () => {
        if (this.state.onClaim) return false
        if (this.state.nft.upgradeStatus) return false
        if (!this.state.nft.stake) return false
        if (this.state.nft.type == 4) return false

        this.setState({ onClaim: true })
        axios.post('/api/m1/buildings/claim', {
            address: this.props.metamask.walletAccount,
            idDelegate: this.state.idDelegate,
            nftId: this.props.nft.id,
            type: this.props.nft.type
        }
        )
            .then(response => {
                response.data.success
                    ? this.claimApproved(response.data.data, this.props.nft.type)
                    : null //console.log('claim not success...')
            })
            .catch(error => {
                error.response.status == 500
                    && this.props.callback_Logout()

                error.response.status == 401
                    && this.props.callback_Logout()
            })
    }

    upgradeApproved = (json) => {
        playSound('buildingUpgrade')
        let x = { ...this.state }

        x.nft.upgradeStatus = 1;
        x.nft.imageSprite = json.imageSprite;
        x.nft.upgradeEndingTime = json.upgradeEndingTime;

        this.setState({ ...x }, () => {
            this.props.callback_buildingUpgrade(this.state.nft);
            this.props.parentCallback_newInventory(json.resources, false, json.builders) //json.builders
        })
    }

    //UpgradeDone when I was Offline... Popup with upgradeFirstLogin
    upgradeWasDone = () => {
        this.props.parentCallback_refreshBuilders()
        this.setState({
            popupType: 'notification',
            showPopup: true
        }, () => { !this.props.onPopup && this.props.gameCallback_onPopup(true) });;
    }

    //UpgradeDone when I was Online... Fetch JSON again
    getUpgradedData = () => { //Updated info (post upgrade) for the single NFT

        if (this.state.nft.upgradeStatus) {
            axios.post('/api/m1/buildings/getNFT', {
                address: this.props.metamask.walletAccount,
                idDelegate: this.state.idDelegate,
                nftId: this.props.nft.id,
                type: this.props.nft.type
            }
            )
                .then(response => {
                    // const builders = {buildersAvailable:500 , buildersTotal:500}

                    if (response.data.success) {

                        // console.log('getUpgradeData response', response)

                        this.setState({
                            nft: {
                                id: response.data.data.nft.id,
                                type: response.data.data.nft.type,
                                stake: response.data.data.nft.stake,
                                name: response.data.data.nft.name,
                                image: response.data.data.nft.image,
                                imageSprite: response.data.data.nft.imageSprite,
                                level: response.data.data.nft.level,
                                description: response.data.data.nft.description,
                                moreInfo: response.data.data.nft.moreInfo,
                                stored: response.data.data.nft.stored,
                                capacity: response.data.data.nft.capacity,
                                dropQuantity: response.data.data.nft.dropQuantity,
                                dropInterval: response.data.data.nft.dropInterval,
                                upgradeImage: response.data.data.nft.levelMax ? null : response.data.data.nft.upgradeImage,
                                upgradeTime: response.data.data.nft.upgradeTime,
                                upgradeCapacity: response.data.data.nft.upgradeCapacity,
                                upgradeDropQuantity: response.data.data.nft.upgradeDropQuantity,
                                upgradeResources: response.data.data.nft.upgradeResources,
                                upgradeStatus: response.data.data.nft.upgradeStatus,
                                upgradeEndingTime: response.data.data.nft.upgradeEndingTime,
                                upgradeFirstLogin: response.data.data.nft.upgradeFirstLogin
                            }
                        }, () => {
                            this.props.parentCallback_newBuilders(response.data.data.builders);
                            this.props.callback_buildingUpgrade(this.state.nft);
                            this.setState({
                                duration: null,
                                popupType: 'notification',
                                showPopup: true
                            }, () => {
                                !this.props.onPopup && this.props.gameCallback_onPopup(true)
                            });
                        })

                    }
                })
                .catch(error => {
                    // console.error('Error axios.getNFT: ', error);

                    error.response.status == 401
                        && this.props.callback_Logout()
                })
        }

    }

    serverIsNotified = () => { //Set state.nft.upgradeFirstLogin: false

        let x = { ...this.state }

        x.nft.upgradeFirstLogin = false;

        this.setState({ ...x })
    }
    //*************************************** 

    onInfoBtnClick = () => {
        if (this.props.nft.levelMax) return;
        this.setState({
            onApiCall: true
        })
        axios.post('/api/m1/buildings/getNFTUpgradeRequirements', {
            address: this.props.metamask.walletAccount,
            idDelegate: this.state.idDelegate,
            buildingType: this.props.nft.type,
            buildingLevel: this.props.nft.level
        })
            .then(response => {
                console.log(response)
                this.setState({
                    onApiCall: false,
                    upgradeResources: response.data.data,
                    popupType: 'info', showPopup: true
                }, () => { !this.props.onPopup && this.props.gameCallback_onPopup(true) })
            })
            .catch(error => {
                // console.error('Error axios.getNFT: ', error);
                error.response.status == 401
                    && this.props.callback_Logout()
            })
    }
    onUpgradeBtnClick = () => {
        this.setState({
            onApiCall: true
        })
        axios.post('/api/m1/buildings/getNFTUpgradeRequirements', {
            address: this.props.metamask.walletAccount,
            idDelegate: this.state.idDelegate,
            buildingType: this.props.nft.type,
            buildingLevel: this.props.nft.level
        })
            .then(response => {
                console.log(response)
                this.setState({
                    onApiCall: false,
                    upgradeResources: response.data.data,
                    popupType: 'upgrade', showPopup: true
                }, () => { !this.props.onPopup && this.props.gameCallback_onPopup(true) })
            })
            .catch(error => {
                // console.error('Error axios.getNFT: ', error);
                error.response.status == 401
                    && this.props.callback_Logout()
            })
    }

    loading = (message) => this.props.callback_ToastLoading(message)

    notify = (error) => this.props.callback_ToastError(error)

    render() {

        return (
            <>
                {this.state.showPopup ?
                    <PopupGame
                        metamask={this.props.metamask}
                        type={this.state.popupType}
                        inventory={this.props.inventory}
                        builders={this.props.builders}
                        data={this.state.nft}
                        upgradeResources={this.state.upgradeResources}
                        droppedTotal={this.state.droppedTotal}

                        images={{ ancien: imgAncien, wood: imgWood, stone: imgStone }}

                        parentCallback_Close={() =>
                            [this.setState({ showPopup: false }),
                            this.props.gameCallback_onPopup(false)]
                        }

                        parentCallback_Notified={() => this.serverIsNotified()}
                        parentCallback_UpgradeApproved={this.upgradeApproved}
                        parentCallback_ClaimApproved={this.claimApproved}

                        parentCallback_StakingApproved={this.stakingApproved}

                        onLoading={false}

                        callback_Logout={() => this.props.callback_Logout()}

                        idDelegate={this.state.idDelegate}
                    />
                    : null}

                <div
                    className={
                        (this.state.isVisible.toString() != this.state.uniqueID.toString())
                            ? 'nft-overlay notVisible'
                            : 'nft-overlay'}
                    onClick={() => this.props.gameCallback_closePopup()}
                />

                <div className={
                    (this.state.isVisible.toString() != this.state.uniqueID.toString())
                        ? 'game-nft notVisible'
                        : 'game-nft'}>
                    {this.state.onApiCall &&
                        <div className='api-loading'>
                            <span className='apiCallLoading'></span>
                            <span className={'loader'}></span>
                        </div>}
                    <img
                        src={iconClose}
                        className='menu-icon-close'
                        onClick={() => this.props.gameCallback_closePopup()}
                    />

                    <div className='left'>

                        {this.state.nft.upgradeStatus ?
                            <div className='upgrade-in-progress'>
                                <p>
                                    {this.state.time.hours}h {this.state.time.minutes}m {this.state.time.seconds}s
                                </p>
                            </div>
                            :
                            null
                        }

                        <img src={this.state.nft.image} />
                    </div>

                    <div className='right'>

                        <div className='right-1'>

                            <h2>
                                {this.state.nft.name} Lv.{this.state.nft.level}

                                {//HIGH TICKET BUILDINGS (Type 1/2/3)
                                    this.state.nft.type > 0 && this.state.nft.type < 4 ?
                                        <img
                                            src={iconInfoNFT}
                                            className='nft-icon-info'
                                            onClick={this.onInfoBtnClick}
                                        />
                                        : null}
                            </h2>

                            {//HIGH TICKET BUILDINGS (Type 1/2/3)
                                this.state.nft.type > 0 && this.state.nft.type < 4 ?
                                    <>
                                        <div className='progress'>
                                            <span className='game-tooltip stored'>
                                                {(parseFloat(this.state.nft.stored + parseFloat(this.state.droppedTotal)) < parseFloat(this.state.nft.capacity))
                                                    ? getNumberOfDecimals(parseFloat(this.state.nft.stored) + parseFloat(this.state.droppedTotal), 4)
                                                    : this.state.nft.capacity
                                                }
                                            </span>
                                            <p>
                                                {((parseFloat(this.state.nft.stored) + parseFloat(this.state.droppedTotal)))
                                                    < parseFloat(this.state.nft.capacity) //Check Stored < Capacity

                                                    ?
                                                    removeDecimals(parseFloat(this.state.nft.stored)
                                                        + parseFloat(this.state.droppedTotal))

                                                    :
                                                    this.state.nft.capacity
                                                }
                                                {' / '}
                                                {format(this.state.nft.capacity)}
                                            </p>
                                            <div className="stored" style={{ '--scroll': parseInt(100 / (this.state.nft.capacity / (parseFloat(this.state.nft.stored) + parseFloat(this.state.droppedTotal)))) + '%' }} />
                                        </div>

                                        <img src={getImage(this.state.nft.type)} className='nft-icon-resource' />
                                    </>
                                    //DON'T SHOW FOR THE FISHERMAN
                                    : null}

                        </div> {/*  //Section1 */}

                        <div className='right-2'>

                            {/* <img src={imageHeroes} className='heroes'/> */}

                            <span>{this.state.nft.description}</span>

                        </div> {/*  //Section1 2*/}

                        {!this.props.onPopup
                            ?
                            <div className='right-3'>

                                {this.state.idDelegate == null && <Button
                                    style={((this.props.isStakable || this.state.nft.stake) && !this.state.nft.upgradeStatus) ? 'btn-stake' : 'btn-stake disabled'}
                                    text={this.state.nft.stake ? 'Unstake' : 'Stake'}
                                    onButtonClick={() => {
                                        ((this.props.isStakable || this.state.nft.stake) && !this.state.nft.upgradeStatus) &&
                                            this.setState({
                                                popupType: (this.state.nft.stake ? 'unstake' : 'stake'),
                                                showPopup: true
                                            }, () => { !this.props.onPopup && this.props.gameCallback_onPopup(true) })
                                    }

                                    } />}

                                {!(this.state.idDelegate != null && !this.state.delegationData.upgrade) && <div className='btn-upgrade'>
                                    {(this.state.nft.upgradeStatus) ?
                                        <p>
                                            {100 - Math.ceil(
                                                100 /
                                                (this.state.nft.upgradeTime /
                                                    (
                                                        (this.state.time.hours * 3600)
                                                        + (this.state.time.minutes * 60)
                                                        + this.state.time.seconds
                                                    ) * 100
                                                )
                                            )
                                            }%
                                        </p>
                                        : null}

                                    <img
                                        src={
                                            (this.state.nft.levelMax)
                                                ? imgUpgradeMaxLevel
                                                : (this.state.nft.upgradeStatus)
                                                    ? imgUpgrading
                                                    : this.props.builders.buildersAvailable < 1
                                                        ? imgBuildersMissing
                                                        : imgUpgrade
                                        }
                                        className={(
                                            this.state.nft.levelMax
                                            || this.state.nft.upgradeStatus
                                            || !this.state.nft.stake
                                            || this.props.builders.buildersAvailable < 1
                                        )
                                            ? 'disabled'
                                            : null
                                        }
                                        onClick={() => {
                                            (!this.state.nft.upgradeStatus && !this.props.nft.levelMax && this.state.nft.stake && this.props.builders.buildersAvailable >= 1)
                                                && this.onUpgradeBtnClick()
                                        }
                                        } />
                                </div>}

                                {/* CLAIM BUTTON */}

                                {
                                    //HIGH TICKET BUILDINGS (Type 1/2/3)
                                    this.state.nft.type > 0 && this.state.nft.type < 4 ?
                                        (this.state.idDelegate == null || this.state.delegationData.claim) && <Button
                                            style={
                                                (this.state.nft.stake && !this.state.nft.upgradeStatus && roundMinOne(this.state.nft.stored + this.state.droppedTotal) >= 1)
                                                    ? 'btn-claim'
                                                    : 'btn-claim disabled'}
                                            text={this.state.onClaim ? <CircularProgress size={30} sx={{ color: "gray" }} /> : 'Claim'}
                                            onButtonClick={() => {
                                                (!this.state.onClaim && this.state.nft.stake && !this.state.nft.upgradeStatus && roundMinOne(this.state.nft.stored + this.state.droppedTotal) >= 1)
                                                    && this.claim()
                                            }
                                            } />

                                        //FISHERMAN
                                        : this.state.nft.type == 4 ?
                                            (this.state.idDelegate == null || this.state.delegationData.fisherman) && <Button
                                                style={
                                                    (this.state.nft.stake)
                                                        ? 'btn-claim'
                                                        : 'btn-claim disabled'}
                                                text='Fish'
                                                onButtonClick={() => {
                                                    (this.state.nft.stake)
                                                        && this.props.callback_fishOpen()
                                                }
                                                } />

                                            //ERROR
                                            : null}




                            </div>
                            : null}

                    </div>

                </div>

            </>
        )
    }
}

function getImage(type) {

    let imgType

    type == 1 ?
        imgType = imgAncien
        : type == 2 ?
            imgType = imgWood
            : type == 3 ?
                imgType = imgStone
                : imgType = 'unknown'

    return imgType
}

function format(x) {
    let newValue = x;

    newValue
        && (newValue = x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","))

    return newValue
}

function removeDecimals(x) {
    x = x.toString();

    let htmlToReturn = x;

    x % 1 == 0
        ? null
        : htmlToReturn = <><b>{x.split(".")[0]}</b></>;

    return htmlToReturn
}

function getNumberOfDecimals(x, number) {
    let xInt = x
    let xDec = null;
    let htmlToReturn = null;
    x = x.toString()

    x % 1 == 0
        ? null
        : [xInt = x.split(".")[0], xDec = x.split(".")[1].slice(0, number)]

    xDec
        ? htmlToReturn = <><b>{xInt}</b>.{xDec}</>
        : htmlToReturn = <><b>{x}</b></>

    return htmlToReturn
}

export default NFT