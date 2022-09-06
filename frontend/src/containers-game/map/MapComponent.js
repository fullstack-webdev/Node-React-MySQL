import './MapComponent.scss';
import 'react-toastify/dist/ReactToastify.css';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import axios from 'axios';
import { ethers } from 'ethers';
import { Link } from 'react-router-dom';
import {
  toast,
  ToastContainer,
} from 'react-toastify';
//Dialog Staking Style
import styled from 'styled-components';

import GroupsIcon from '@mui/icons-material/Groups';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import ReplayIcon from '@mui/icons-material/Replay';
import {
  Avatar,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from '@mui/material';

import { NFT } from '../../components-game/';
import { serverConfig } from '../../config/serverConfig';
import { playSound } from '../../utils/sounds';

// test code
const assets = require.context('./assets', true)

// initial infos
const g_mapImageURL = `./${serverConfig?.map?.image}`
const g_mapSize = { width: 1920, height: 1080 }
const g_flagSize = { width: 64, height: 117 }
const g_flagPos = { x: 1100, y: 300 }
const g_templeSize = { width: 85, height: 86 }
const g_templePos = { x: 1370, y: 100 }
const g_bonusSize = { width: 85, height: 86 }
const g_bonusPos = { x: 400, y: 900 }
const g_defaultMapZoom = 1
const g_mapMaxZoom = 1.8
const g_mapMinZoom = 1.0
const g_mapZoomUnit = 0.05

const g_buildingType = ['', 'townhall', 'lumberjack', 'stonemine', 'fisherman']
const g_buildingPlace = [
    {},
    {
        position: 1,
        x: 505,
        y: 145,
        type: 'building'
    },
    {
        position: 2,
        x: 495,
        y: 450,
        type: 'building'
    },
    {
        position: 3,
        x: 260,
        y: 590,
        type: 'building'
    },
    {
        position: 4,
        x: 1065,
        y: 85,
        type: 'building'
    },
    {
        position: 5,
        x: 1240,
        y: 195,
        type: 'building'
    },
    {
        position: 6,
        x: 1535,
        y: 475,
        type: 'building'
    },
    {
        position: 7,
        x: 1200,
        y: 660,
        type: 'sand'
    },
    {
        position: 8,
        x: 850,
        y: 515,
        type: 'sand'
    }
]

const DialogStaking = styled(Dialog)`
    & > .MuiDialog-container > .MuiPaper-root {
        background-color: white !important;
        height: 50%;
    }
    & > .MuiDialog-container > .MuiPaper-root > .MuiDialogTitle-root {
        font: bold 1.2rem Cinzel; 
        color: #882B21;
    }
    & > .MuiDialog-container > .MuiPaper-root > .MuiDialogContent-root{

        padding: 0;
    }
    & > .MuiDialog-container > .MuiPaper-root > .MuiDialogContent-root > .MuiListItem-root {
        border-bottom: 1px solid white !important;
        padding: 1rem;
    }
    & > .MuiDialog-container > .MuiPaper-root > .MuiDialogContent-root > .MuiListItem-root.notStakable {
        background-color: #882B21 ;
        cursor: not-allowed;
    }
    & > .MuiDialog-container > .MuiPaper-root > .MuiDialogContent-root > .MuiListItem-root.notStakable {
        background-color: #882B21 ;
    }
    & > .MuiDialog-container > .MuiPaper-root > .MuiDialogContent-root > .MuiListItem-root.isStakable {
        background-color: #295F90 ;
    }
    & > .MuiDialog-container > .MuiPaper-root > .MuiDialogContent-root > .MuiListItem-root.isStakable {
        &:hover {
            background-color: rgba(41, 95, 144, 0.8) !important; 
        }
    }
    & > .MuiDialog-container > .MuiPaper-root > .MuiDialogContent-root > .MuiListItem-root > .MuiListItemText-root > .MuiTypography-root{
        font: normal 1.4rem Raleway; 
        color: black !important;
    }
    & > .MuiDialog-container > .MuiPaper-root > .MuiDialogContent-root > .MuiListItem-root > .MuiListItemAvatar-root > .MuiAvatar-root > .buildingAvatar{
        width: 100%;
        height: 100%;
    }
`;

const birdsCount = 20
const birdsInit = []
for (var i = 0; i < birdsCount; ++i) {
    birdsInit.push({
        valid: false,
        xPos: 0,
        yPos: 0,
        angle: 0
    })
}
function Bird(props) {
    const birdsMoveAngle = ['0', '45', '-45', '90', '-90', '135', '-135', '180']
    const birdsMoveXDis = [2, 1.5, 1.5, 0, 0, -1.5, -1.5, -2]
    const birdsMoveYDis = [0, -1.5, 1.5, -2, 2, -1.5, 1.5, 0]
    const angle = props.angle
    const [xPos, setXPos] = useState(Number(props.xPos))
    const [yPos, setYPos] = useState(Number(props.yPos))

    useEffect(() => {
        const moveTimer = setInterval(function () {
            if (!props.valid) {
                return
            }
            if (xPos > g_mapSize.width + 100 || yPos > g_mapSize.height + 100 || xPos < -100 || yPos < -100) {
                props.setValid(props.index)
                return
            }
            setXPos(xPos + birdsMoveXDis[angle])
            setYPos(yPos + birdsMoveYDis[angle])
        }, 50)
        return () => {
            clearInterval(moveTimer)
        }
    }, [xPos, yPos])
    return (
        <div className={'birds'/*  + (!props.valid?' notVisible':'') */} style={{
            left: props.mapPosition.x + xPos * props.mapSize.width / g_mapSize.width,
            top: props.mapPosition.y + yPos * props.mapSize.height / g_mapSize.height
        }}>
            <div className={"bird bird" + birdsMoveAngle[angle]} style={/* window.orientation === undefined ? {zoom: props.mapZoom + 0.3} :  */{}}>
            </div>
        </div>
    )
}

// the main component
function MapComponent(props) {
    // responsive screen
    const { orientation } = useOrientation()

    const { windowSize } = useWindowSize()

    const prevWindowSizeRef = useRef({ width: 0, height: 0 })
    const currentWindowSizeRef = useRef({ width: 0, height: 0 })

    const [mapZoom, setMapZoom] = useState(g_defaultMapZoom)
    const mapZoomRef = useRef(g_defaultMapZoom)
    const mapScaleRef = useRef(0.0)

    const [reDraw, setReDraw] = useState(false)
    const reDrawRef = useRef(false)

    const [mapSize, setMapSize] = useState({ width: 0, height: 0 })
    const [buildingSize, setBuildingSize] = useState({ width: 0, height: 0 })
    const [mapPosition, setMapPosition] = useState({ x: 0, y: 0 })
    const mapPositionRef = useRef({ x: 0, y: 0 })

    const [mouseDownPosition, setMouseDownPosition] = useState({ x: 0, y: 0 })
    const [prevDiffOfTouches, setPrevDiffOfTouches] = useState(0.0)
    const [mapMoving, setMapMoving] = useState(false)

    //STAKING
    const [isStakableTH, setIsStakableTH] = useState('stillChecking')
    const [isStakableLJ, setIsStakableLJ] = useState('stillChecking')
    const [isStakableSM, setIsStakableSM] = useState('stillChecking')
    const [isStakableFM, setIsStakableFM] = useState('stillChecking')

    // Server Config
    const [serverConfig, setServerConfig] = useState(props.serverConfig)
    useEffect(() => {
        setServerConfig(props.serverConfig)
    }, [props.serverConfig])

    useEffect(() => {
        playSound('cityNature')

        const element = '#root'

        var touchStartHandler, touchMoveHandler
        function preventZoomAction() {
            document.querySelector(element).addEventListener('touchstart', touchStartHandler = function (e) {
                if (e.touches.length !== 1) {
                    e.preventDefault()
                }
            });

            document.querySelector(element).addEventListener('touchmove', touchMoveHandler = function (e) {
                if (e.touches.length !== 1) {
                    e.preventDefault()
                }
            });
        }
        preventZoomAction()

        return () => {
            document.querySelector(element).addEventListener('touchstart', touchStartHandler)
            document.querySelector(element).addEventListener('touchmove', touchMoveHandler)
        }
    }, [])

    const [birds, setBirds] = useState(birdsInit)
    useEffect(() => {
        var birdsAppearTimer
        // ['0', '45', '-45', '90', '-90', '135', '-135', '180']
        const birdsInitialXPos = [0, 0, 0, g_mapSize.width / 2, g_mapSize.width / 2, g_mapSize.width, g_mapSize.width, g_mapSize.width]
        const birdsInitialYPos = [g_mapSize.height / 2, g_mapSize.height, 0, g_mapSize.height, 0, g_mapSize.height, 0, g_mapSize.height / 2]
        birdsAppearTimer = setInterval(function () {
            if (parseInt(Math.random() * 3) != 1) {
                return
            }
            var newBirdsCount = parseInt(1 + Math.random() * 4)
            const angle = parseInt(Math.random() * 8)
            var newBirds = JSON.parse(JSON.stringify(birds))
            for (var i = 0; i < birdsCount; ++i) {
                if (!newBirds[i].valid && newBirdsCount--) {
                    newBirds[i] = {
                        valid: true,
                        angle: angle,
                        xPos: birdsInitialXPos[angle] + Math.random() * 30 * i,
                        yPos: birdsInitialYPos[angle] + Math.random() * 30 * i
                    }
                }
                if (newBirdsCount === 0) {
                    break
                }
            }
            setBirds(newBirds)
        }, 3 * 1000)

        return () => {
            clearInterval(birdsAppearTimer)
        }
    }, [birds])

    const [dolphinPos, setDolphinPos] = useState({ x: 1000, y: 800 })
    const [showDolphin, setShowDolphin] = useState(false)
    useEffect(() => {
        var timer
        timer = setInterval(function () {
            setDolphinPos({ x: 800 + Math.random() * 300, y: 800 + Math.random() * 200 })
            setShowDolphin(!showDolphin)
        }, 2 * 1000)

        return () => {
            clearInterval(timer)
        }
    }, [showDolphin])

    useEffect(() => {
        if (orientation === -90) {
            alert('Please don\'t rotate your phone at this side, it could cause some unexpected problems')
        }
    }, [orientation])

    useEffect(() => {
        mapZoomRef.current = mapZoom
        reDrawRef.current = !reDrawRef.current
        setReDraw(reDrawRef.current)
    }, [mapZoom])

    useEffect(() => {
        currentWindowSizeRef.current.width = windowSize.width
        currentWindowSizeRef.current.height = windowSize.height
        reDrawRef.current = !reDrawRef.current
        setReDraw(reDrawRef.current)
    }, [windowSize])

    useEffect(() => {
        var widthScale, heightScale, scale, xPos, yPos, width, height
        widthScale = currentWindowSizeRef.current.width / g_mapSize.width
        heightScale = currentWindowSizeRef.current.height / g_mapSize.height
        scale = Math.max(widthScale, heightScale) * mapZoomRef.current
        width = g_mapSize.width * scale
        height = g_mapSize.height * scale
        setBuildingSize({ width: width * 0.15, height: width * 0.15 })
        setMapSize({ width: width, height: height })
        if (prevWindowSizeRef.current.width === 0 || prevWindowSizeRef.current.height === 0) {
            xPos = (currentWindowSizeRef.current.width - width) / 2
            yPos = (currentWindowSizeRef.current.height - height) / 2
        } else {
            var width1 = prevWindowSizeRef.current.width / 2 - mapPositionRef.current.x
            xPos = width1 * scale / mapScaleRef.current
            xPos = currentWindowSizeRef.current.width / 2 - xPos
            var height1 = prevWindowSizeRef.current.height / 2 - mapPositionRef.current.y
            yPos = height1 * scale / mapScaleRef.current
            yPos = currentWindowSizeRef.current.height / 2 - yPos

            xPos = Math.min(xPos, 0)
            xPos = Math.max(xPos, (currentWindowSizeRef.current.width - width))
            yPos = Math.min(yPos, 0)
            yPos = Math.max(yPos, (currentWindowSizeRef.current.height - height))
        }
        mapPositionRef.current.x = xPos
        mapPositionRef.current.y = yPos
        setMapPosition({ x: xPos, y: yPos })
        mapScaleRef.current = scale
        prevWindowSizeRef.current.width = currentWindowSizeRef.current.width
        prevWindowSizeRef.current.height = currentWindowSizeRef.current.height
    }, [reDraw])

    const onWheelHandler = (e) => {
        var zoom = mapZoom + (e.deltaY < 0 ? g_mapZoomUnit : -g_mapZoomUnit)
        zoom = Math.min(zoom, g_mapMaxZoom)
        zoom = Math.max(zoom, g_mapMinZoom)
        setMapZoom(zoom)
    }

    const onMouseDownHandler = (e) => {
        setMouseDownPosition({ x: e.screenX, y: e.screenY })
        setMapMoving(true)
    }

    const onTouchStartHandler = (e) => {
        if (e.touches.length === 2) {
            setPrevDiffOfTouches(Math.pow(Math.abs(e.touches[0].screenX - e.touches[1].screenX), 2) + Math.pow(Math.abs(e.touches[0].screenY - e.touches[1].screenY), 2))
        } else {
            e = e.touches[0];
            setMouseDownPosition({ x: e.screenX, y: e.screenY })
            setMapMoving(true)
        }
    }

    const onMouseMoveHandler = (e) => {
        if (mapMoving) {
            var xPos = mapPositionRef.current.x + mapZoom * (e.screenX - mouseDownPosition.x), yPos = mapPositionRef.current.y + mapZoom * (e.screenY - mouseDownPosition.y)
            xPos = Math.min(xPos, 0)
            xPos = Math.max(xPos, windowSize.width - mapSize.width)
            yPos = Math.min(yPos, 0)
            yPos = Math.max(yPos, windowSize.height - mapSize.height)
            mapPositionRef.current.x = xPos
            mapPositionRef.current.y = yPos
            setMapPosition({ x: xPos, y: yPos })
            setMouseDownPosition({ x: e.screenX, y: e.screenY })
        }
    }

    const onTouchMoveHandler = (e) => {
        if (e.touches.length === 2) {
            const currentDiffOfTouches = Math.pow(Math.abs(e.touches[0].screenX - e.touches[1].screenX), 2) + Math.pow(Math.abs(e.touches[0].screenY - e.touches[1].screenY), 2)
            var zoom = mapZoom + (currentDiffOfTouches > prevDiffOfTouches ? g_mapZoomUnit : -g_mapZoomUnit)
            zoom = Math.min(zoom, g_mapMaxZoom)
            zoom = Math.max(zoom, g_mapMinZoom)
            setMapZoom(zoom)
            setPrevDiffOfTouches(currentDiffOfTouches)
        } else {
            e = e.touches[0];
            if (mapMoving) {
                var xPos = mapPositionRef.current.x + mapZoom * (e.screenX - mouseDownPosition.x), yPos = mapPositionRef.current.y + mapZoom * (e.screenY - mouseDownPosition.y)
                xPos = Math.min(xPos, 0)
                xPos = Math.max(xPos, windowSize.width - mapSize.width)
                yPos = Math.min(yPos, 0)
                yPos = Math.max(yPos, windowSize.height - mapSize.height)
                mapPositionRef.current.x = xPos
                mapPositionRef.current.y = yPos
                setMapPosition({ x: xPos, y: yPos })
                setMouseDownPosition({ x: e.screenX, y: e.screenY })
            }
        }
    }

    const onMouseUpHandler = () => {
        setMapMoving(false)
    }

    const onTouchEndHandler = () => {
        setMapMoving(false)
    }

    // game logic
    const [buildingNfts, setBuildingNfts] = useState(props.buildingNfts)
    useEffect(() => {
        setBuildingNfts(props.buildingNfts);
    }, [props.buildingNfts]);
    const [buildingPlaces, setBuildingPlaces] = useState(g_buildingPlace)

    // NFTs
    const [nftInfoVisible, setNftInfoVisible] = useState('null')

    useEffect(() => {
        var stakeBuildingsList = buildingNfts.filter(buildingNft => buildingNft.stake)
        var stakeBuildingsObject = {}
        for (var i = 0; i < stakeBuildingsList.length; ++i) {
            stakeBuildingsObject[stakeBuildingsList[i].position] = stakeBuildingsList[i]
        }
        var tmpBuildingPlaces = g_buildingPlace.map(buildingPlace => (
            buildingPlace.position && stakeBuildingsObject[buildingPlace.position] ?
                stakeBuildingsObject[buildingPlace.position] :
                buildingPlace))

        setBuildingPlaces(tmpBuildingPlaces)
    }, [buildingNfts])

    //Check Staking
    useEffect(() => { checkStaking(buildingNfts) }, [buildingNfts])

    // Build Modal
    const [buildModalOpen, setBuildModalOpen] = useState(false)
    const [positionToBuild, setPositionToBuild] = useState(1)

    const [stackNftType, setStackNftType] = useState(false)
    const openBuildModal = (info) => {
        if (info.type == 'sand') {
            setStackNftType(4)
        } else if (info.type == 'building') {
            setStackNftType(3)
        }
        if (info.id) {
            // test code
            // alert('Click on Staked Building in City: ', info)
            setNftInfoVisible(`${info.type}-${info.id}`)
        } else if (idDelegate == null) {
            setPositionToBuild(info.position)
            setBuildModalOpen(true)
        }
    }

    const closeBuildModalHandler = () => {
        setBuildModalOpen(false)
    }

    const clickToBuildHandler = async (newBuildingNft, metamask, ERC721, ERCStaking) => {

        setBuildModalOpen(false)

        // console.log('newBuildingNft: ', newBuildingNft)

        const stakeResult = await BuildingSetStake(newBuildingNft.id, newBuildingNft.type, metamask, ERC721, ERCStaking)

        //Stake Method
        if (stakeResult[0]) {

            setPosition(newBuildingNft.type, newBuildingNft.id, positionToBuild, metamask);

            setBuildingNfts(
                buildingNfts.map(buildingNft =>
                (((buildingNft.type === newBuildingNft.type) && (buildingNft.id === newBuildingNft.id)) ?
                    { ...buildingNft, position: positionToBuild, stake: 1 } : buildingNft)
                )
            )

            //Update Global Staking Status
            if (newBuildingNft.type == 1) setIsStakableTH(false)
            if (newBuildingNft.type == 2) setIsStakableLJ(false)
            if (newBuildingNft.type == 3) setIsStakableSM(false)
            if (newBuildingNft.type == 4) setIsStakableFM(false)

            //Update Builders
            props.gameCallback_newBuilders(stakeResult[2])

            //Update Status NFT Popup


            toast.update(stakeResult[1], {
                render: "Done!",
                type: "success",
                isLoading: false,
                autoClose: 3000
            });

        } else {
            toast.update(stakeResult[1], {
                render: "Error!",
                type: "error",
                isLoading: false,
                autoClose: 3000
            });
        }
    }

    //###----STAKING METHODS
    //###-------------------
    const checkStaking = (nfts) => {
        let townhallIsStakable = true;
        let lumberjackIsStakable = true;
        let stonemineIsStakable = true;
        let fishermanIsStakable = true;

        nfts.map((item, i) => (

            item.stake ?

                item.type == 1 ?
                    townhallIsStakable = false
                    : item.type == 2 ?
                        lumberjackIsStakable = false
                        : item.type == 3 ?
                            stonemineIsStakable = false
                            : item.type == 4 ?
                                fishermanIsStakable = false
                                : null

                : null

        ))

        setIsStakableTH(townhallIsStakable);
        setIsStakableLJ(lumberjackIsStakable);
        setIsStakableSM(stonemineIsStakable);
        setIsStakableFM(fishermanIsStakable);
    }

    const isStakable = (type) => {
        let isStakableReturn = null;

        type == 1
            ? isStakableTH
                ? isStakableReturn = 1
                : isStakableReturn = 0
            : type == 2
                ? isStakableLJ
                    ? isStakableReturn = 1
                    : isStakableReturn = 0
                : type == 3
                    ? isStakableSM
                        ? isStakableReturn = 1
                        : isStakableReturn = 0
                    : type == 4
                        ? isStakableFM
                            ? isStakableReturn = 1
                            : isStakableReturn = 0
                        : null

        return isStakableReturn
    }

    const BuildingSetStake = async (id, type, metamask, ERC721, ERCStaking) => {
        let contractAddress = null;
        let contract = null;
        let stake = null;

        let contractAddress721 = null;
        let contract721 = null;
        let isApproved = null;
        let approve = null;

        let receipt = null;

        //Get the Contract Address (Staking)
        if (type == 1) { contractAddress = ERCStaking.contractTownhall }
        else if (type == 2) { contractAddress = ERCStaking.contractLumberjack }
        else if (type == 3) { contractAddress = ERCStaking.contractStonemine }
        else if (type == 4) { contractAddress = ERCStaking.contractFisherman }
        else return false

        //Initialize the Contract Object (Staking)
        contract = new ethers.Contract(contractAddress, ERCStaking.ABI, metamask.walletSigner);


        //Get the Contract Address (721)
        if (type == 1) { contractAddress721 = ERC721.contractTownhall }
        else if (type == 2) { contractAddress721 = ERC721.contractLumberjack }
        else if (type == 3) { contractAddress721 = ERC721.contractStonemine }
        else if (type == 4) { contractAddress721 = ERC721.contractFisherman }
        else return false

        //Initialize the Contract Object (721)
        contract721 = new ethers.Contract(contractAddress721, ERC721.ABI, metamask.walletSigner);

        try {
            //Check if TransferFrom is already approved
            isApproved = await contract721.getApproved(id)

            if (isApproved != contractAddress) {//Stake,To Approve

                approve = await contract721.approve(contractAddress, id);

                if (approve) {
                    let toastLoading = toast.loading('Approving... Almost done!')

                    receipt = await approve.wait();

                    toast.update(toastLoading, {
                        render: "Done! You can stake now",
                        type: "success",
                        isLoading: false,
                        autoClose: 2000
                    });

                    stake = await contract.stake(id)

                    if (stake) {
                        let toastLoading = toast.loading('Staking... Almost done!')

                        receipt = await stake.wait();

                        return staking_getEventFromBE(id, type, toastLoading, metamask)
                    }
                }

            } else {//Stake, Already Approved

                stake = await contract.stake(id)

                if (stake) {
                    let toastLoading = toast.loading('Staking... Almost done!')

                    receipt = await stake.wait();

                    return staking_getEventFromBE(id, type, toastLoading, metamask)
                }
                //END --- Stake/Unstake
            }

        } catch (err) {
            toast.error(err.message)
        }
    }//StakingApproved

    const staking_getEventFromBE = async (id, type, toastLoading, metamask) => {
        // console.log('staking_getEventFromBE ', id, type, newStatus)

        // console.log('metamask ', metamask);
        // console.log('metamask.walletAccount ', metamask.walletAccount);


        //Vars
        let i = 0;
        const maxTimeout = 5;
        let serverApproved = false;
        let builders = null;
        let wait = 1;

        //Loop until BE confirms or Logout
        for (i; i < maxTimeout; i++) {

            await axios({
                method: 'post',
                url: '/api/m1/buildings/isStake', //api isStaked
                data: {
                    address: metamask.walletAccount,
                    id: id,
                    type: type,
                    newStatus: true
                }
            })
                .then(response => {
                    if (response.data.success) {
                        builders = response.data.data.builders;
                        serverApproved = true;
                        if (type == 4) props.gameCallback_newFisherman(true)
                    }
                })
                .catch(error => {
                    error.response.status == 500
                        && props.callback_Logout()

                    error.response.status == 401
                        && props.callback_Logout()
                })

            serverApproved
                ? i = maxTimeout
                : await new Promise(wait => setTimeout(wait, 1000 * i));
        }

        if (serverApproved) {
            return [true, toastLoading, builders]
            //   let x = {...this.state}
            //   x.nft.stake = !x.nft.stake;
            //   this.setState({...x})


        } else {
            return false
            // console.log('maxTimeout Reached --> Logout');
            // this.props.callback_Logout();
        }

    }
    //STAKING METHODS----###
    //-------------------###


    const setPosition = async (type, id, position, metamask) => {
        await axios({
            method: 'post',
            url: '/api/m1/buildings/setPosition', //api isStaked
            data: {
                address: metamask.walletAccount,
                id: id,
                type: type,
                position: position
            }
        })
            .then(response => {
                if (response.data.success) {

                }
            })
            .catch(error => {
                error.response.status == 500
                    && props.callback_Logout()

                error.response.status == 401
                    && props.callback_Logout()
            })
    }

    // callbacks for NFT component
    const callback_buildingUnstake = (buildingInfo) => {
        setBuildingNfts(
            buildingNfts.map(buildingNft =>
            (((buildingNft.id === buildingInfo.id) && (buildingNft.type === buildingInfo.type)) ?
                {
                    ...buildingNft,
                    position: 0,
                    stake: 0,
                    level: buildingInfo.level,
                    stored: buildingInfo.stored,
                    capacity: buildingInfo.capacity,
                    dropQuantity: buildingInfo.dropQuantity,
                    image: buildingInfo.image,
                    imageSprite: buildingInfo.imageSprite,
                } : buildingNft)
            )
        )
    }
    const callback_buildingUpgrade = (buildingNewInfo) => {
        // console.log('callback_buildingUpgrade: ', buildingNewInfo)
        setBuildingNfts(
            buildingNfts.map(buildingNft =>
            (((buildingNft.type === buildingNewInfo.type) && (buildingNft.id === buildingNewInfo.id)) ?
                {
                    ...buildingNft,
                    imageSprite: buildingNewInfo.imageSprite,
                    image: buildingNewInfo.image,
                    imageSprite: buildingNewInfo.imageSprite,
                    level: buildingNewInfo.level,
                    description: buildingNewInfo.description,
                    moreInfo: buildingNewInfo.moreInfo,
                    stored: buildingNewInfo.stored,
                    capacity: buildingNewInfo.capacity,
                    dropQuantity: buildingNewInfo.dropQuantity,
                    dropInterval: buildingNewInfo.dropInterval,
                    upgradeImage: buildingNewInfo.upgradeImage,
                    upgradeTime: buildingNewInfo.upgradeTime,
                    upgradeCapacity: buildingNewInfo.upgradeCapacity,
                    upgradeDropQuantity: buildingNewInfo.upgradeDropQuantity,
                    upgradeResources: buildingNewInfo.upgradeResources,
                    upgradeStatus: buildingNewInfo.upgradeStatus,
                } : buildingNft)
            )
        )
        // console.log('buildingNfts: ', buildingNfts)
    }
    const callback_fishOpen = () => {
        playSound('button')
        setNftInfoVisible('null')
        props.gameCallback_handleClickOnMap('fish')
    }

    //onPopup
    const callback_popupTest = useCallback(
        () => {
            null
            //   console.log('callback_popupTest...');
        },
        [],
    );

    //MAP
    const mapImage = assets(g_mapImageURL)
    const flagImage = assets('./flag.png')
    const templeImage = assets('./temple.png')
    const bonusImage = assets('./bonus.png')

    const setValid = (index) => {
        setBirds(birds.map((bird, i) => (index === i ? { ...bird, valid: false } : bird)))
    }

    const [flagHover, setFlagHover] = useState(false)
    const [templeHover, setTempleHover] = useState(false)
    const [bonusHover, setBonusHover] = useState(false)

    const [idDelegate, setIdDelegate] = useState(props.idDelegate)
    useEffect(() => { setIdDelegate(props.idDelegate) }, [props.idDelegate])
    const [delegationData, setDelegationData] = useState(props.delegationData)
    useEffect(() => { setDelegationData(props.delegationData) }, [props.delegationData])
    const [settings, setSettings] = useState(props.settings)
    useEffect(() => { setSettings(props.settings) }, [props.settings])

    const [cityData, setCityData] = useState(props.cityData)
    useEffect(() => { setCityData(props.cityData) }, [props.cityData])

    const onPrestige = (nftInfo) => {
        props.onPrestige(nftInfo);
    }

    return (
        <>
            {/* ANNOUNCEMENT BANNER */}
            {/* SERVER CONFIG -- ANNOUNCEMENT AVAILABILITY */}
            {serverConfig?.map.announcement
                ? (props.cityData.home == 1 && props.announcement) &&
                <div className='city-banner'>
                    <span className='bannerDescription'>
                        {props.announcement?.text}
                        <span className='bannerCityName'>
                            <Button
                                variant='contained'
                                onClick={() => props.announcementShowCallback(props.announcement.notification)}>
                                {props.announcement?.cta}
                            </Button>
                        </span>
                    </span>
                </div>
                : null}

            {/* SERVER CONFIG -- DELEGATION AVAILABILITY */}
            {serverConfig?.features.delegation
                ? <>
                    {/* DELEGATE BANNER */}
                    {props.cityData.home == 0 &&
                        <div className='city-banner'>
                            <span className='bannerDescription'>{windowSize.width > 450 ? 'You are visiting the ' : ''} <span className='bannerCityName'>{props.cityData.name}</span>{windowSize.width > 250 ? ' City' : ''}</span>
                            <IconButton className='returnBtn' aria-label="return" onClick={() => {
                                playSound('button')
                                props.callback_backToLand()
                            }}>
                                <KeyboardReturnIcon />
                            </IconButton>
                        </div>}
                    {idDelegate != null &&
                        <div className='city-banner delegate'>
                            <span className='bannerDescription'>{windowSize.width > 450 ? 'You are delegated the ' : ''}<span className='bannerCityName'>{settings.cityName}</span>{windowSize.width > 250 ? ' City' : ''}</span>
                            <IconButton className='returnBtn' aria-label="return" onClick={() => {
                                playSound('button')
                                props.callback_offDelegate()
                            }}>
                                <KeyboardReturnIcon />
                            </IconButton>
                        </div>}
                    {/* SCHOLARSHIP LINK */}
                    {idDelegate == null &&
                        <div className='scholarshipPanel'>
                            <Link to="/scholarship">
                                <IconButton className='scholarshipBtn' onClick={(e) => e.stopPropagation()}>
                                    <GroupsIcon />
                                </IconButton>
                            </Link>
                        </div>}
                </>
                : null}

            <div className={props.isVisible ? 'mapComponent' : 'mapComponent notVisible'}
                onWheel={(e) => onWheelHandler(e)}
                onTouchStart={(e) => onTouchStartHandler(e)}
                onTouchMove={(e) => onTouchMoveHandler(e)}
                onTouchEnd={(e) => onTouchEndHandler(e)}
                onTouchCancel={(e) => onTouchEndHandler(e)}
                onMouseDown={(e) => onMouseDownHandler(e)}
                onMouseMove={(e) => onMouseMoveHandler(e)}
                onMouseUp={(e) => onMouseUpHandler(e)} >

                {cityData.home == 1 &&
                    <div className='flagMark' style={{
                        left: mapPosition.x + g_flagPos.x * mapSize.width / g_mapSize.width,
                        top: mapPosition.y + g_flagPos.y * mapSize.height / g_mapSize.height,
                        width: g_flagSize.width * mapSize.width / g_mapSize.width,
                        height: g_flagSize.height * mapSize.height / g_mapSize.height
                    }}>
                        <div className='flagHole'
                            onMouseEnter={() => { setFlagHover(true) }} onMouseLeave={() => { setFlagHover(false) }}
                            onClick={() => [playSound('cityFlag'), props.gameCallback_handleClickOnMap('city-panel')]}>
                        </div>
                        <img draggable={false} className='flagImg' src={flagImage} alt={'flag'} style={
                            flagHover ?
                                { filter: 'drop-shadow(2px 2px 0 #FFB13B) drop-shadow(-2px -2px 0 #FFB13B) drop-shadow(2px -2px 0 #FFB13B) drop-shadow(-2px 2px 0 #FFB13B)' } :
                                {}}
                        />
                    </div>}

                {/* SERVER CONFIG -- FEATURES BONUS SYSTEM AVAILABILITY */}
                {serverConfig?.features.bonusSystem.available
                    ?
                    cityData.home == 1 &&
                    <div className='bonusMark' style={{
                        left: mapPosition.x + g_bonusPos.x * mapSize.width / g_mapSize.width,
                        top: mapPosition.y + g_bonusPos.y * mapSize.height / g_mapSize.height,
                        width: g_bonusSize.width * mapSize.width / g_mapSize.width,
                        height: g_bonusSize.height * mapSize.height / g_mapSize.height
                    }}>
                        <div className='bonusHole'
                            onMouseEnter={() => { setBonusHover(true) }} onMouseLeave={() => { setBonusHover(false) }}
                            onClick={() => [playSound('bonus'), props.gameCallback_handleClickOnMap('bonus')]}>
                        </div>
                        <img draggable={false} className='bonusImg' src={bonusImage} alt={'bonus'} style={
                            bonusHover ?
                                { filter: 'drop-shadow(2px 2px 0 #FFB13B) drop-shadow(-2px -2px 0 #FFB13B) drop-shadow(2px -2px 0 #FFB13B) drop-shadow(-2px 2px 0 #FFB13B)' } :
                                {}}
                        />
                    </div>
                    : null}

                {/* SERVER CONFIG -- DELEGATION AVAILABILITY */}
                {serverConfig?.map.temple
                    ?
                    cityData.home == 1 &&
                    <div className='templeMark' style={{
                        left: mapPosition.x + g_templePos.x * mapSize.width / g_mapSize.width,
                        top: mapPosition.y + g_templePos.y * mapSize.height / g_mapSize.height,
                        width: g_templeSize.width * mapSize.width / g_mapSize.width,
                        height: g_templeSize.height * mapSize.height / g_mapSize.height
                    }}>
                        <div className='templeHole'
                            onMouseEnter={() => { setTempleHover(true) }} onMouseLeave={() => { setTempleHover(false) }}
                            onClick={() => [playSound('cityFlag'), props.gameCallback_handleClickOnMap('city-temple')]}>
                        </div>
                        <img draggable={false} className='templeImg' src={templeImage} alt={'temple'} style={
                            templeHover ?
                                { filter: 'drop-shadow(2px 2px 0 #FFB13B) drop-shadow(-2px -2px 0 #FFB13B) drop-shadow(2px -2px 0 #FFB13B) drop-shadow(-2px 2px 0 #FFB13B)' } :
                                {}}
                        />
                    </div>
                    : null}

                {birds.map((bird, index) => (
                    bird.valid && <Bird key={index} {...bird} index={index} setValid={setValid} mapPosition={mapPosition} mapZoom={mapZoom} mapSize={mapSize} />
                ))}
                {showDolphin &&
                    <div className='dolphins' style={{ left: mapPosition.x + dolphinPos.x * mapSize.width / g_mapSize.width, top: mapPosition.y + dolphinPos.y * mapSize.height / g_mapSize.height }}>
                        <div className='dolphin' style={{/* zoom: mapZoom */ }}></div>
                    </div>}
                <div className='map'>
                    <img src={mapImage} draggable={false} style={{ left: mapPosition.x, top: mapPosition.y, width: mapSize.width, height: mapSize.height }} alt="map" />
                </div>
                <div className='buildings'>
                    {buildingPlaces.map(buildingPlace => (
                        buildingPlace.position &&
                        <BuildingPlace
                            key={buildingPlace.position}
                            info={buildingPlace}
                            size={buildingSize}
                            mapSize={mapSize}
                            mapPosition={mapPosition}
                            clickHandler={openBuildModal}
                            builders={props.builders}
                            onPrestige={onPrestige}
                            prestigeAllow={serverConfig?.features.prestige}
                        >
                        </BuildingPlace>
                    ))}
                </div>
            </div>
            <DialogStaking
                open={buildModalOpen}
                onClose={closeBuildModalHandler}
                scroll={'paper'}
                aria-labelledby="scroll-dialog-title"
                aria-describedby="scroll-dialog-description"
            >
                <DialogTitle id="scroll-dialog-title">
                    {stackNftType == 4 ? 'Stake Fisherman\'s Hut' :
                        stackNftType < 4 ? 'Stake your Buildings' :
                            ''}
                </DialogTitle>
                <DialogContent dividers={true}>

                    {buildingNfts.filter(buildingNft => !buildingNft.stake).map((buildingNft) => (
                        ((stackNftType == 4 && buildingNft.type == 4) || (stackNftType < 4 && buildingNft.type < 4)) ?
                            <ListItem button onClick={() =>
                                isStakable(buildingNft.type)
                                    ? clickToBuildHandler(buildingNft, props.metamask, props.ERC721, props.ERCStaking)
                                    : console.log('Not Stakable!')
                            }
                                className={
                                    isStakable(buildingNft.type)
                                        ? 'isStakable'
                                        : 'notStakable'
                                }
                                key={`${buildingNft.type}-${buildingNft.id}`}
                            >
                                <ListItemAvatar>
                                    <Avatar>
                                        <img className="buildingAvatar" src={buildingNft.imageSprite} alt={g_buildingType[buildingNft.type]}></img>
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText style={{ marginLeft: "20px" }} primary={`${getFormatted(g_buildingType[buildingNft.type])} #${buildingNft.id}`} />
                            </ListItem> : null
                    ))}

                </DialogContent>
            </DialogStaking>

            <div className='nfts-container'>
                {buildingNfts.map((buildingPlace, i) => (
                    (buildingPlace.position && buildingPlace.stake) ?
                        <NFT
                            key={i}
                            isVisible={nftInfoVisible}

                            metamask={props.metamask}
                            ERCStaking={props.ERCStaking}
                            ERC721={props.ERC721}

                            uniqueID={`${buildingPlace.type}-${buildingPlace.id}`}
                            nft={buildingPlace}
                            builders={props.builders}
                            inventory={props.inventory}

                            gameCallback_onPopup={callback_popupTest}
                            gameCallback_closePopup={() => setNftInfoVisible('null')}

                            onClaimAll={props.onClaimAll}

                            parentCallback_newClaimable={props.gameCallback_newClaimable}
                            parentCallback_newInventory={props.gameCallback_newInventory}
                            parentCallback_newBuilders={props.gameCallback_newBuilders}
                            parentCallback_refreshBuilders={props.gameCallback_refreshBuilders}

                            callback_fishOpen={callback_fishOpen}
                            callback_buildingUpgrade={callback_buildingUpgrade}
                            callback_buildingUnstake={callback_buildingUnstake}
                            callback_Logout={() => props.callback_Logout()}

                            callback_ToastLoading={(message) => toast.loading(message)}
                            callback_ToastError={(error) => toast.error(error)}

                            idDelegate={idDelegate}
                            delegationData={delegationData}
                        />
                        : null
                ))}
            </div>

            <ToastContainer
                position="top-right"
                autoClose={1500}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
            />

        </>
    )
}

// slot component
function BuildingPlace({ info, size, mapSize, mapPosition, clickHandler, builders, onPrestige, prestigeAllow }) {

    const buildingImage = info.imageSprite //info.id && info.imageSprite
    // const shadowImage = info.id && assets('./' + g_buildingType[info.type] + '_shadow.png')

    const [hover, setHover] = useState(false)

    const ownClickHandler = () => {
        playSound('citySlot')
        clickHandler(info)
    }

    return (
        <div className='buildingPlace'
            style={{
                width: size.width, height: size.height,
                left: mapPosition.x + g_buildingPlace[info.position].x * mapSize.width / g_mapSize.width,
                top: mapPosition.y + g_buildingPlace[info.position].y * mapSize.height / g_mapSize.height
            }}>
            {prestigeAllow && info.prestige &&
                <div className={'prestigeButton' + (info.levelMax ? ' max-level' : '')} onClick={() => onPrestige(info)}>
                    <ReplayIcon />
                    <div className={'building-level'}>
                        {info.level}
                    </div>
                </div>}
            <div onClick={() => { ownClickHandler() }} className={info.id ? 'hide slot' : 'show slot'} onMouseEnter={() => { setHover(true) }} onMouseLeave={() => { setHover(false) }}>
            </div>
            {info.id && <img src={buildingImage} className="buildingImage" draggable={false} style={{ width: size.width, height: size.height, filter: hover ? "drop-shadow(2px 2px 0 #FFB13B) drop-shadow(-2px -2px 0 #FFB13B) drop-shadow(2px -2px 0 #FFB13B) drop-shadow(-2px 2px 0 #FFB13B)" : "none" }} alt={g_buildingType[info.type]} />}
        </div>
    )
}

// functions to get the various values of the window
function useWindowSize() {
    const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })

    useLayoutEffect(() => {
        function updateWindowSize() {
            setWindowSize({ width: window.innerWidth, height: window.innerHeight })
        }
        window.addEventListener('resize', updateWindowSize)
        window.addEventListener('scroll', updateWindowSize)
        updateWindowSize()

        return () => {
            window.removeEventListener('resize', updateWindowSize)
            window.removeEventListener('scroll', updateWindowSize)
        }
    }, [])

    return { windowSize }
}

function useOrientation() {
    const [orientation, setOrientation] = useState(80)

    useLayoutEffect(() => {
        function updateOrientation() {
            setOrientation(window.orientation)
        }
        window.addEventListener("orientationchange", updateOrientation);

        return () => {
            window.removeEventListener('orientationchange', updateOrientation)
        }
    }, [])

    return { orientation }
}

//Utils
function getFormatted(stringToFormat) {
    switch (stringToFormat) {
        case 'townhall': return 'Town Hall'
        case 'lumberjack': return 'Lumberjack'
        case 'stonemine': return 'Stone Mine'
        case 'fisherman': return "Fisherman's Hut"
    }
}

export default MapComponent