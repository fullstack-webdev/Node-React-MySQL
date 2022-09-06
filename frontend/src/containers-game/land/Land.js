import './land.scss';
import 'react-toastify/dist/ReactToastify.css';

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import axios from 'axios';

import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

import homeMark from '../../assets-game/homeMark.png';
import {
  format,
  getRemainingTime_InMinute,
  getShortData,
  msToTime,
} from '../../utils/utils';

// test code
const assets = require.context('./assets', true)

// initial infos
const g_cityImageURL = './cityImage.png'
const g_mapImageURL = './map.png'
const g_mapSize = {width: 1920, height: 1080}
const g_defaultMapZoom = 1.1
const g_mapMaxZoom = 2.0
const g_mapMinZoom = 1.0
const g_mapZoomUnit = 0.05

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
function Land(props) {
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
    const [citySize, setCitySize] = useState({width: 0, height: 0})
    const [mapPosition, setMapPosition] = useState({x: 0, y: 0})
    const mapPositionRef = useRef({x: 0, y: 0})

    const [mouseDownPosition, setMouseDownPosition] = useState({x: 0, y: 0})
    const [prevDiffOfTouches, setPrevDiffOfTouches] = useState(0.0)
    const [mapMoving, setMapMoving] = useState(false)

    useEffect(() => {
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
    const setValid = (index) => {
        setBirds(birds.map((bird, i) => (index === i ? {...bird, valid: false} : bird)))
    }

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
    }, [showDolphin, dolphinPos])
    
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
        setCitySize({width: width*0.035, height: height*0.045})
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
    //MAP
    const mapImage = assets(g_mapImageURL)
    
    const [ onLoading, setOnLoading ] = useState(false)
    const [ landData, setLandData ] = useState(props.landData)
    const [ upgradeEndingTime, setUpgradeEndingTime ] = useState(null)
    const [ upgradeRemainingTime, setUpgradeRemainingTime ] = useState(null)
    const [ upgradeEndingTimer, setUpgradeEndingTimer ] = useState(null)

    const [banner, setBanner] = useState({})
    const loadBannerData = () => {
        setOnLoading(true)
        axios
        .post("/api/m1/land/getBannerLand", {
            address: props.metamask.walletAccount,
            idLandInstance: landData.info.id
        })
        .then((response) => {
            console.log('getBannerLand response', response.data)
            if ( response.data.success ) {
                setBanner(response.data.data);
                setOnLoading(false)
            }
        })
        .catch((error) => {
            error.response.status == 500 && props.callback_Logout()
            error.response.status == 401 && props.callback_Logout()
        });
    }
    useEffect(() => {
        const landData = JSON.parse(JSON.stringify(props.landData))
        if ( landData.info.upgradeStatus == 1 ) {
            setUpgradeEndingTime(landData.info.upgradeEndingTime)
        }
        setLandData(props.landData)
        setMapZoom(g_defaultMapZoom)
        setOnLoading(false)
        loadBannerData()
    }, [props.landData])
    useEffect(() => {
        if (!upgradeEndingTime) return
        clearInterval(upgradeEndingTimer)
        setUpgradeEndingTimer(setInterval(() => {
            setUpgradeRemainingTime(getRemainingTime_InMinute(upgradeEndingTime))
        }, 1000))
    }, [upgradeEndingTime])
    useEffect(() => {
        if (upgradeRemainingTime < 0) {
            clearInterval(upgradeEndingTimer)
            setOnLoading(true)
            props.callback_getLandOwner()
        }
    }, [upgradeRemainingTime])

    const onVisitCity = () => {
        props.gameCallback_onVisitCity(selectedCityInfo)
        setOnLoading(true)
    }

    const [ selectedCityInfo, setSelectedCityInfo ] = useState(null)
    const onCityClick = (cityInfo) => {
        console.log('city click', cityInfo)
        setSelectedCityInfo(cityInfo)
        setShowBubbleInfo(true)
    }
    const visitHomeCity = (info) => {
        props.gameCallback_onVisitCity(info)
        setOnLoading(true)
    }
    const [showBubbleInfo, setShowBubbleInfo] = useState(false)
    const onBubbleModalClick = (e) => {
        if ( e.target == bubbleModal.current ) {
            setShowBubbleInfo(false);
        }
    }
    const bubbleModal = useRef(null)

    return (
        <>
            <div className={'landComponent' + (props.isVisible ? '' : ' notVisible')}
                onWheel={(e) => onWheelHandler(e)}
                onTouchStart={(e) => onTouchStartHandler(e)}
                onTouchMove={(e) => onTouchMoveHandler(e)}
                onTouchEnd={(e) => onTouchEndHandler(e)}
                onTouchCancel={(e) => onTouchEndHandler(e)}
                onMouseDown={(e) => onMouseDownHandler(e)}
                onMouseMove={(e) => onMouseMoveHandler(e)}
                onMouseUp={(e) => onMouseUpHandler(e)} >
                <div className='upgrade-banner'>
                    {banner.banner && banner.banner.display == 1 && <>
                    <div className='desc'>{banner.banner.message}</div>
                    </>}
                    <div className='land-desc-info'>
                        {landData.info.home == 1 && <img className='home-mark' src={homeMark} />}
                        <div className='land-info'>
                            <div className='max-spot'>
                                Spot : <b>{landData.cities.length}</b> (/{landData.info.maxSpot})
                            </div>
                        </div>
                        {landData.info.upgradeStatus == 1 && 
                        <span className='remainingTime'>
                            Next Upgrade Spot: <b>{
                            `${msToTime(upgradeRemainingTime).hours}:${msToTime(upgradeRemainingTime).minutes}:${msToTime(upgradeRemainingTime).seconds}`
                            }</b>
                        </span>}
                    </div>
                </div>
                
                { birds.map((bird, index) => (
                    bird.valid && <Bird key={index} {...bird} index={index} setValid={setValid} mapPosition={mapPosition} mapZoom={mapZoom} mapSize={mapSize} />
                ))}
                <div className={'dolphins' + (!showDolphin?' notVisible':'')} style={{left: mapPosition.x + dolphinPos.x*mapSize.width/g_mapSize.width, top: mapPosition.y + dolphinPos.y*mapSize.height/g_mapSize.height}}>
                    <div className='dolphin' style={{/* zoom: mapZoom */}}></div>
                </div>
                <div className='map'>
                    <img src={!landData.info.mapImage ? mapImage : assets(landData.info.mapImage)} draggable={false} style={{left: mapPosition.x, top: mapPosition.y, width: mapSize.width, height: mapSize.height}} alt="map" />
                </div>
                <div className='cities'>
                    { landData.cities.map((city, index) => (
                        <City 
                            key={index} 
                            info={city}
                            landPos={landData.info.positions} 
                            size={citySize} 
                            mapSize={mapSize} 
                            mapPosition={mapPosition}
                            clickHandler={onCityClick}
                            visitHomeCity={visitHomeCity}
                        />
                    )) }
                </div>
            </div>
            {showBubbleInfo && <div ref={bubbleModal} className='bubbleModal' onClick={(e) => {onBubbleModalClick(e)}}>
                {/* <div className='line line1'></div>
                <div className='line line2'></div>
                <div className='line line3'></div>
                <div className='line line4'></div> */}
                <div className='bubble-info-panel'>
                    <div className={'visit-mark' + (selectedCityInfo.isVisitable ? '' : ' notAllowed')} onClick={onVisitCity}>
                        {selectedCityInfo.isVisitable ? <VisibilityIcon className='eyeIcon' /> : <VisibilityOffIcon className='eyeIcon' />}
                    </div>
                    <div className='city-info'>
                        <div className='city-images'>
                            <img src={selectedCityInfo.cityImage || assets(g_cityImageURL)} className='city-image' />
                            <img src={selectedCityInfo.imageEmblem || assets(g_cityImageURL)} className='emblem-image' />
                        </div>
                        <div className='city-name'>{selectedCityInfo.cityName || 'NO-NAME'}</div>
                        <div className='experience'><b>{format(selectedCityInfo.experience ? selectedCityInfo.experience : 0)}</b> Exp</div>
                        <div className='start-time'>From : <b>{getShortData(selectedCityInfo.startingTime)}</b></div>
                    </div>
                </div>
            </div>}
            { onLoading ?
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
            : null }
        </>
    )
}

function City({ info, landPos, size, mapSize, mapPosition, clickHandler, visitHomeCity }) {
    const [hover, setHover] = useState(false)
    // const cityImage = assets(g_cityImageURL)
    const cityImage = 'https://ancient-society.s3.eu-central-1.amazonaws.com/sprite/townhall/1.webp'
    const getCityImage = () => {
        if ( info.thLevel == undefined || info.thLevel == null || info.thLevel < 4 ) {
            return './Lvl1.png';
        } else if ( info.thLevel < 7 ) {
            return './Lvl2.png';
        } else if ( info.thLevel < 10 ) {
            return './Lvl3.png';
        } else {
            return './Lvl4.png';
        }
    }
    return (
        <div className='city'
            style={{width: size.width, height: size.height,
                left: mapPosition.x + landPos[info.position].x*mapSize.width/g_mapSize.width,
                top: mapPosition.y + landPos[info.position].y*mapSize.height/g_mapSize.height
            }}>
            {info.home == 1 ? <div className='my-city-mark' onClick={() => {visitHomeCity(info)}}>
                <div className='home-mark'>MY CITY</div>
            </div> : <div className='other-city-mark' onClick={() => {clickHandler(info)}}>
                <div className='other-mark'>{info.cityName == '' ? info.owner : info.cityName}</div>
            </div>}
            <div onClick={() => {clickHandler(info)}} className={'slot'} onMouseEnter={() => {setHover(true)}} onMouseLeave={() => {setHover(false)}}>
            </div>
            <img src={assets(getCityImage())} className="cityImage" draggable={false} style={{width: size.width, height: size.height, transform: hover?"scale(1.2)":"", filter: hover?"drop-shadow(1px 1px 0 white) drop-shadow(-1px -1px 0 white) drop-shadow(1px -1px 0 white) drop-shadow(-1px 1px 0 white)":"drop-shadow(1px 1px 0 rgba(255, 255, 255, 0.5)) drop-shadow(-1px -1px 0 rgba(255, 255, 255, 0.5)) drop-shadow(1px -1px 0 rgba(255, 255, 255, 0.5)) drop-shadow(-1px 1px 0 rgba(255, 255, 255, 0.5))"}} alt={info.name} />
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

export default Land