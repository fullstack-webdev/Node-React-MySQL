import './city.scss';
import 'react-toastify/dist/ReactToastify.css';

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { ToastContainer } from 'react-toastify';
//Dialog Staking Style
import styled from 'styled-components';

import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import {
  Dialog,
  IconButton,
} from '@mui/material';

import iconClose from '../../assets-game/iconClose.svg';
import { playSound } from '../../utils/sounds';

// test code
const assets = require.context('./assets', true)

// initial infos
const g_mapImageURL = './map.jpg'
const g_mapSize = {width: 1920, height: 1080}
const g_flagSize = {width: 64, height: 117}
const g_flagPos = {x: 1100, y: 300}
const g_templeSize = {width: 85, height: 86}
const g_templePos = {x: 1370, y: 100}
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
for ( var i = 0 ; i < birdsCount ; ++ i ) {
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
    const [ xPos, setXPos ] = useState(Number(props.xPos))
    const [ yPos, setYPos ] = useState(Number(props.yPos))

    useEffect(() => {
        const moveTimer = setInterval(function () {
            if ( !props.valid ) {
                return
            }
            if ( xPos > g_mapSize.width + 100 || yPos > g_mapSize.height + 100 || xPos < -100 || yPos < -100 ) {
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
            left: props.mapPosition.x + xPos*props.mapSize.width/g_mapSize.width,
            top: props.mapPosition.y + yPos*props.mapSize.height/g_mapSize.height
        }}> 
            <div className={"bird bird" + birdsMoveAngle[angle]} style={/* window.orientation === undefined ? {zoom: props.mapZoom + 0.3} :  */{}}>
            </div>
        </div>
    )
}

// the main component
function City(props) {
    // responsive screen
    const {orientation} = useOrientation()

    const {windowSize} = useWindowSize()

    const prevWindowSizeRef = useRef({width: 0, height: 0})
    const currentWindowSizeRef = useRef({width: 0, height: 0})

    const [mapZoom, setMapZoom] = useState(g_defaultMapZoom)
    const mapZoomRef = useRef(g_defaultMapZoom)
    const mapScaleRef = useRef(0.0)
    
    const [reDraw, setReDraw] = useState(false)
    const reDrawRef = useRef(false)

    const [mapSize, setMapSize] = useState({width: 0, height: 0})
    const [buildingSize, setBuildingSize] = useState({width: 0, height: 0})
    const [mapPosition, setMapPosition] = useState({x: 0, y: 0})
    const mapPositionRef = useRef({x: 0, y: 0})

    const [mouseDownPosition, setMouseDownPosition] = useState({x: 0, y: 0})
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
    },[props.serverConfig])

    useEffect(() => {
        playSound('cityNature')

        const element = '#root'
        
        var touchStartHandler, touchMoveHandler
        function preventZoomAction() {
            document.querySelector(element).addEventListener('touchstart', touchStartHandler = function(e){
                if (e.touches.length !== 1) {
                    e.preventDefault()
                }
            });
        
            document.querySelector(element).addEventListener('touchmove', touchMoveHandler = function(e){
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

    const [ birds, setBirds ] = useState(birdsInit)
    useEffect(() => {
        var birdsAppearTimer
        // ['0', '45', '-45', '90', '-90', '135', '-135', '180']
        const birdsInitialXPos = [0, 0, 0, g_mapSize.width / 2, g_mapSize.width / 2, g_mapSize.width, g_mapSize.width, g_mapSize.width]
        const birdsInitialYPos = [g_mapSize.height / 2, g_mapSize.height, 0, g_mapSize.height, 0, g_mapSize.height, 0, g_mapSize.height / 2]
        birdsAppearTimer = setInterval(function () {
            if ( parseInt(Math.random()*3) != 1 ) {
                return
            }
            var newBirdsCount = parseInt(1 + Math.random() * 4)
            const angle = parseInt(Math.random()*8)
            var newBirds = JSON.parse(JSON.stringify(birds))
            for ( var i = 0 ; i < birdsCount ; ++ i ) {
                if ( !newBirds[i].valid && newBirdsCount-- ) {
                    newBirds[i] = {
                        valid: true,
                        angle: angle,
                        xPos: birdsInitialXPos[angle] + Math.random() * 30 * i,
                        yPos: birdsInitialYPos[angle] + Math.random() * 30 * i
                    }
                }
                if ( newBirdsCount === 0 ) {
                    break
                }
            }
            setBirds(newBirds)
        }, 3 * 1000)

        return () => {
            clearInterval(birdsAppearTimer)
        }
    }, [birds])

    const [ dolphinPos, setDolphinPos ] = useState({x: 1000, y: 800})
    const [ showDolphin, setShowDolphin ] = useState(false)
    useEffect(() => {
        var timer
        timer = setInterval(function () {
            setDolphinPos({x: 800 + Math.random() * 300, y: 800 + Math.random() * 200})
            setShowDolphin(!showDolphin)
        }, 2 * 1000)

        return() => {
            clearInterval(timer)
        }
    }, [showDolphin])
    
    useEffect(() => {
        if ( orientation === -90 ) {
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
        setBuildingSize({width: width*0.15, height: width*0.15})
        setMapSize({width: width, height: height})
        if ( prevWindowSizeRef.current.width === 0 || prevWindowSizeRef.current.height === 0 ) {
            xPos = (currentWindowSizeRef.current.width -  width) / 2
            yPos = (currentWindowSizeRef.current.height - height) / 2
        } else {
            var width1 = prevWindowSizeRef.current.width/2 - mapPositionRef.current.x
            xPos = width1 * scale / mapScaleRef.current
            xPos = currentWindowSizeRef.current.width / 2 - xPos
            var height1 = prevWindowSizeRef.current.height/2 - mapPositionRef.current.y
            yPos = height1 * scale / mapScaleRef.current
            yPos = currentWindowSizeRef.current.height / 2 - yPos
            
            xPos = Math.min(xPos, 0)
            xPos = Math.max(xPos, (currentWindowSizeRef.current.width - width))
            yPos = Math.min(yPos, 0)
            yPos = Math.max(yPos, (currentWindowSizeRef.current.height - height))
        }
        mapPositionRef.current.x = xPos
        mapPositionRef.current.y = yPos
        setMapPosition({x: xPos, y: yPos})
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
        setMouseDownPosition({x: e.screenX, y: e.screenY})
        setMapMoving(true)
    }

    const onTouchStartHandler = (e) => {
        if ( e.touches.length === 2 ) {
            setPrevDiffOfTouches(Math.pow(Math.abs(e.touches[0].screenX - e.touches[1].screenX), 2) + Math.pow(Math.abs(e.touches[0].screenY - e.touches[1].screenY), 2))
        } else {
            e = e.touches[0];
            setMouseDownPosition({x: e.screenX, y: e.screenY})
            setMapMoving(true)
        }
    }

    const onMouseMoveHandler = (e) => {
        if ( mapMoving ) {
            var xPos = mapPositionRef.current.x + mapZoom*(e.screenX - mouseDownPosition.x), yPos = mapPositionRef.current.y + mapZoom*(e.screenY - mouseDownPosition.y)
            xPos = Math.min(xPos, 0)
            xPos = Math.max(xPos, windowSize.width - mapSize.width)
            yPos = Math.min(yPos, 0)
            yPos = Math.max(yPos, windowSize.height - mapSize.height)
            mapPositionRef.current.x = xPos
            mapPositionRef.current.y = yPos
            setMapPosition({x: xPos, y: yPos})
            setMouseDownPosition({x: e.screenX, y: e.screenY})
        }
    }

    const onTouchMoveHandler = (e) => {
        if ( e.touches.length === 2 ) {
            const currentDiffOfTouches = Math.pow(Math.abs(e.touches[0].screenX - e.touches[1].screenX), 2) + Math.pow(Math.abs(e.touches[0].screenY - e.touches[1].screenY), 2)
            var zoom = mapZoom + (currentDiffOfTouches > prevDiffOfTouches ? g_mapZoomUnit : -g_mapZoomUnit)
            zoom = Math.min(zoom, g_mapMaxZoom)
            zoom = Math.max(zoom, g_mapMinZoom)
            setMapZoom(zoom)
            setPrevDiffOfTouches(currentDiffOfTouches)
        } else {
            e = e.touches[0];
            if ( mapMoving ) {
                var xPos = mapPositionRef.current.x + mapZoom*(e.screenX - mouseDownPosition.x), yPos = mapPositionRef.current.y + mapZoom*(e.screenY - mouseDownPosition.y)
                xPos = Math.min(xPos, 0)
                xPos = Math.max(xPos, windowSize.width - mapSize.width)
                yPos = Math.min(yPos, 0)
                yPos = Math.max(yPos, windowSize.height - mapSize.height)
                mapPositionRef.current.x = xPos
                mapPositionRef.current.y = yPos
                setMapPosition({x: xPos, y: yPos})
                setMouseDownPosition({x: e.screenX, y: e.screenY})
            }
        }
    }

    const onMouseUpHandler = () => {
        setMapMoving(false)
    }

    const onTouchEndHandler = () => {
        setMapMoving(false)
    }
    
    // set NFTs Info and place on the MAP
    const [cityData, setCityData] = useState(props.cityData)
    
    useEffect(() => { 
        setCityData(props.cityData);
        setBuildingNfts(props.cityData.buildings);
    }, [props.cityData])
    
    const [buildingNfts, setBuildingNfts] = useState(props.cityData.buildings)
    const [buildingPlaces, setBuildingPlaces] = useState(g_buildingPlace)

    useEffect(() => {
        var stakeBuildingsList = buildingNfts.filter(buildingNft => buildingNft.stake)
        var stakeBuildingsObject = {}
        for ( var i = 0 ; i < stakeBuildingsList.length ; ++ i ) {
            stakeBuildingsObject[stakeBuildingsList[i].position] = stakeBuildingsList[i]
        }
        var tmpBuildingPlaces = g_buildingPlace.map(buildingPlace => (
            buildingPlace.position&&stakeBuildingsObject[buildingPlace.position] ?
            stakeBuildingsObject[buildingPlace.position]:
            buildingPlace))
        setBuildingPlaces(tmpBuildingPlaces)
    }, [buildingNfts])
    
    // NFTs
    const [nftInfoVisible, setNftInfoVisible] = useState('null')

    //MAP
    const mapImage = assets(g_mapImageURL)

    const setValid = (index) => {
        setBirds(birds.map((bird, i) => (index === i ? {...bird, valid: false} : bird)))
    }

    const openBuildModal = (info) => {
        if ( info.id ) {
            setNftInfoVisible(`${info.type}-${info.id}`)
        }
    }

    const onMapClick = (e) => {
        if (e.target.classList.contains("my-nft")) {
            setNftInfoVisible('null');
        }
    }
    const closeNFT = () => {
        setNftInfoVisible('null');
    }

    return (
        <>
            <div className={props.isVisible ? 'guest-city' : 'guest-city notVisible'}
                onWheel={(e) => onWheelHandler(e)}
                onTouchStart={(e) => onTouchStartHandler(e)}
                onTouchMove={(e) => onTouchMoveHandler(e)}
                onTouchEnd={(e) => onTouchEndHandler(e)}
                onTouchCancel={(e) => onTouchEndHandler(e)}
                onMouseDown={(e) => onMouseDownHandler(e)}
                onMouseMove={(e) => onMouseMoveHandler(e)}
                onMouseUp={(e) => onMouseUpHandler(e)} >

                <div className='guest-city-banner'>
                    <span className='bannerDescription'>{windowSize.width > 450 ? 'You are visiting the ' : ''} <span className='bannerCityName'>{cityData.info.cityName}</span>{windowSize.width > 250 ? ' City' : ''}</span>
                    <IconButton className='returnBtn' aria-label="return" onClick={() => {
                        playSound('button')
                        props.callback_backToLand()
                    }}>
                        <KeyboardReturnIcon />
                    </IconButton>
                </div>
                { birds.map((bird, index) => (
                    bird.valid && <Bird key={index} {...bird} index={index} setValid={setValid} mapPosition={mapPosition} mapZoom={mapZoom} mapSize={mapSize} />
                ))}
                { showDolphin &&
                <div className='dolphins' style={{left: mapPosition.x + dolphinPos.x*mapSize.width/g_mapSize.width, top: mapPosition.y + dolphinPos.y*mapSize.height/g_mapSize.height}}>
                    <div className='dolphin' style={{/* zoom: mapZoom */}}></div>
                </div>}
                <div className='map'>
                    <img src={mapImage} draggable={false} style={{left: mapPosition.x, top: mapPosition.y, width: mapSize.width, height: mapSize.height}} alt="map" />
                </div>
                <div className='buildings'>
                    { buildingPlaces.map(buildingPlace => (
                        buildingPlace.position &&
                        <BuildingPlace 
                            key={buildingPlace.position} 
                            info={buildingPlace} 
                            size={buildingSize} 
                            mapSize={mapSize} 
                            mapPosition={mapPosition}
                            clickHandler={openBuildModal}
                        >
                        </BuildingPlace>
                    )) }
                </div>
            </div>
            <div className={'my-nfts-container' + (nftInfoVisible === 'null' ? '' : ' show')} onClick={onMapClick}>
                {buildingNfts.map((buildingPlace, i) => (
                    (buildingPlace.position && buildingPlace.stake) ?
                        <MyNFT 
                            key={i}
                            isVisible = {nftInfoVisible}

                            uniqueID = {`${buildingPlace.type}-${buildingPlace.id}`}
                            nft = {buildingPlace}
                            close = {closeNFT}
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

// NFT
function MyNFT(props) {
    const [data, setData] = useState({})
    useEffect(() => {
        setData(props);
    }, [props]);

    return (
        <div className={'my-nft' + (data.uniqueID !== data.isVisible ? ' notVisible' : '')}>
            {data.nft && <div className='nft-view'>
                <img 
                    src={iconClose} 
                    className='menu-icon-close'
                    onClick={() => props.close()}
                    />
                <div className='left-view'>
                    <img className='nft-image' src={data.nft.image} />
                </div>
                <div className='right-view'>
                    <div className='nft-name'>
                        {data.nft.name} <a>+{data.nft.level}</a>
                    </div>
                    <div className='nft-description'>
                        {data.nft.description}
                    </div>
                    {data.nft.upgradeStatus == 1 &&
                    <div className='nft-desc'>
                        Upgrading now..
                    </div>
                    }
                </div>
            </div>}
        </div>
    )
}

// slot component
function BuildingPlace({ info, size, mapSize, mapPosition, clickHandler }) {
    
    // console.log('info: ', info)

    const buildingImage = info.imageSprite //info.id && info.imageSprite
    // const shadowImage = info.id && assets('./' + g_buildingType[info.type] + '_shadow.png')

    const [hover, setHover] = useState(false)

    const ownClickHandler = () => {
        playSound('citySlot')
        clickHandler(info)
    }

    return (
        <div className='buildingPlace'
            style={{width: size.width, height: size.height,
                left: mapPosition.x + g_buildingPlace[info.position].x*mapSize.width/g_mapSize.width,
                top: mapPosition.y + g_buildingPlace[info.position].y*mapSize.height/g_mapSize.height
            }}>
            <div onClick={() => {ownClickHandler()}} className={info.id ? 'hide slot' : 'show slot'} onMouseEnter={() => {setHover(true)}} onMouseLeave={() => {setHover(false)}}>
            </div>
            {info.id && <img src={buildingImage} className="buildingImage" draggable={false} style={{width: size.width, height: size.height, filter: hover?"drop-shadow(2px 2px 0 #FFB13B) drop-shadow(-2px -2px 0 #FFB13B) drop-shadow(2px -2px 0 #FFB13B) drop-shadow(-2px 2px 0 #FFB13B)":"none"}} alt={g_buildingType[info.type]} />}
        </div>
    )
}

// functions to get the various values of the window
function useWindowSize() {
    const [windowSize, setWindowSize] = useState({width: 0, height: 0})
    
    useLayoutEffect(() => {
        function updateWindowSize() {
            setWindowSize({width: window.innerWidth, height: window.innerHeight})
        }
        window.addEventListener('resize', updateWindowSize)
        window.addEventListener('scroll', updateWindowSize)
        updateWindowSize()

        return () => {
            window.removeEventListener('resize', updateWindowSize)
            window.removeEventListener('scroll', updateWindowSize)
        }
    }, [])
  
    return {windowSize}
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
  
    return {orientation}
}

export default City