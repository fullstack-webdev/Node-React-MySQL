import './game.scss';

// import '../../json-mockup';
import React, { Component } from 'react';

import axios from 'axios';
import { ethers } from 'ethers';
import { Link } from 'react-router-dom';

import styled from '@emotion/styled';
import {
  Dialog,
  IconButton,
} from '@mui/material';

import Login from '../../auth/login/Login';
import {
  GameNav,
  Inventory,
  Notification,
} from '../../components-game/';
import { serverConfig } from '../../config/serverConfig';
import {
  AllTicket,
  Bonus,
  City,
  GameCities,
  GameContract,
  GameCraft,
  GameCraftInventory,
  GameFish,
  GameGem,
  GameLeaderBoard,
  GameLP,
  GameMarketplace,
  GameNPC,
  GamePanel,
  GamePrestige,
  GameSetting,
  GameStorage,
  GameTicket,
  GameUniverse,
  Land,
  LandInfo,
  LandsOwner,
  TicketMarketplace,
  World,
} from '../../containers-game/';
import MapComponent from '../../containers-game/map/MapComponent';
import A4TiBdskweqw0T
  from '../../ktiVmx0VW5waGJYZG5VRk5DWWtveVducGFS/A4TiBdskweqw0T';
import SoundEffect from '../../utils/sounds';

console.log('serverConfig', serverConfig);

const stateDefault = {
    //Auth
    isLogged: false,
    onLogout: false,

    //Delegate
    idDelegate: null,
    delegationData: {},

    //Loading
    isReady: false,
    loadedInventory: false,
    loadedNFTs: false,
    loadedProfile: false,


    // Prestige
    prestigeData: {},

    //************************* NavBar Logic *********************
    onLoading: false,

    //Navbar
    gameShowComponent: "city",
    gameShowRegion: "city",
    modalComponentVisible: false,

    //Cross world feature
    cityData: { home: true },
    landData: {},
    worldData: {},
    universeData: {},

    // lands-owner component
    ownedLandsData: {},
    // cities component
    cities: [],

    // has Land NFT
    hasOwnLand: false,
    // is LandGuest
    hasHome: false,

    //************************* NavBar Logic *********************

    guestChecked: false,

    //Inventory
    inventory: {
        ancien: null,
        wood: null,
        stone: null,
    },
    alert: [],

    //Settings
    settings: {
        profileImage: null,
        cityName: null,
        idEmblem: -1,
    },

    //NFTs
    nfts: [],
    hasFisherNFTStake: false,

    //Builders
    builders: {
        buildersAvailable: null,
        buildersTotal: null,
    },

    //Vouchers
    vouchers: null,

    //Metamask Resources
    metamaskResources: {
        ancien: 0,
        wood: 0,
        stone: 0,
    },

    claimable: {
        ancien: 0,
        wood: 0,
        stone: 0,
    },

    //Notification
    // notification: {
    //   headline: 'Welcome to Ancient Society!',
    //   elements: [
    //     {
    //     "headline": "Test 1!",
    //     "text": "AAA  NB: If you select different values you won't be eligible for rewards!"
    //     },
    //     {
    //     "headline": "Select Full Range 2",
    //     "text": "Open Uniswap and select Full Range option to be eligible for rewards. NB: If you select different values you won't be eligible for rewards!"
    //     },
    //   ]
    // }

    // announcement: {
    //   text: 'Omega Server is online!',
    //   cta: 'Let me see',
    //   notification: {
    //       headline: 'New Server Available!',
    //       elements: [
    //         {
    //         "headline": "Test 1!",
    //         "text": "AAA  NB: If you select different values you won't be eligible for rewards!"
    //         }
    //       ]
    //     }
    // }
};



//CONFIRMATION DIALOGS
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
class Game extends Component {
    constructor(props) {
        super(props);



        this.marketplaceButton = React.createRef();
        this.gameButton = React.createRef();

        this.state = { ...stateDefault };

        //Server Info
        this.state.serverInfo = {
            serverStatus: null,
            playersOnline: null,
            playersTotal: null,
        };

        this.state.rodViewInfo = 0;

        //Metamask Connected
        (this.metamask = {
            walletProvider: null,
            walletAccount: null,
            walletSigner: null,
            walletNetwork: null,
        }),
            //Contracts & ABIs
            (this.ERC721 = {
                //ERC721 Contract Address
                contractTownhall: serverConfig.erc721.contractTownhall,
                contractLumberjack: serverConfig.erc721.contractLumberjack,
                contractStonemine: serverConfig.erc721.contractStonemine,
                contractFisherman: serverConfig.erc721.contractFisherman,
                contractLand: serverConfig.erc721.contractLand,

                //ERC721 Contract ABI
                ABI: serverConfig.erc721.abi,
            }),
            (this.ERCStaking = {
                //STAKING Contract Address
                contractTownhall: serverConfig.erc721.staking.contractTownhall,
                contractLumberjack: serverConfig.erc721.staking.contractLumberjack,
                contractStonemine: serverConfig.erc721.staking.contractStonemine,
                contractFisherman: serverConfig.erc721.staking.contractFisherman,
                contractLand: serverConfig.erc721.staking.contractLand,

                //STAKING Contract ABI
                ABI: serverConfig.erc721.staking.abi,
            }),
            (this.ERC20 = {
                //ERC20 Contract Address
                contractAncien: serverConfig.erc20.contractAncien,
                contractWood: serverConfig.erc20.contractWood,
                contractStone: serverConfig.erc20.contractStone,

                //ERC20 Contract ABI
                ABI: serverConfig.erc20.abi,
            }),

            //Functions Binding
            this.newProfile = this.newProfile.bind(this);
        this.newInventory = this.newInventory.bind(this);
        this.newNFTS = this.newNFTS.bind(this);
        this.newBuilders = this.newBuilders.bind(this);
        this.getBuilders = this.getBuilders.bind(this);
        this.getUniverse = this.getUniverse.bind(this);
        this.getLandOwner = this.getLandOwner.bind(this);
        this.getAllLands = this.getAllLands.bind(this);
        this.getDelegatedCities = this.getDelegatedCities.bind(this);

        this.backToLand = this.backToLand.bind(this);
        this.onVisitCity = this.onVisitCity.bind(this);
        this.onVisitLand = this.onVisitLand.bind(this);
        this.onVisitWorld = this.onVisitWorld.bind(this);

        this.guestCheck = this.guestCheck.bind(this);

        this.onPrestige = this.onPrestige.bind(this);
        this.prestigeDone = this.prestigeDone.bind(this);

        this.onDelegate = this.onDelegate.bind(this);
        this.offDelegate = this.offDelegate.bind(this);
        this.setInventory = this.setInventory.bind(this);
        this.removeVoucher = this.removeVoucher.bind(this);
        this.addVoucher = this.addVoucher.bind(this);
        this.getBalance = this.getBalance.bind(this);
        this.showComponent = this.showComponent.bind(this);
        this.newClaimable = this.newClaimable.bind(this);
        this.handleClickOnMap = this.handleClickOnMap.bind(this);
        this.setLogoutError401 = this.setLogoutError401.bind(this);
        this.onAccountSwitch = this.onAccountSwitch.bind(this);
        this.newNotification = this.newNotification.bind(this);
    }

    componentDidMount() {
        const root = document.querySelectorAll("#root")[0];
        root.style.cssText = "position: absolute;width: 100%;height: 100%;";
        const html = document.querySelectorAll("html")[0];
        html.style.cssText =
            "position: fixed;position: absolute;width: 100%;height: 100%;overflow: hidden;";
        const body = document.querySelectorAll("body")[0];
        body.style.cssText =
            "position: fixed;position: absolute;width: 100%;height: 100%;overflow: hidden;";

        this.getServerInfo();

        // forwarded from /marketplace
        let forwardFromComponent = new URLSearchParams(window.location.search).get('b');
        if (forwardFromComponent == 9071234) this.setState({ forwardFromComponent: true });

        //Check if it's env.mobile
        if (process.env.REACT_APP_ENV) {
            this.metamask.walletAccount = process.env.REACT_APP_MOBILE_WALLET;

            let idDelegateData = null;
            let delegationData = {}

            if (serverConfig?.features.delegation) {
                let delegateParam = new URLSearchParams(window.location.search).get('delegate');
                idDelegateData = delegateParam;
                if (idDelegateData != null) {
                    axios
                        .post("/api/m1/delegation/getDelegationData", {
                            address: this.metamask.walletAccount,
                            idDelegate: idDelegateData
                        })
                        .then((response) => {
                            if (response.data.success) {
                                let delegations = response.data.data;
                                for (let delegation of delegations) {
                                    delegationData[delegation.type] = delegation.allowed
                                }
                            }

                            this.setState({
                                isLogged: true,
                                idDelegate: idDelegateData,
                                delegationData: delegationData
                            }, () => {
                                this.getData();
                            })
                        })
                        .catch((error) => {
                            this.setState({
                                isLogged: true,
                                idDelegate: idDelegateData,
                                delegationData: delegationData
                            }, () => {
                                this.getData();
                            })
                            // error.response.status == 500 && this.setState({ onLogout: true });
                            // error.response.status == 401 && this.setState({ onLogout: true });
                        });
                } else {
                    this.setState({
                        isLogged: true,
                        idDelegate: idDelegateData,
                        delegationData: delegationData
                    }, () => {
                        this.getData();
                    })
                }
            } else {
                this.setState({
                    isLogged: true,
                    idDelegate: idDelegateData,
                    delegationData: delegationData
                }, () => {
                    this.getData();
                })
            }
        }
    }

    componentDidUpdate() {
        !this.state.isReady &&
            this.state.isLogged &&
            this.state.loadedInventory &&
            this.state.loadedNFTs &&
            this.state.guestChecked &&
            this.state.loadedProfile
            ? this.setState({ isReady: true }, () => {
                clearInterval(this.timerRefreshAPIs);
                //Refresh Inventory every 60 secs
                this.timerRefreshAPIs = setInterval(() => {
                    this.getResources();
                    this.getBalance();
                }, 30000);
            })
            : null;

        /* console.log('alert: ', this.state.alert, !this.state.isReady,
        this.state.isLogged,
        this.state.loadedInventory,
        this.state.loadedNFTs,
        this.state.guestChecked,
        this.state.loadedProfile) */
    }

    componentWillUnmount() {
        clearInterval(this.timerRefreshAPIs);
    }

    //FETCH ALL DATA
    async getData() {
        //NOT DELEGATE
        if (!this.state.idDelegate) {
            // console.log('Not Delegate')
            this.getNFTs();
            this.getResources();
            this.getProfile();
            this.getAlerts();
            this.getVouchers();
            this.getBalance();
            this.getBuilders();
            this.getDelegatedCities();
            this.guestCheck();
        }

        //IS DELEGATE
        if (this.state.idDelegate) {
            // console.log('Is Delegate')
            this.getNFTs();
            this.getResources();
            this.getAlerts();
            this.getProfile();
            this.getBuilders();
            this.getDelegatedCities();
            this.guestCheck();
        }
    }

    // Guest Check
    guestCheck() {
        axios
            .post("/api/m1/land/guestCheck", {
                address: this.metamask.walletAccount,
            })
            .then((response) => {
                console.log('guestCheck', response.data)
                if (response.data.success) {
                    const res = response.data.data
                    this.setState({
                        hasOwnLand: res.hasOwnLand,
                        hasHome: res.hasHome,
                    }, () => {
                        this.setState({ guestChecked: true });
                    })
                }
            })
            .catch((error) => {
                error.response.status == 500 && this.setState({ onLogout: true });
                error.response.status == 401 && this.setState({ onLogout: true });
            });
    }

    //SERVER
    async getServerInfo() {
        axios
            .post("/api/m1/server/getInfo")
            .then((response) => {
                //All good
                if (response.data.success) {
                    this.setState({ serverInfo: response.data.data.serverInfo });
                }

                //Something gone wrong
                else {
                    this.setState({
                        serverInfo: {
                            serverStatus: false,
                            playersOnline: "--",
                            playersTotal: "--",
                        },
                    });
                }
            })
            .catch((error) => {
                this.setState({
                    serverInfo: {
                        serverStatus: false,
                        playersOnline: "--",
                        playersTotal: "--",
                    },
                });
            });
    }

    //PROFILE
    async getProfile() {
        axios
            .post("/api/m1/profile/getProfile", {
                address: this.metamask.walletAccount,
                idDelegate: this.state.idDelegate,
            })
            .then((response) => {
                console.log('getProfile', response.data)
                if (response.data.success) {
                    let profileImage = response.data.data.profile.image;
                    let cityName = response.data.data.profile.cityName;
                    let idEmblem = response.data.data.profile.idEmblem;

                    //ANNOUNCEMENT
                    let announcement;
                    try {
                        announcement = response.data.data.announcement;
                        if (announcement)
                            announcement.notification =
                                JSON.parse(
                                    JSON.parse(
                                        JSON.stringify(announcement.notification)
                                            .replaceAll('`', '')))
                    } catch (err) {
                        console.error('[42387123500] ', err)
                    }


                    if (!cityName) {
                        cityName = this.metamask.walletAccount.toString().slice(0, 15);
                    }
                    if (!profileImage) {
                        profileImage =
                            "https://ancient-society.s3.eu-central-1.amazonaws.com/placeholder/no-image.webp";
                    }
                    if (!idEmblem) {
                        idEmblem = "";
                    }

                    this.setState({
                        settings: {
                            profileImage: profileImage,
                            cityName: cityName,
                            idEmblem: idEmblem,
                        },
                        announcement: announcement,
                        loadedProfile: true,
                    });

                    //Success False
                } else {
                    null;
                }
            })
            .catch((error) => {
                console.log(error);

                error.response.status == 500 && this.setState({ onLogout: true });

                error.response.status == 401 && this.setState({ onLogout: true });
            });
    }
    newProfile(avatarFile, cityName, idEmblem) {
        //Old Image, New Name!
        if (!avatarFile) {
            //Use the new data
            this.setState({
                settings: {
                    profileImage: this.state.settings.profileImage,
                    cityName: cityName,
                    idEmblem: idEmblem,
                },
            });

            //New Image! Reset the image to render again the component (always has the same name)
        } else {
            //Use the new data
            this.setState({
                settings: {
                    profileImage: avatarFile
                        ? avatarFile
                        : this.state.settings.profileImage,
                    cityName: cityName,
                    idEmblem: idEmblem,
                },
            });
        }
    }

    //DELEGATE
    async onDelegate(idDelegate, delegationData) {
        console.log(delegationData);
        // if ( this.state.idDelegate == idDelegate ) {
        //   return
        // }
        // clearInterval(this.timerRefreshAPIs);
        this.setState(stateDefault, () => {
            this.setState({ isLogged: true, idDelegate, delegationData }, () => {
                this.getData();
            });
        });
    }
    async offDelegate() {
        // clearInterval(this.timerRefreshAPIs);
        this.gameButton.current.click();
        this.setState(stateDefault, () => {
            this.setState(
                { isLogged: true, idDelegate: null, delegationData: {} },
                () => {
                    this.getData();
                }
            );
        });
    }
    async getDelegatedCities() {
        if (!serverConfig?.features.delegation) return false

        this.setState({
            cities: []
        })
        axios
            .post("/api/m1/delegation/getDelegatedCities", {
                address: this.metamask.walletAccount,
            })
            .then((response) => {
                console.log('getDelegatedCities', response.data)
                response.data.success
                    ? this.setState({
                        cities: response.data.data,
                    })
                    : null;
            })
            .catch((error) => {
                error.response.status == 500 && this.setState({ onLogout: true });

                error.response.status == 401 && this.setState({ onLogout: true });
            });
    }

    //RESOURCES
    async setInventory(resources) {
        if (resources != undefined) {
            this.setState({
                inventory: {
                    ancien: resources.ancien,
                    wood: resources.wood,
                    stone: resources.stone,
                },
                loadedInventory: true,
            });
        }
    }
    async getResources() {
        axios
            .post("/api/m1/user/getResources", {
                address: this.metamask.walletAccount,
                idDelegate: this.state.idDelegate,
            })
            .then((response) => {
                console.log('getResources', response.data)
                response.data.success
                    ? this.setState({
                        inventory: {
                            ancien: response.data.data.resources.ancien,
                            wood: response.data.data.resources.wood,
                            stone: response.data.data.resources.stone,
                        },
                        loadedInventory: true,
                    })
                    : null;
            })
            .catch((error) => {
                error.response.status == 500 && this.setState({ onLogout: true });

                error.response.status == 401 && this.setState({ onLogout: true });
            });
    } //getResources

    async getAlerts() {
        axios
            .post("/api/m1/user/getAlerts", {
                address: this.metamask.walletAccount,
                idDelegate: this.state.idDelegate,
            })
            .then((response) => {
                console.log('getAlerts', response.data)
                response.data.success
                    ? this.setState({
                        alert: response.data.data.alert,
                    })
                    : null;
            })
            .catch((error) => {
                error.response.status == 500 && this.setState({ onLogout: true });
                error.response.status == 401 && this.setState({ onLogout: true });
            });
    }

    newInventory(resources, type = false, builders = false) {
        builders && this.newBuilders(builders);

        let x = { ...this.state };

        type == false
            ? this.setState({
                inventory: {
                    ancien: resources.ancien,
                    wood: resources.wood,
                    stone: resources.stone,
                },
            })
            : (type == 1
                ? (x.inventory.ancien = resources.newAmount)
                : type == 2
                    ? (x.inventory.wood = resources.newAmount)
                    : type == 3
                        ? (x.inventory.stone = resources.newAmount)
                        : null, //console.log('error'))
                this.setState({ ...x }));
    } //newInventory

    //STORAGE
    async getVouchers() {
        if (!serverConfig?.features.storage.withdraw) return false

        axios({
            method: "post",
            url: "/api/c1/contract/getVouchers",
            data: {
                address: this.metamask.walletAccount,
            },
        })
            .then((response) => {
                console.log('getVouchers', response.data)
                response.data.success
                    ? this.setState({
                        vouchers:
                            response.data.data.vouchers != null
                                ? response.data.data.vouchers
                                : null,
                    })
                    : null;
            })
            .catch((error) => {
                error.response.status == 500 && this.setState({ onLogout: true });

                error.response.status == 401 && this.setState({ onLogout: true });
            });
    } //getVouchers
    
    async getBalance() {
        if (!serverConfig?.erc20.available) return false

        //Vars
        let balanceAncien = 0;
        let ancienInst = null;
        let balanceWood = 0;
        let woodInst = null;
        let balanceStone = 0;
        let stoneInst = null;

        //ABI
        const abi = this.ERC20.ABI;

        try {
            //Get Ancien Balance
            ancienInst = new ethers.Contract(
                this.ERC20.contractAncien,
                abi,
                this.metamask.walletSigner
            );
            balanceAncien = ethers.utils.formatEther(
                await ancienInst.balanceOf(this.metamask.walletAccount)
            );
            //Get Wood Balance
            woodInst = new ethers.Contract(
                this.ERC20.contractWood,
                abi,
                this.metamask.walletSigner
            );
            balanceWood = ethers.utils.formatEther(
                await woodInst.balanceOf(this.metamask.walletAccount)
            );
            //Get Stone Balance
            stoneInst = new ethers.Contract(
                this.ERC20.contractStone,
                abi,
                this.metamask.walletSigner
            );
            balanceStone = ethers.utils.formatEther(
                await stoneInst.balanceOf(this.metamask.walletAccount)
            );
        } catch (err) {
            console.log("Error: ", err);
        }

        this.setState({
            metamaskResources: {
                ancien: parseInt(balanceAncien),
                wood: parseInt(balanceWood),
                stone: parseInt(balanceStone),
            },
        });
    }
    addVoucher(newVoucher) {
        if (Array.isArray(this.state.vouchers)) {
            this.state.vouchers.push({
                id: newVoucher.id,
                type: newVoucher.type,
                quantity: newVoucher.quantity,
                signature: newVoucher.signature,
                blockNumber: newVoucher.blockNumber,
            });
        } else {
            this.setState(
                {
                    vouchers: [],
                },
                () => {
                    this.state.vouchers.push({
                        id: newVoucher.id,
                        type: newVoucher.type,
                        quantity: newVoucher.quantity,
                        signature: newVoucher.signature,
                        blockNumber: newVoucher.blockNumber,
                    });
                }
            );
        }
    }
    async removeVoucher(arrayIndex = 0, type = false, quantity = false) {
        if (type && quantity) {
            let newQuantity = quantity;
            if (type == 1) {
                newQuantity += this.state.inventory.ancien;
            } else if (type == 2) {
                newQuantity += this.state.inventory.wood;
            } else if (type == 3) {
                newQuantity += this.state.inventory.stone;
            } else return false;
            let resources = { newAmount: newQuantity };
            this.newInventory(resources, type);
        }
        // console.log('removeVoucher key: ', arrayIndex)
        let newData = this.state.vouchers;
        // console.log(newData)
        delete newData[arrayIndex];
        newData = newData.filter((element) => {
            return element != null;
        });
        // console.log(newData)
        newData.length == 0
            ? this.setState({
                vouchers: null,
            })
            : this.setState({ vouchers: newData });
    } //RemoveVoucher

    //NFTS
    async getNFTs() {
        axios
            .post("/api/m1/buildings/getAccountData", {
                address: this.metamask.walletAccount,
                idDelegate: this.state.idDelegate,
            })
            .then((response) => {
                console.log('getNFTs', response.data)
                response.data.success
                    ? this.setState({ nfts: response.data.data }, () => {
                        const nftData = response.data.data;
                        let hasFisherManStake = false;
                        for (var i = 0; i < nftData.length; ++i) {
                            if (nftData[i].type == 4 && nftData[i].stake == 1) {
                                hasFisherManStake = true;
                                break;
                            }
                        }
                        this.setState({
                            hasFisherNFTStake: hasFisherManStake,
                        });
                        // console.log(response.data.data, hasFisherManStake)
                        this.setState({ loadedNFTs: true });
                    })
                    : null;
            })
            .catch((error) => {
                error.response.status == 500 && this.setState({ onLogout: true });

                error.response.status == 401 && this.setState({ onLogout: true });
            });
    } //getNFTs
    newNFTS(nfts) {
        // console.log('newNFTS: ', nfts)
        // this.setState({loadedNFTs: false}, () => this.getNFTs())
        this.getNFTs();
    } //newNFTS
    async getBuilders() {
        axios
            .post("/api/m1/user/getBuilders", {
                address: this.metamask.walletAccount,
                idDelegate: this.state.idDelegate,
            })
            .then((response) => {
                console.log('getBuilders', response.data)
                response.data.success
                    ? this.setState({
                        builders: {
                            buildersAvailable:
                                response.data.data.builders.buildersAvailable,
                            buildersTotal: response.data.data.builders.buildersTotal,
                        },
                    })
                    : null;
            })
            .catch((error) => {
                error.response.status == 500 && this.setState({ onLogout: true });

                error.response.status == 401 && this.setState({ onLogout: true });
            });
    } //getBuilders
    newBuilders(newBuilders) {
        this.getAlerts();
        this.setState({
            builders: {
                buildersAvailable: newBuilders.buildersAvailable,
                buildersTotal: newBuilders.buildersTotal,
            },
        });
    } //newBuilders
    newClaimable = (type, newStored) => {
        let previousState = { ...this.state };
        if (type == 1) previousState.claimable.ancien = newStored;
        if (type == 2) previousState.claimable.wood = newStored;
        if (type == 3) previousState.claimable.stone = newStored;
        this.setState({ ...previousState });
    };

    //AUTH
    isLogged = async (
        walletProvider,
        walletAccount,
        walletSigner,
        walletNetwork,
        isLogged
    ) => {
        if (!this.state.isLogged && !this.state.onLogout && isLogged) {
            this.metamask.walletProvider = walletProvider;
            this.metamask.walletAccount = walletAccount;
            this.metamask.walletSigner = walletSigner;
            this.metamask.walletNetwork = walletNetwork;

            let idDelegateData = null;
            let delegationData = {}

            if (serverConfig?.features.delegation) {
                let delegateParam = new URLSearchParams(window.location.search).get('delegate');
                idDelegateData = delegateParam;
                if (idDelegateData != null) {
                    await axios
                        .post("/api/m1/delegation/getDelegationData", {
                            address: this.metamask.walletAccount,
                            idDelegate: idDelegateData
                        })
                        .then((response) => {
                            if (response.data.success) {
                                let delegations = response.data.data;
                                for (let delegation of delegations) {
                                    delegationData[delegation.type] = delegation.allowed
                                }
                            }
                        })
                        .catch((error) => {
                            // error.response.status == 500 && this.setState({ onLogout: true });
                            // error.response.status == 401 && this.setState({ onLogout: true });
                        });
                }
            }
            this.setState({
                isLogged: isLogged,
                idDelegate: idDelegateData,
                delegationData: delegationData
            }, () => {
                this.getData();
            })
        }

        return walletAccount;
    };
    setLogoutError401 = () => {
        this.setState(
            {
                isLogged: false,
                isReady: false,
                loadedInventory: false,
                loadedNFTs: false,
                guestChecked: false,
                loadedProfile: false,
                onLogout: true,
                inventory: { ancien: null, wood: null, stone: null },
                nfts: [],
            },
            () => {
                clearInterval(this.timerRefreshAPIs);
                axios.post("/api/m1/auth/clearCookies");

                this.gameButton.current.click();
                window.location.reload();

                this.setState(stateDefault);
                this.getServerInfo();
            }
        );
    };
    onAccountSwitch = (walletAccount) => {
        this.getServerInfo();

        this.metamask.walletAccount = walletAccount;
        clearInterval(this.timerRefreshAPIs);

        this.setState(stateDefault);
    };
    walletSign = async (message = "ERROR") => {
        const signer = this.state.walletSigner;
        let signature = null;

        try {
            signature = await signer.signMessage(message);
        } catch (err) {
            // console.log('error: ', err)
        }

        return signature;
    };

    handleClickOnMap = (event) => {
        this.setState({
            modalComponentVisible: true,
        });
        this.setState({ gameShowComponent: event });
    };

    showRodsViewComponent(component, info) {
        this.setState({ gameShowComponent: component });
        this.setState({ rodViewInfo: info });
    }

    //LANDS OWNER
    async getLandOwner(idLandInstance) {
        if (!serverConfig?.features.lands.available) return false

        axios
            .post("/api/m1/land/getLandOwner", {
                address: this.metamask.walletAccount,
                idLandInstance: idLandInstance
            })
            .then((response) => {
                console.log('landOwner', response.data.data)
                response.data.success
                    ? this.setState({
                        modalComponentVisible: false,
                        landData: { ...response.data.data, info: 'owned', home: false },
                        gameShowRegion: 'land',
                        gameShowComponent: 'land'
                    })
                    : null;
            })
            .catch((error) => {
                error.response.status == 500 && this.setState({ onLogout: true });
                error.response.status == 401 && this.setState({ onLogout: true });
            });
    }
    async getAllLands() {
        if (!serverConfig?.features.lands.available) return false

        this.setState({
            ownedLandsData: {}
        })
        axios
            .post("/api/m1/land/getAllLands", {
                address: this.metamask.walletAccount,
            })
            .then((response) => {
                console.log('all lands,', response.data)
                response.data.success
                    ? this.setState({
                        ownedLandsData: { success: response.data.success, ...response.data.data },
                    })
                    : null;
            })
            .catch((error) => {
                error.response.status == 500 && this.setState({ onLogout: true });
                error.response.status == 401 && this.setState({ onLogout: true });
            });
    }


    // ************************* NavBar Logic *********************************

    //CLICKS IN GAME
    onGameClick = (e) => {
        if (e.target.classList.contains("myGame")) {
            this.setState({
                modalComponentVisible: false,
                gameShowComponent: this.state.gameShowRegion,
            });
        }
    };


    //UNIVERSE
    async getUniverse() {
        if (!serverConfig?.features.lands.available) return false

        this.setState({
            universeData: {}
        });
        axios
            .post("/api/m1/land/getUniverse", {
                address: this.metamask.walletAccount,
            })
            .then((response) => {
                console.log('getUniverse response', response.data)
                response.data.success
                    ? this.setState({
                        universeData: { worlds: response.data.data.worlds }
                    })
                    : null;
            })
            .catch((error) => {
                error.response.status == 500 && this.setState({ onLogout: true });
                error.response.status == 401 && this.setState({ onLogout: true });
            });
    }

    //SHOW COMPONENT
    showComponent(component) {
        if ((this.state.gameShowRegion != "city" || !this.state.cityData.home) && component == "city") {
            console.log("switch to Home City");
            this.setState(stateDefault, () => {
                this.setState(
                    { isLogged: true, idDelegate: null, delegationData: {} },
                    () => {
                        this.getData();
                    }
                );
            });
            // await this.getNFTs();
            /* this.setState({
              modalComponentVisible: false,
              cityData: { buildings: [], home: true },
              gameShowRegion: "city",
              gameShowComponent: "city",
            }); */
        } else if ((this.state.gameShowRegion != "land" || !this.state.landData.info.home) && component == "land") {
            console.log("switch to Home Land");
            this.setState({ onLoading: true });
            axios
                .post("/api/m1/land/getHomeLand", {
                    address: this.metamask.walletAccount
                })
                .then((response) => {
                    console.log('getHomeLand response', response.data)
                    response.data.success
                        ? this.setState({
                            onLoading: false,
                            modalComponentVisible: false,
                            landData: { cities: response.data.data.cities, info: response.data.data.info },
                            gameShowRegion: "land",
                            gameShowComponent: "land",
                        })
                        : null;
                })
                .catch((error) => {
                    error.response.status == 500 && this.setState({ onLogout: true });
                    error.response.status == 401 && this.setState({ onLogout: true });
                });
        } else if ((this.state.gameShowRegion != "world" || !this.state.worldData.info.home) && component == "world") {
            console.log("switch to Home World");
            this.setState({ onLoading: true });
            axios
                .post("/api/m1/land/getHomeWorld", {
                    address: this.metamask.walletAccount
                })
                .then((response) => {
                    console.log('getHomeWorld response', response.data)
                    response.data.success
                        ? this.setState({
                            onLoading: false,
                            modalComponentVisible: false,
                            worldData: { lands: response.data.data.lands, info: response.data.data.info },
                            gameShowRegion: "world",
                            gameShowComponent: "world",
                        })
                        : null;
                })
                .catch((error) => {
                    error.response.status == 500 && this.setState({ onLogout: true });
                    error.response.status == 401 && this.setState({ onLogout: true });
                });
        } else {
            if (component == 'city') {
                this.setState({
                    modalComponentVisible: false,
                    gameShowComponent: component,
                });
            } else {
                if (component == 'marketplace') {
                    this.marketplaceButton.current.click()
                }
                this.setState({
                    modalComponentVisible: true,
                });
                this.setState({ gameShowComponent: component });
            }
        }
        this.setState({ rodViewInfo: null });
    }

    async onVisitCity(cityInfo) {
        console.log('visit city', cityInfo)
        this.setState({ onLoading: true });
        axios
            .post("/api/m1/land/getCity", {
                address: this.metamask.walletAccount,
                idGuest: cityInfo.idGuest
            })
            .then((response) => {
                console.log('getCity response', response.data)
                if (response.data.success) {
                    if (response.data.data.info.home == 1) {
                        this.showComponent('city');
                    } else {
                        this.setState({
                            onLoading: false,
                            cityData: { buildings: response.data.data.buildings, info: response.data.data.info, home: false },
                            gameShowRegion: "city",
                            gameShowComponent: "city",
                        })
                    }
                }
            })
            .catch((error) => {
                error.response.status == 500 && this.setState({ onLogout: true });
                error.response.status == 401 && this.setState({ onLogout: true });
            });
    };
    async backToLand() {
        console.log('back land', this.state.landData.info);
        this.setState({ onLoading: true });
        axios
            .post("/api/m1/land/getLand", {
                address: this.metamask.walletAccount,
                idLandInstance: this.state.landData.info.id
            })
            .then((response) => {
                console.log('getLand response', response.data)

                response.data.success
                    ? this.setState({
                        onLoading: false,
                        landData: { cities: response.data.data.cities, info: response.data.data.info },
                        gameShowRegion: "land",
                        gameShowComponent: "land",
                    })
                    : null;
            })
            .catch((error) => {
                error.response.status == 500 && this.setState({ onLogout: true });
                error.response.status == 401 && this.setState({ onLogout: true });
            });
    }
    async onVisitLand(landInfo) {
        console.log('visit land', landInfo);
        this.setState({ onLoading: true });
        this.setState({ guestChecked: false });
        this.guestCheck();
        axios
            .post("/api/m1/land/getLand", {
                address: this.metamask.walletAccount,
                idLandInstance: landInfo.id
            })
            .then((response) => {
                console.log('getLand response', response.data)

                response.data.success
                    ? this.setState({
                        onLoading: false,
                        landData: { cities: response.data.data.cities, info: response.data.data.info },
                        gameShowRegion: "land",
                        gameShowComponent: "land",
                    })
                    : null;
            })
            .catch((error) => {
                error.response.status == 500 && this.setState({ onLogout: true });
                error.response.status == 401 && this.setState({ onLogout: true });
            });
    };
    async onVisitWorld(worldInfo) {
        console.log('visit world', worldInfo);
        this.setState({ onLoading: true });
        this.setState({ guestChecked: false });
        this.guestCheck();
        axios
            .post("/api/m1/land/getWorld", {
                address: this.metamask.walletAccount,
                idWorld: worldInfo.id
            })
            .then((response) => {
                console.log('getWorld response', response.data)
                response.data.success
                    ? this.setState({
                        onLoading: false,
                        modalComponentVisible: false,
                        worldData: { lands: response.data.data.lands, info: response.data.data.info },
                        gameShowRegion: "world",
                        gameShowComponent: "world",
                    })
                    : null;
            })
            .catch((error) => {
                error.response.status == 500 && this.setState({ onLogout: true });
                error.response.status == 401 && this.setState({ onLogout: true });
            });
    };



    // ************************* NavBar Logic *********************************

    // Prestige
    onPrestige(nftInfo) {
        this.setState({
            prestigeData: nftInfo
        })
        this.showComponent('prestige');
    }

    prestigeDone() {
        // this.showComponent('city');
        this.setState(stateDefault, () => {
            this.setState(
                { isLogged: true, idDelegate: null, delegationData: {} },
                () => {
                    this.getData();
                }
            );
        });
    }

    newNotification = (notification) => {
        this.setState({ notification: notification });
        // this.showComponent('notification')
    }

    render() {
        return (
            <div onClick={(e) => this.setState({ lastClick: e })}>

                <SoundEffect />

                <div style={{ display: "none" }}>
                    <Link to={"/game"}>
                        <IconButton className='gameBtn' ref={this.gameButton}>
                        </IconButton>
                    </Link>
                </div>
                <div style={{ display: "none" }}>
                    <Link to={"/marketplace" + (this.state.idDelegate == null ? '' : `?delegate=${this.state.idDelegate}`)}>
                        <IconButton className='gameBtn' ref={this.marketplaceButton}>
                        </IconButton>
                    </Link>
                </div>

                {!process.env.REACT_APP_ENV && (
                    <Login
                        forwardFromComponent={this.state.forwardFromComponent}
                        serverInfo={this.state.serverInfo}
                        callback_isLogged={this.isLogged}
                        reactIsLogged={this.state.isLogged}
                        logout={this.state.onLogout}
                        callback_onAccountSwitch={this.onAccountSwitch}
                        callback_Logout={this.setLogoutError401}

                        // Server Config
                        serverConfig={serverConfig}
                    />
                )}

                {this.state.isLogged &&
                    this.state.loadedInventory &&
                    this.state.loadedNFTs &&
                    this.state.guestChecked &&
                    this.state.loadedProfile ? (
                    <>
                        <A4TiBdskweqw0T
                            address={this.metamask.walletAccount}
                            idDelegate={this.state.idDelegate}
                            lastClick={this.state.lastClick}
                        />

                        <div className="sidebar">
                            <Inventory
                                inventory={this.state.inventory}
                                settings={this.state.settings}
                            />
                            <GameNav
                                // Fisherman NFT
                                hasFisherNFTStake={this.state.hasFisherNFTStake}

                                // selected Region-Page
                                selectedPage={this.state.gameShowComponent}
                                selectedRegion={this.state.gameShowRegion}

                                // Count of delegated cities
                                cities={this.state.cities.length}

                                // Has Land NFT
                                hasOwnLand={this.state.hasOwnLand}

                                // is LandGuest
                                hasHome={this.state.hasHome}

                                // Current Region Data - city, land, world
                                cityData={this.state.cityData}
                                landData={this.state.landData}
                                worldData={this.state.worldData}

                                // Server Config
                                serverConfig={serverConfig}

                                // delegation data
                                idDelegate={this.state.idDelegate}
                                delegationData={this.state.delegationData}

                                // for NavMobileBar
                                inventory={this.state.inventory}
                                alert={this.state.alert ? this.state.alert.length : 0}
                                settings={this.state.settings}

                                // callbacks
                                navbarCallback_showComponent={(event) => {
                                    this.showComponent(event);
                                }}
                                callback_Logout={this.setLogoutError401}
                            />
                        </div>

                        {this.state.gameShowRegion == "city" && this.state.cityData.home == 1 && (
                            <MapComponent
                                isVisible={true}
                                metamask={this.metamask}
                                ERCStaking={this.ERCStaking}
                                ERC721={this.ERC721}
                                buildingNfts={this.state.nfts}
                                builders={this.state.builders}
                                inventory={this.state.inventory}
                                cityData={this.state.cityData}
                                onClaimAll={this.state.onClaimAll}
                                announcement={this.state.announcement}
                                announcementShowCallback={(notification) => this.newNotification(notification)}
                                gameCallback_newClaimable={this.newClaimable}
                                gameCallback_handleClickOnMap={this.handleClickOnMap}
                                gameCallback_refreshBuilders={this.getBuilders}
                                gameCallback_newBuilders={this.newBuilders}
                                gameCallback_newInventory={this.newInventory}
                                gameCallback_newFisherman={(e) =>
                                    this.setState({ hasFisherNFTStake: e })
                                }
                                callback_Logout={this.setLogoutError401}
                                idDelegate={this.state.idDelegate}
                                delegationData={this.state.delegationData}
                                settings={this.state.settings}
                                callback_offDelegate={this.offDelegate}

                                callback_backToLand={this.backToLand}

                                onPrestige={this.onPrestige}

                                // Server Config
                                serverConfig={serverConfig}
                            />
                        )}

                        {this.state.gameShowRegion == "city" && this.state.cityData.home == 0 && (
                            <City
                                isVisible={true}
                                cityData={this.state.cityData}
                                callback_backToLand={this.backToLand}
                            />
                        )}

                        {this.state.gameShowRegion === "land" && (
                            <Land
                                ConfirmContext={ConfirmDialogs}
                                isVisible={true}
                                metamask={this.metamask}
                                ERCStaking={this.ERCStaking}
                                ERC721={this.ERC721}

                                landData={this.state.landData}
                                gameCallback_onVisitCity={this.onVisitCity}
                                callback_getLandOwner={this.getLandOwner}
                            />
                        )}
                        {this.state.gameShowRegion === "world" && (
                            <World
                                ConfirmContext={ConfirmDialogs}
                                isVisible={true}
                                metamask={this.metamask}
                                ERCStaking={this.ERCStaking}
                                ERC721={this.ERC721}

                                worldData={this.state.worldData}
                                gameCallback_onVisitLand={this.onVisitLand}
                            />
                        )}

                        <div
                            onClick={this.onGameClick}
                            className={
                                (!this.state.modalComponentVisible && !this.state.notification ? "notVisible" : "") +
                                " myGame"
                            }
                        >
                            {this.state.gameShowComponent === "bonus" && (
                                <Bonus
                                    ConfirmContext={ConfirmDialogs}
                                    metamask={this.metamask}
                                    callback_Logout={this.setLogoutError401}
                                />
                            )}

                            {this.state.gameShowComponent === "prestige" && (
                                <GamePrestige
                                    ConfirmContext={ConfirmDialogs}
                                    metamask={this.metamask}
                                    nftInfo={this.state.prestigeData}
                                    prestigeDone={this.prestigeDone}
                                    callback_Logout={this.setLogoutError401}
                                />
                            )}

                            {this.state.gameShowComponent === "all-ticket" && (
                                <AllTicket
                                    ConfirmContext={ConfirmDialogs}
                                    metamask={this.metamask}
                                    worldData={this.state.worldData}
                                    callback_onVisitWorld={this.onVisitWorld}
                                    callback_Logout={this.setLogoutError401}
                                />
                            )}
                            {this.state.gameShowComponent === "universe" && (
                                <GameUniverse
                                    ConfirmContext={ConfirmDialogs}
                                    metamask={this.metamask}

                                    universeData={this.state.universeData}
                                    callback_getUniverse={this.getUniverse}
                                    callback_onVisitWorld={this.onVisitWorld}
                                    callback_Logout={this.setLogoutError401}
                                />
                            )}
                            {this.state.gameShowComponent === "contract" && (
                                <GameContract
                                    ConfirmContext={ConfirmDialogs}
                                    metamask={this.metamask}
                                    ERCStaking={this.ERCStaking}
                                    ERC721={this.ERC721}
                                    landData={this.state.landData}
                                    callback_showTicketComponent={() => {
                                        this.setState({ gameShowComponent: 'ticket' });
                                    }}
                                    callback_Logout={this.setLogoutError401}
                                />
                            )}
                            {this.state.gameShowComponent === "land-info" && (
                                <LandInfo
                                    ConfirmContext={ConfirmDialogs}
                                    metamask={this.metamask}
                                    landData={this.state.landData}
                                    callback_setInventory={this.setInventory}
                                    callback_Logout={this.setLogoutError401}
                                />
                            )}

                            {this.state.gameShowComponent === "ticket-marketplace" && (
                                <TicketMarketplace
                                    ConfirmContext={ConfirmDialogs}
                                    metamask={this.metamask}
                                    landData={this.state.landData}
                                    callback_visitLand={this.onVisitLand}
                                    callback_Logout={this.setLogoutError401}
                                />
                            )}
                            {this.state.gameShowComponent === "ticket" && (
                                <GameTicket
                                    ConfirmContext={ConfirmDialogs}
                                    metamask={this.metamask}
                                    landData={this.state.landData}
                                    callback_Logout={this.setLogoutError401}
                                />
                            )}
                            {this.state.gameShowComponent === "lands-owner" && (
                                <LandsOwner
                                    ConfirmContext={ConfirmDialogs}
                                    metamask={this.metamask}
                                    ERCStaking={this.ERCStaking}
                                    ERC721={this.ERC721}
                                    ownedLandsData={this.state.ownedLandsData}
                                    callback_getAllLands={this.getAllLands}
                                    callback_onVisitLand={this.onVisitLand}
                                    callback_Logout={this.setLogoutError401}
                                />
                            )}

                            {this.state.gameShowComponent === "cities" && (
                                <GameCities
                                    ConfirmContext={ConfirmDialogs}
                                    metamask={this.metamask}
                                    cities={this.state.cities}
                                    callback_getDelegatedCities={this.getDelegatedCities}
                                    callback_onDelegate={this.onDelegate}
                                    callback_Logout={this.setLogoutError401}
                                />
                            )}

                            {this.state.gameShowComponent === "city" && this.state.notification && (
                                <Notification
                                    notification={this.state.notification}
                                    closeCallback={() => {
                                        this.setState({ notification: null })
                                        // this.showComponent('city')
                                    }}
                                />)}

                            <GameStorage
                                ConfirmContext={ConfirmDialogs}
                                isVisible={
                                    this.state.gameShowComponent == "inventory" ? true : false
                                }
                                metamask={this.metamask}
                                metamaskResources={this.state.metamaskResources}
                                ERC20={this.ERC20}
                                inventory={this.state.inventory}
                                alert={this.state.alert ? this.state.alert : 0}
                                vouchers={this.state.vouchers}
                                gameCallback_newInventory={this.newInventory}
                                callback_addVoucher={this.addVoucher}
                                callback_removeVoucher={this.removeVoucher}
                                callback_getBalance={this.getBalance}
                                callback_removeAlert={() => this.state.alert.length = 0}
                                callback_Logout={this.setLogoutError401}
                                idDelegate={this.state.idDelegate}
                                delegationData={this.state.delegationData}
                            />

                            {this.state.gameShowComponent == "marketplace" ? (
                                <GameMarketplace
                                    ConfirmContext={ConfirmDialogs}
                                    metamask={this.metamask}
                                    inventory={this.state.inventory}
                                    gameCallback_newInventory={this.newInventory}
                                    callback_Logout={this.setLogoutError401}
                                    idDelegate={this.state.idDelegate}
                                />
                            ) : null}

                            {/* {this.state.gameShowComponent == 'shop' 
                ? <GameShop 
                    ConfirmContext={ConfirmDialogs}
                    metamask={this.metamask}
                    inventory = {this.state.inventory}
                    gameCallback_newNFTS = {this.newNFTS}
                    gameCallback_newInventory = {this.newInventory}
                    callback_Logout = {this.setLogoutError401}

                    idDelegate={this.state.idDelegate}
                />
                : null
              } */}

                            {this.state.gameShowComponent == "fish" ? (
                                <GameFish
                                    ConfirmContext={ConfirmDialogs}
                                    metamask={this.metamask}
                                    inventory={this.state.inventory}
                                    gameCallback_newInventory={this.newInventory}
                                    callback_setInventory={this.setInventory}
                                    callback_Logout={this.setLogoutError401}
                                    navbarCallback_showComponent={(component, info) => {
                                        this.showRodsViewComponent(component, info);
                                    }}
                                    idDelegate={this.state.idDelegate}
                                    delegationData={this.state.delegationData}
                                />
                            ) : null}

                            {this.state.gameShowComponent == "craft" ? (
                                <GameCraft
                                    metamask={this.metamask}
                                    inventory={this.state.inventory}
                                    gameCallback_newInventory={this.newInventory}
                                    callback_Logout={this.setLogoutError401}
                                />
                            ) : null}

                            {this.state.gameShowComponent == "npc" ? (
                                <GameNPC
                                    ConfirmContext={ConfirmDialogs}
                                    metamask={this.metamask}
                                    callback_Logout={this.setLogoutError401}
                                    callback_setInventory={this.setInventory}
                                    idDelegate={this.state.idDelegate}
                                    delegationData={this.state.delegationData}
                                />
                            ) : null}

                            {this.state.gameShowComponent == "gem" ? (
                                <GameGem
                                    ConfirmContext={ConfirmDialogs}
                                    metamask={this.metamask}

                                    callback_Logout={this.setLogoutError401}
                                    callback_setInventory={this.setInventory}

                                    idDelegate={this.state.idDelegate}
                                    delegationData={this.state.delegationData}
                                />
                            ) : null}

                            {this.state.gameShowComponent == "craft-inventory" ? (
                                <GameCraftInventory
                                    ConfirmContext={ConfirmDialogs}
                                    metamask={this.metamask}
                                    rodViewInfo={this.state.rodViewInfo}
                                    callback_Logout={this.setLogoutError401}
                                    callback_setInventory={this.setInventory}
                                    idDelegate={this.state.idDelegate}
                                    delegationData={this.state.delegationData}
                                />
                            ) : null}

                            {this.state.gameShowComponent == "settings" ? (
                                <GameSetting
                                    metamask={this.metamask}
                                    inventory={this.state.inventory}
                                    settingData={this.state.settings}
                                    callback_newProfile={this.newProfile}
                                    callback_Logout={this.setLogoutError401}
                                    idDelegate={this.state.idDelegate}
                                />
                            ) : null}

                            {this.state.gameShowComponent == "leaderboard" ? (
                                <GameLeaderBoard
                                    metamask={this.metamask}
                                    inventory={this.state.inventory}
                                    settings={this.state.settings}
                                    gameCallback_newInventory={this.newInventory}
                                    callback_Logout={this.setLogoutError401}
                                />
                            ) : null}

                            {this.state.gameShowComponent == "city-panel" ? (
                                <GamePanel
                                    inventory={this.state.inventory}
                                    claimable={this.state.claimable}
                                    onClaimAll={this.state.onClaimAll}
                                    callback_claimAll={(event) =>
                                        this.setState({ onClaimAll: event }, () => {
                                            this.setState({ onClaimAll: !event });
                                        })
                                    }
                                    idDelegate={this.state.idDelegate}
                                    delegationData={this.state.delegationData}
                                />
                            ) : null}

                            {this.state.gameShowComponent == "city-temple" ? (
                                <GameLP
                                    ConfirmContext={ConfirmDialogs}
                                    metamask={this.metamask}
                                    idDelegate={this.state.idDelegate}
                                />
                            ) : null}

                        </div>
                    </>
                ) : null}

                {((this.state.isLogged && !this.state.isReady) || this.state.onLoading) ? (
                    <div className="game-on-loading">
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
                ) : null}
            </div>
        );
    }
}

export default Game;
