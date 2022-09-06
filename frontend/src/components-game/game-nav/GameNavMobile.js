//STYLES
import './gamenavmobile.scss';

import React, { Component } from 'react';

import iconCraftInventory
  from '../../assets-game/game-craft-inventory/iconCraftInventory.svg';
import iconFish from '../../assets-game/game-fish/iconFish.svg';
import iconCities from '../../assets-game/iconCities.svg';
import iconCity from '../../assets-game/iconCity.svg';
import iconContract from '../../assets-game/iconContract.svg';
//IMAGES
import iconGem from '../../assets-game/iconGem.png';
import iconInventory from '../../assets-game/iconInventory.svg';
import iconLand from '../../assets-game/iconLand.svg';
import iconLandInfo from '../../assets-game/iconLandInfo.svg';
import iconLandOwner from '../../assets-game/iconLandOwner.png';
import iconLeaderboard from '../../assets-game/iconLeaderboard.svg';
import iconLock from '../../assets-game/iconLock.svg';
import iconLogout from '../../assets-game/iconLogout.jpg';
import iconMarket from '../../assets-game/iconMarket.svg';
import iconNPC from '../../assets-game/iconNPC.png';
import iconSettings from '../../assets-game/iconSettings.svg';
import iconTicket from '../../assets-game/iconTicket.svg';
import iconTicketMarketplace from '../../assets-game/iconTicketMarketplace.png';
import iconUniverse from '../../assets-game/iconUniverse.svg';
import iconWorld from '../../assets-game/iconWorld.svg';
import iconClose from '../../assets/close_white_24dp.svg';
import { playSound } from '../../utils/sounds';
//COMPONENTS
import Inventory from '../inventory/Inventory';

class NavbarMobile extends Component {

    constructor(props) {
        super(props);

        this.state = {
            serverConfig: props.serverConfig,

            showMenu: false,
            selectedPage: "city",
            selectedRegion: "city",

            inventory: props.inventory,
            alert: props.alert,

            cityData: {},
            landData: {},
            worldData: {},

            hasHome: false,
            hasOwnLand: false,
            cities: 0,
            hasFisherNFTStake: props.hasFisherNFTStake,

            settings: props.settings,

            idDelegate: null,
            delegationData: {},

            popupText: false,
            popupHeadline: false,
        };
    }

    componentDidMount() {
        document.body.style.overflow = 'hidden'
    }
    componentWillUnmount() {
        document.body.style.overflow = 'unset'
    }
    componentDidUpdate() {
        // Server Config
        if (this.state.serverConfig != this.props.serverConfig) {
            this.setState({ serverConfig: this.props.serverConfig });
        }

        // current Region Data - city, land, world
        if (this.state.cityData != this.props.cityData) {
            this.setState({ cityData: this.props.cityData });
        }
        if (this.state.landData != this.props.landData) {
            this.setState({ landData: this.props.landData });
        }
        if (this.state.worldData != this.props.worldData) {
            this.setState({ worldData: this.props.worldData });
        }

        // selected Region and Page
        if (this.state.selectedPage != this.props.selectedPage) {
            this.setState({ selectedPage: this.props.selectedPage });
        }
        if (this.state.selectedRegion != this.props.selectedRegion) {
            this.setState({ selectedRegion: this.props.selectedRegion });
        }

        // delegation Data
        if (this.state.idDelegate != this.props.idDelegate) {
            this.setState({ idDelegate: this.props.idDelegate });
        }
        if (this.state.delegationData != this.props.delegationData) {
            this.setState({ delegationData: this.props.delegationData });
        }

        // If the user has delegated cities
        if (this.state.cities != this.props.cities) {
            this.setState({ cities: this.props.cities });
        }

        // If the User has Land NFTs (land owner!)
        if (this.state.hasOwnLand != this.props.hasOwnLand) {
            this.setState({ hasOwnLand: this.props.hasOwnLand });
        }

        // If the User has Land NFTs (land owner!)
        if (this.state.hasHome != this.props.hasHome) {
            this.setState({ hasHome: this.props.hasHome });
        }

        // If the user has Fisherman NFT
        if (this.state.hasFisherNFTStake != this.props.hasFisherNFTStake) {
            this.setState({ hasFisherNFTStake: this.props.hasFisherNFTStake });
        }

        // profile - inventory
        if (this.state.settings != this.props.settings) {
            this.setState({ settings: this.props.settings });
        }
        if (this.state.inventory != this.props.inventory) {
            this.setState({ inventory: this.props.inventory });
        }
        if (this.state.alert != this.props.alert) {
            this.setState({ alert: this.props.alert });
        }
    }
    setShowMenu_Close = () => {
        this.props.callback_Close(false);
    }

    render() {

        return (
            <div
                className={this.props.showMenu ? 'gamenavmobile' : 'gamenavmobile notVisible'}
                style={this.state.idDelegate == null ? {} : { backgroundColor: "rgb(0 40 0)" }}
            >

                <div className='navbar-head'>
                    <h2 className=''>{this.state.settings.cityName}</h2>
                    <img src={iconClose} onClick={() => this.setShowMenu_Close()} className="menu-icon-close" />
                </div>

                <div className='navbar-inventory'>
                    <Inventory inventory={this.props.inventory} settings={this.state.settings} />
                </div>

                <div className='navbar-body'>

                    <div className='nav-main'>
                        {/* SERVER CONFIG -- LANDS AVAILABILITY */}
                        {this.state.serverConfig?.features.lands.available && this.state.idDelegate == null
                            // LANDS AVAILABLE 
                            ? <>
                                <img
                                    src={iconUniverse}
                                    className={"btn-nav" + (this.state.selectedPage == "universe" ? " active" : "")}
                                    onClick={() => {
                                        playSound("menuClick");
                                        this.props.navbarCallback_showComponent('universe');
                                        this.setShowMenu_Close();
                                    }}
                                />
                                {this.state.hasOwnLand && (
                                    <img
                                        src={iconLandOwner}
                                        className={"btn-nav" + (this.state.selectedPage == "lands-owner" ? " active" : "")}
                                        onClick={() => {
                                            playSound("menuClick");
                                            this.props.navbarCallback_showComponent('lands-owner');
                                            this.setShowMenu_Close();
                                        }}
                                    />
                                )}
                                <img
                                    src={iconCity}
                                    className={'btn-nav'/*  + (this.state.selectedPage == 'city' ? ' active' : '') *//*  + (this.state.idDelegate != null ? ' delegate' : '') */}
                                    onClick={() => {
                                        playSound('menuClick')
                                        this.props.navbarCallback_showComponent('city');
                                        this.setShowMenu_Close();
                                    }}
                                />
                                {this.state.hasHome && <>
                                    <img
                                        src={iconLand}
                                        className={this.state.selectedPage == 'land' ? 'btn-nav active' : 'btn-nav'}
                                        onClick={() => {
                                            playSound('menuItemOnClick');
                                            this.props.navbarCallback_showComponent('land');
                                            this.setShowMenu_Close();
                                        }}
                                    />
                                    <img
                                        src={iconWorld}
                                        className={this.state.selectedPage == 'world' ? 'btn-nav active' : 'btn-nav'}
                                        onClick={() => {
                                            playSound('menuItemOnClick');
                                            this.props.navbarCallback_showComponent('world');
                                            this.setShowMenu_Close();
                                        }}
                                    />
                                </>}
                            </>

                            // LANDS NOT AVAILABLE 
                            :
                            <img
                                src={iconCity}
                                className={'btn-nav'/*  + (this.state.selectedPage == 'city' ? ' active' : '') *//*  + (this.state.idDelegate != null ? ' delegate' : '') */}
                                onClick={() => {
                                    playSound('menuClick')
                                    this.props.navbarCallback_showComponent('city');
                                    this.setShowMenu_Close();
                                }}
                            />
                        }
                    </div>

                    <div className='nav-more'>
                        {this.state.selectedRegion == "city" && this.state.cityData.home ? (
                            <>
                                <div className="btn-nav">
                                    <img
                                        src={iconInventory}
                                        className={
                                            "btn-nav" +
                                            ((this.state.idDelegate != null &&
                                                !this.state.delegationData.transfer && !this.state.delegationData.marketplace)
                                                ? " disabled"
                                                : this.state.selectedPage == "inventory"
                                                    ? " active"
                                                    : "") +
                                            (this.state.idDelegate != null ? " delegate" : "")
                                        }
                                        onClick={() => {
                                            playSound("menuClick");
                                            this.props.navbarCallback_showComponent('inventory')
                                            this.setShowMenu_Close()
                                        }}
                                    />
                                    {this.state.idDelegate != null &&
                                        !this.state.delegationData.transfer && !this.state.delegationData.marketplace && (
                                            <img
                                                src={iconLock}
                                                className="nav-lock nav-lock-delegation"
                                            ></img>
                                        )}
                                    {(this.state.alert != 0 && this.state.idDelegate == null) && <div className='alert'>{this.state.alert}</div>}
                                </div>
                                <div className="btn-nav">
                                    <img
                                        src={iconMarket}
                                        className={
                                            "btn-nav" +
                                            ((this.state.idDelegate != null &&
                                                !this.state.delegationData.marketplace)
                                                ? " disabled"
                                                : this.state.selectedPage == "marketplace"
                                                    ? " active"
                                                    : "") +
                                            (this.state.idDelegate != null ? " delegate" : "")
                                        }
                                        onClick={() => {
                                            playSound("menuClick");
                                            this.props.navbarCallback_showComponent('marketplace')
                                            this.setShowMenu_Close()
                                        }}
                                    />
                                    {this.state.idDelegate != null &&
                                        !this.state.delegationData.marketplace && (
                                            <img
                                                src={iconLock}
                                                className="nav-lock nav-lock-delegation"
                                            ></img>
                                        )}
                                </div>

                                {/* SERVER CONFIG -- FISHING AVAILABILITY */}
                                {this.state.serverConfig?.features.fishing
                                    ? <div className="btn-nav">
                                        <img
                                            src={iconFish}
                                            className={
                                                "btn-nav" +
                                                (!this.state.hasFisherNFTStake ||
                                                    (this.state.idDelegate != null &&
                                                        !this.state.delegationData.fisherman)
                                                    ? " disabled"
                                                    : this.state.selectedPage == "fish"
                                                        ? " active"
                                                        : "") +
                                                (this.state.idDelegate != null ? " delegate" : "")
                                            }
                                            onClick={() => {
                                                playSound("menuClick");
                                                this.props.navbarCallback_showComponent('fish')
                                                this.setShowMenu_Close()
                                            }}
                                        />
                                        {((this.state.idDelegate != null &&
                                            !this.state.delegationData.fisherman) ||
                                            !this.state.hasFisherNFTStake) && (
                                                <img
                                                    src={iconLock}
                                                    className={"nav-lock" + ((this.state.idDelegate != null &&
                                                        !this.state.delegationData.fisherman) ? " nav-lock-delegation" : "")}
                                                ></img>
                                            )}
                                    </div>
                                    : null}

                                {this.state.serverConfig?.features.npc ?
                                    <div className="btn-nav">
                                        <img
                                            src={iconNPC}
                                            className={
                                                "btn-nav" +
                                                ((this.state.idDelegate != null &&
                                                    !this.state.delegationData.inventory)
                                                    ? " disabled"
                                                    : this.state.selectedPage == "npc"
                                                        ? " active"
                                                        : "") +
                                                (this.state.idDelegate != null ? " delegate" : "")
                                            }
                                            onClick={() => {
                                                playSound("menuClick");
                                                this.props.navbarCallback_showComponent('npc')
                                                this.setShowMenu_Close()
                                            }}
                                        />
                                        {this.state.idDelegate != null &&
                                            !this.state.delegationData.inventory && (
                                                <img
                                                    src={iconLock}
                                                    className="nav-lock nav-lock-delegation"
                                                ></img>
                                            )}
                                    </div> : null}

                                {this.state.serverConfig?.features.gem.available ?
                                    <div className="btn-nav">
                                        <img
                                            src={iconGem}
                                            className={
                                                "btn-nav" +
                                                ((this.state.idDelegate != null &&
                                                    !this.state.delegationData.inventory)
                                                    ? " disabled"
                                                    : this.state.selectedPage == "gem"
                                                        ? " active"
                                                        : "") +
                                                (this.state.idDelegate != null ? " delegate" : "")
                                            }
                                            onClick={() => {
                                                playSound("menuClick");
                                                this.props.navbarCallback_showComponent('gem')
                                                this.setShowMenu_Close()
                                            }}
                                        />
                                        {this.state.idDelegate != null &&
                                            !this.state.delegationData.inventory && (
                                                <img
                                                    src={iconLock}
                                                    className="nav-lock nav-lock-delegation"
                                                ></img>
                                            )}
                                    </div> : null}

                                <div className="btn-nav">
                                    <img
                                        src={iconCraftInventory}
                                        className={
                                            "btn-nav" +
                                            (this.state.selectedPage == "craft-inventory"
                                                ? " active"
                                                : "") +
                                            (this.state.idDelegate != null ? " delegate" : "")
                                        }
                                        onClick={() => {
                                            playSound("menuClick");
                                            this.props.navbarCallback_showComponent('craft-inventory')
                                            this.setShowMenu_Close()
                                        }}
                                    />
                                </div>
                            </>
                        ) : null}

                        {/* OTHER-LAND MENU */}
                        {this.state.selectedRegion == "land" && this.state.landData.info && !this.state.landData.info.owned ? (
                            <>
                                <img
                                    src={iconTicketMarketplace}
                                    className={
                                        "btn-nav" + (this.state.selectedPage == 'ticket-marketplace' ? " active" : "")
                                    }
                                    onClick={() => {
                                        playSound("menuClick");
                                        this.props.navbarCallback_showComponent('ticket-marketplace')
                                        this.setShowMenu_Close()
                                    }}
                                />
                            </>
                        ) : null}
                        {/* MY-LAND MENU */}
                        {this.state.selectedRegion == "land" && this.state.landData.info && this.state.landData.info.owned ? (
                            <>
                                <img
                                    src={iconContract}
                                    className={
                                        "btn-nav" + (this.state.selectedPage == 'contract' ? " active" : "")
                                    }
                                    onClick={() => {
                                        playSound("menuClick");
                                        this.props.navbarCallback_showComponent('contract')
                                        this.setShowMenu_Close()
                                    }}
                                />
                                <img
                                    src={iconTicket}
                                    className={
                                        "btn-nav" + (this.state.selectedPage == 'ticket' ? " active" : "")
                                    }
                                    onClick={() => {
                                        playSound("menuClick");
                                        this.props.navbarCallback_showComponent('ticket')
                                        this.setShowMenu_Close()
                                    }}
                                />
                            </>
                        ) : null}

                        {this.state.selectedRegion == "land" ? (
                            <>
                                <img
                                    src={iconLandInfo}
                                    className={
                                        "btn-nav" + (this.state.selectedPage == 'land-info' ? " active" : "")
                                    }
                                    onClick={() => {
                                        playSound("menuClick");
                                        this.props.navbarCallback_showComponent('land-info')
                                        this.setShowMenu_Close()
                                    }}
                                />
                            </>
                        ) : null}

                        {/* HOME WORLD MENU */}
                        {this.state.selectedRegion == "world" && this.state.worldData.info && this.state.worldData.info.home ? (
                            <></>
                        ) : null}

                        {this.state.selectedRegion == "world" ? (
                            <>
                                <img
                                    src={iconTicket}
                                    className={
                                        "btn-nav" + (this.state.selectedPage == 'all-ticket' ? " active" : "")
                                    }
                                    onClick={() => {
                                        playSound("menuClick");
                                        this.props.navbarCallback_showComponent('all-ticket')
                                        this.setShowMenu_Close()
                                    }}
                                />
                            </>
                        ) : null}
                    </div>

                    <div className='nav-utils'>
                        {this.state.selectedRegion == "city" && this.state.cityData.home ? (
                            <>
                                {/* SERVER CONFIG -- DELEGATION AVAILABILITY */}
                                {this.state.serverConfig?.features.delegation
                                    ? this.state.cities != 0 && (
                                        <img
                                            src={iconCities}
                                            className={
                                                "btn-nav" +
                                                (this.state.selectedPage == "cities" ? " active" : "") +
                                                (this.state.idDelegate != null ? " delegate" : "")
                                            }
                                            onClick={() => {
                                                playSound("menuClick");
                                                this.props.navbarCallback_showComponent('cities')
                                                this.setShowMenu_Close()
                                            }}
                                        />
                                    ) : null}

                                {this.state.idDelegate == null && (
                                    <img
                                        src={iconLeaderboard}
                                        className={
                                            "btn-nav" +
                                            (this.state.selectedPage == "leaderboard"
                                                ? " active"
                                                : "")
                                        }
                                        onClick={() => {
                                            playSound("menuClick");
                                            this.props.navbarCallback_showComponent('leaderboard');
                                            this.setShowMenu_Close();
                                        }}
                                    />
                                )}
                                <div className="btn-nav">
                                    <img
                                        src={iconSettings}
                                        className={
                                            "btn-nav" +
                                            ((this.state.idDelegate != null &&
                                                !this.state.delegationData.profile)
                                                ? " disabled"
                                                : this.state.selectedPage == "settings"
                                                    ? " active"
                                                    : "") +
                                            (this.state.idDelegate != null ? " delegate" : "")
                                        }
                                        onClick={() => {
                                            playSound("menuClick");
                                            this.props.navbarCallback_showComponent('settings');
                                            this.setShowMenu_Close();
                                        }}
                                    />
                                    {this.state.idDelegate != null &&
                                        !this.state.delegationData.profile && (
                                            <img
                                                src={iconLock}
                                                className="nav-lock nav-lock-delegation"
                                            ></img>
                                        )}
                                </div>
                            </>
                        ) : null}

                        {/* LOGOUT */}
                        {this.state.idDelegate == null && (
                            <img
                                src={iconLogout}
                                className={
                                    "btn-nav"
                                }
                                onClick={() => {
                                    playSound("logout");
                                    this.props.callback_Logout();
                                }}
                            />
                        )}
                    </div>

                </div>

            </div>
        )

    }
}

export default NavbarMobile