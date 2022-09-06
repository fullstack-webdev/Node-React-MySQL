//STYLES
import './gamenav.scss';

import React, { Component } from 'react';

import MenuItem from '@mui/material/MenuItem';
import { styled } from '@mui/material/styles';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';

//IMAGES
import iconCraftInventory
  from '../../assets-game/game-craft-inventory/iconCraftInventory.svg';
import iconFish from '../../assets-game/game-fish/iconFish.svg';
import iconCities from '../../assets-game/iconCities.svg';
import iconCity from '../../assets-game/iconCity.svg';
import iconContract from '../../assets-game/iconContract.svg';
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
import iconRecipe from '../../assets-game/iconRecipe.svg';
import iconSettings from '../../assets-game/iconSettings.svg';
import iconTicket from '../../assets-game/iconTicket.svg';
import iconTicketMarketplace from '../../assets-game/iconTicketMarketplace.png';
import iconUniverse from '../../assets-game/iconUniverse.svg';
import iconWorld from '../../assets-game/iconWorld.svg';
import menuBk from '../../assets-game/menu-map.svg';
import iconOpen from '../../assets/menu_white_24dp.svg';
import { playSound } from '../../utils/sounds';
//COMPONENTS
import GameNavMobile from './GameNavMobile';

const linkDiscord = "https://discord.gg/ancientsociety";

const HtmlTooltip = styled(({ className, ...props }) => (
    <Tooltip {...props} placement="right-start" classes={{ popper: className }} />
))(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
        backgroundColor: "transparent",
        width: "100%",
        margin: "0.5rem 0rem !important",
        padding: "0px",
    },
}));

class GameNav extends Component {
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
            delegationData: {}
        };
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

    onRegionMenuClick = (region) => {
        playSound("menuClick");
        this.setState(
            {
                selectedPage: region,
                selectedRegion: region,
            },
            () => this.props.navbarCallback_showComponent(region)
        );
    };

    render() {
        return (
            <>
                <img
                    src={iconOpen}
                    className="gamenav-icon-open"
                    onClick={() => {
                        playSound("mobileMenuOpen");
                        this.setState({ showMenu: true });
                    }}
                />

                <nav className="game-nav">
                    <img
                        src={menuBk}
                        className="nav-bk"
                        style={
                            this.state.idDelegate == null
                                ? (this.state.selectedRegion == "land" ? { filter: "hue-rotate(210deg)" } :
                                    this.state.selectedRegion == 'world' ? { opacity: "0.7", filter: "hue-rotate(210deg)" } : {})
                                : { filter: "hue-rotate(100deg)" }
                        }
                    />

                    {/* SERVER CONFIG -- LANDS AVAILABILITY */}
                    {this.state.serverConfig?.features.lands.available && this.state.idDelegate == null
                        // LANDS AVAILABLE 
                        ? <>
                            <img
                                src={iconUniverse}
                                className={"btn-nav" + (this.state.selectedPage == "universe" ? " active" : "")}
                                onClick={() => {
                                    playSound("menuClick");
                                    this.setState({ selectedPage: "universe" }, () =>
                                        this.props.navbarCallback_showComponent("universe")
                                    );
                                }}
                            />
                            {this.state.hasOwnLand && (
                                <img
                                    src={iconLandOwner}
                                    className={"btn-nav" + (this.state.selectedPage == "lands-owner" ? " active" : "")}
                                    onClick={() => {
                                        playSound("menuClick");
                                        this.setState({ selectedPage: "lands-owner" }, () =>
                                            this.props.navbarCallback_showComponent("lands-owner")
                                        );
                                    }}
                                />
                            )}
                            {this.state.hasHome ?
                                <HtmlTooltip
                                    id="regionNavMenu"
                                    className={/* (!this.state.hasHome ? 'disabled' : '') +  */(this.state.selectedRegion == "world" || this.state.selectedRegion == "land" ? " land" : "")}
                                    title={
                                        <>
                                            <MenuItem onClick={() => /* this.state.hasHome &&  */this.onRegionMenuClick("land")}>
                                                <img
                                                    className={
                                                        "regionNavImg" +
                                                        (this.state.selectedRegion == "land" && this.state.landData.home ? " selected" : "")
                                                    }
                                                    src={iconLand}
                                                ></img>
                                                <span
                                                    className={
                                                        "regionNavLab" +
                                                        (this.state.selectedRegion == "land" && this.state.landData.home ? " selected" : "")
                                                    }
                                                >
                                                    Land
                                                </span>
                                            </MenuItem>
                                            <MenuItem onClick={() => /* this.state.hasHome &&  */this.onRegionMenuClick("world")}>
                                                <img
                                                    className={
                                                        "regionNavImg" +
                                                        (this.state.selectedRegion == "world" && this.state.worldData.home ? " selected" : "")
                                                    }
                                                    src={iconWorld}
                                                ></img>
                                                <span
                                                    className={
                                                        "regionNavLab" +
                                                        (this.state.selectedRegion == "world" && this.state.worldData.home ? " selected" : "")
                                                    }
                                                >
                                                    World
                                                </span>
                                            </MenuItem>
                                        </>
                                    }
                                >
                                    <img
                                        src={iconCity}
                                        className="btn-nav" //{(this.state.selectedRegion == 'city' && this.state.cityData.home) ? 'btn-nav active' : 'btn-nav'}
                                        onClick={() => {
                                            this.onRegionMenuClick("city");
                                        }}
                                    />
                                </HtmlTooltip> :
                                <img
                                    src={iconCity}
                                    className="btn-nav"
                                    onClick={() => {
                                        this.onRegionMenuClick("city");
                                    }} />}
                        </>

                        // LANDS NOT AVAILABLE 
                        : <img
                            src={iconCity}
                            className="btn-nav"
                            onClick={() => {
                                this.onRegionMenuClick("city");
                            }} />
                    }

                    {/* HOME CITY MENU */}

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
                                            this.setState({ selectedPage: "cities" }, () =>
                                                this.props.navbarCallback_showComponent("cities")
                                            );
                                        }}
                                    />
                                ) : null}

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
                                        this.setState({ selectedPage: "inventory" }, () =>
                                            this.props.navbarCallback_showComponent("inventory")
                                        );
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
                                        this.setState({ selectedPage: "marketplace" }, () =>
                                            this.props.navbarCallback_showComponent("marketplace")
                                        );
                                        // this.marketplacebutton.current.click()
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
                                            this.setState({ selectedPage: "fish" }, () =>
                                                this.props.navbarCallback_showComponent("fish")
                                            );
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

                            {/* {(this.state.serverConfig?.features.fishing || this.state.serverConfig?.features.miner) ? <HtmlTooltip
                                id="handMenu"
                                className={this.state.idDelegate != null ? "delegate" : ""}
                                title={
                                    <>
                                        <MenuItem
                                            onClick={() => {
                                                playSound("menuClick");
                                                this.setState({ selectedPage: "fish" }, () =>
                                                    this.props.navbarCallback_showComponent("fish")
                                                );
                                            }}
                                            className={!this.state.serverConfig?.features.fishing ? "disabled" : ""}
                                        >
                                            <img
                                                className={"regionNavImg" + (this.state.selectedPage == "fish" ? " selected" : "") + (!this.state.hasFisherNFTStake ||
                                                    (this.state.idDelegate != null &&
                                                        !this.state.delegationData.fisherman)
                                                    ? " disabled"
                                                    : this.state.selectedPage == "fish"
                                                        ? " active"
                                                        : "") +
                                                (this.state.idDelegate != null ? " delegate" : "")}
                                                src={iconFish}
                                            ></img>
                                            <span
                                                className={"regionNavLab" + (this.state.selectedPage == "fish" ? " selected" : "")}
                                            >
                                                Fishing
                                            </span>
                                        </MenuItem>
                                        <MenuItem
                                            onClick={() => {
                                                playSound("menuClick");
                                                this.setState({ selectedPage: "gem" }, () =>
                                                    this.props.navbarCallback_showComponent("gem")
                                                );
                                            }}
                                            className={!this.state.serverConfig?.features.gem.available ? "disabled" : ""}
                                        >
                                            <img
                                                className={"regionNavImg" + (this.state.selectedPage == "gem" ? " selected" : "") + (!this.state.serverConfig?.features.gem.available ? " disabled" : "")}
                                                src={iconMiner}
                                            ></img>
                                            <span
                                                className={"regionNavLab" + (this.state.selectedPage == "gem" ? " selected" : "") + (!this.state.serverConfig?.features.gem.available ? " disabled" : "")}
                                            >
                                                Miner
                                            </span>
                                        </MenuItem>
                                    </>
                                }
                            >
                                <div className="btn-nav">
                                    <img
                                        src={iconHand}
                                        className={
                                            "btn-nav" +
                                            ((this.state.idDelegate != null &&
                                                !this.state.delegationData.inventory)
                                                ? " disabled"
                                                : "") +
                                            (this.state.idDelegate != null ? " delegate" : "")
                                        }
                                    />
                                    {this.state.idDelegate != null &&
                                        !this.state.delegationData.inventory && (
                                            <img
                                                src={iconLock}
                                                className="nav-lock nav-lock-delegation"
                                            ></img>
                                        )}
                                </div>
                            </HtmlTooltip> : null} */}

                            {(this.state.serverConfig?.features.npc || this.state.serverConfig?.features.gem.available) ? <HtmlTooltip
                                id="inventoryMenu"
                                className={this.state.idDelegate != null ? "delegate" : ""}
                                title={
                                    <>
                                        <MenuItem
                                            onClick={() => {
                                                playSound("menuClick");
                                                this.setState({ selectedPage: "npc" }, () =>
                                                    this.props.navbarCallback_showComponent("npc")
                                                );
                                            }}
                                            className={!this.state.serverConfig?.features.npc ? "disabled" : ""}
                                        >
                                            <img
                                                className={"regionNavImg" + (this.state.selectedPage == "npc" ? " selected" : "")}
                                                src={iconNPC}
                                            ></img>
                                            <span
                                                className={"regionNavLab" + (this.state.selectedPage == "npc" ? " selected" : "")}
                                            >
                                                NPC
                                            </span>
                                        </MenuItem>
                                        <MenuItem
                                            onClick={() => {
                                                playSound("menuClick");
                                                this.setState({ selectedPage: "gem" }, () =>
                                                    this.props.navbarCallback_showComponent("gem")
                                                );
                                            }}
                                            className={!this.state.serverConfig?.features.gem.available ? "disabled" : ""}
                                        >
                                            <img
                                                className={"regionNavImg" + (this.state.selectedPage == "gem" ? " selected" : "") + (!this.state.serverConfig?.features.gem.available ? " disabled" : "")}
                                                src={iconGem}
                                            ></img>
                                            <span
                                                className={"regionNavLab" + (this.state.selectedPage == "gem" ? " selected" : "") + (!this.state.serverConfig?.features.gem.available ? " disabled" : "")}
                                            >
                                                Gem
                                            </span>
                                        </MenuItem>
                                    </>
                                }
                            >
                                <div className="btn-nav">
                                    <img
                                        src={iconRecipe}
                                        className={
                                            "btn-nav" +
                                            ((this.state.idDelegate != null &&
                                                !this.state.delegationData.inventory)
                                                ? " disabled"
                                                : "") +
                                            (this.state.idDelegate != null ? " delegate" : "")
                                        }
                                    />
                                    {this.state.idDelegate != null &&
                                        !this.state.delegationData.inventory && (
                                            <img
                                                src={iconLock}
                                                className="nav-lock nav-lock-delegation"
                                            ></img>
                                        )}
                                </div>
                            </HtmlTooltip> : null}

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
                                        this.setState({ selectedPage: "craft-inventory" }, () =>
                                            this.props.navbarCallback_showComponent("craft-inventory")
                                        );
                                    }}
                                />
                            </div>
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
                                        this.setState({ selectedPage: "leaderboard" }, () =>
                                            this.props.navbarCallback_showComponent("leaderboard")
                                        );
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
                                        this.setState({ selectedPage: "settings" }, () =>
                                            this.props.navbarCallback_showComponent("settings")
                                        );
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
                                    this.setState({ selectedPage: "ticket-marketplace" }, () =>
                                        this.props.navbarCallback_showComponent("ticket-marketplace")
                                    );
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
                                    this.setState({ selectedPage: "contract" }, () =>
                                        this.props.navbarCallback_showComponent("contract")
                                    );
                                }}
                            />
                            <img
                                src={iconTicket}
                                className={
                                    "btn-nav" + (this.state.selectedPage == 'ticket' ? " active" : "")
                                }
                                onClick={() => {
                                    playSound("menuClick");
                                    this.setState({ selectedPage: "ticket" }, () =>
                                        this.props.navbarCallback_showComponent("ticket")
                                    );
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
                                    this.setState({ selectedPage: "land-info" }, () =>
                                        this.props.navbarCallback_showComponent("land-info")
                                    );
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
                                    this.setState({ selectedPage: "all-ticket" }, () =>
                                        this.props.navbarCallback_showComponent("all-ticket")
                                    );
                                }}
                            />
                        </>
                    ) : null}

                    {/* LOGOUT */}
                    {this.state.idDelegate == null && this.state.selectedRegion == 'city' && (
                        <img
                            src={iconLogout}
                            className={
                                "btn-nav"
                            }
                            onClick={() => {
                                playSound("menuLogout");
                                this.props.callback_Logout();
                            }}
                        />
                    )}
                </nav>

                <GameNavMobile
                    serverConfig={this.state.serverConfig}
                    hasFisherNFTStake={this.state.hasFisherNFTStake}
                    selectedPage={this.state.selectedPage}
                    selectedRegion={this.state.selectedRegion}
                    cityData={this.state.cityData}
                    cities={this.state.cities}
                    landData={this.state.landData}
                    worldData={this.state.worldData}
                    showMenu={this.state.showMenu}
                    inventory={this.state.inventory}
                    alert={this.state.alert}
                    hasHome={this.state.hasHome}
                    hasOwnLand={this.state.hasOwnLand}
                    settings={this.state.settings}
                    navbarCallback_showComponent={this.props.navbarCallback_showComponent}
                    callback_Logout={() => this.props.callback_Logout()}
                    callback_Close={() => {
                        playSound("mobileMenuClose");
                        this.setState({ showMenu: false });
                    }}
                    idDelegate={this.state.idDelegate}
                    delegationData={this.state.delegationData}
                />
            </>
        );
    }
}

export default GameNav;