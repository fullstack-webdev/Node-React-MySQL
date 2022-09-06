import './world.scss';
import 'react-toastify/dist/ReactToastify.css';

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { ToastContainer } from 'react-toastify';

import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import {
  Button,
  DialogActions,
  DialogContent,
  DialogContentText,
} from '@mui/material';
import TextField from '@mui/material/TextField';

import cityImage from '../../assets-game/CityIcon.jpg';
import ForestImg from '../../assets-game/ForestIcon.png';
import homeMark from '../../assets-game/homeMark.png';
import MountainImg from '../../assets-game/MountainIcon.png';
import { landPositions } from '../../utils/landPositions';

// initial infos

const g_defaultScale = 1.0
const g_minimumScale = 0.5
const g_maximumScale = 1.2
const g_unitScale = 0.1

const g_mapSize = {width: 10000, height: 10000}
const g_landSize = {width: 150, height: 110}
const g_landAreaSize = {width: 200, height: 150};

// the main component
function World(props) {
    // responsive screen
    const {orientation} = useOrientation()
    const {windowSize} = useWindowSize()
    const prevWindowSizeRef = useRef({width: 0, height: 0})

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
    useEffect(() => {
        if ( orientation === -90 ) {
            alert('Please don\'t rotate your phone at this side, it could cause some unexpected problems')
        }
    }, [orientation])
    useEffect(() => {
        var xPos, yPos
        if ( prevWindowSizeRef.current.width === 0 || prevWindowSizeRef.current.height === 0 ) {
            xPos = yPos = 0
        } else {
            var xPos = mapPositionRef.current.x * windowSize.width / prevWindowSizeRef.current.width / 2
            var yPos = mapPositionRef.current.y * windowSize.height / prevWindowSizeRef.current.height / 2
            xPos = Math.min(xPos, (g_mapSize.width - windowSize.width) / 2)
            xPos = Math.max(xPos, -(g_mapSize.width - windowSize.width) / 2)
            yPos = Math.min(yPos, (g_mapSize.height - windowSize.height) / 2)
            yPos = Math.max(yPos, -(g_mapSize.height - windowSize.height) / 2)
        }
        mapPositionRef.current.x = xPos
        mapPositionRef.current.y = yPos
        setMapPosition({x: xPos, y: yPos})
        prevWindowSizeRef.current.width = windowSize.width
        prevWindowSizeRef.current.height = windowSize.height
    }, [windowSize])

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
            var xPos = mapPositionRef.current.x + e.screenX - mouseDownPosition.x, yPos = mapPositionRef.current.y + e.screenY - mouseDownPosition.y
            xPos = Math.min(xPos, (g_mapSize.width - windowSize.width) / 2)
            xPos = Math.max(xPos, -(g_mapSize.width - windowSize.width) / 2)
            yPos = Math.min(yPos, (g_mapSize.height - windowSize.height) / 2)
            yPos = Math.max(yPos, -(g_mapSize.height - windowSize.height) / 2)
            mapPositionRef.current.x = xPos
            mapPositionRef.current.y = yPos
            setMapPosition({x: xPos, y: yPos})
            setMouseDownPosition({x: e.screenX, y: e.screenY})
        }
    }
    const onTouchMoveHandler = (e) => {
        if ( e.touches.length === 2 ) {
            const currentDiffOfTouches = Math.pow(Math.abs(e.touches[0].screenX - e.touches[1].screenX), 2) + Math.pow(Math.abs(e.touches[0].screenY - e.touches[1].screenY), 2)
            if ( currentDiffOfTouches > prevDiffOfTouches ) {
                zoomIn();
            } else {
                zoomOut();
            }
            setPrevDiffOfTouches(currentDiffOfTouches)
        } else {
            e = e.touches[0];
            if ( mapMoving ) {
                var xPos = mapPositionRef.current.x + (e.screenX - mouseDownPosition.x), yPos = mapPositionRef.current.y + (e.screenY - mouseDownPosition.y)
                xPos = Math.min(xPos, (g_mapSize.width - windowSize.width) / 2)
                xPos = Math.max(xPos, -(g_mapSize.width - windowSize.width) / 2)
                yPos = Math.min(yPos, (g_mapSize.height - windowSize.height) / 2)
                yPos = Math.max(yPos, -(g_mapSize.height - windowSize.height) / 2)
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
    
    const [ onLoading, setOnLoading ] = useState(false);
    const [worldData, setWorldData] = useState({});
    useEffect(() => {
        let lands = JSON.parse(JSON.stringify(props.worldData.lands))
        for ( let land of lands ) {
            const pos = landPositions[land.index];
            land.constPosition = {x: pos.x * g_landAreaSize.width + parseInt(Math.random() * (g_landAreaSize.width - g_landSize.width) * 0.8), y: pos.y * g_landAreaSize.height + parseInt(Math.random() * (g_landAreaSize.height - g_landSize.height) * 0.8)};
            land.position = {x: land.constPosition.x , y: land.constPosition.y}
        }
        console.log(lands)
        setWorldData({lands: JSON.parse(JSON.stringify(lands)), info: props.worldData.info})
    }, [props.worldData])

    const [scale, setScale] = useState(g_defaultScale);
    const [landSize, setLandSize] = useState(g_landSize);
    useEffect(() => {
        if ( worldData.lands == undefined ) {
            return
        }
        const landSize1 = {width: g_landSize.width * scale, height: g_landSize.height * scale};
        setLandSize(landSize1);
        let lands = JSON.parse(JSON.stringify(worldData.lands))
        for ( let land of lands ) {
            land.position = {x: land.constPosition.x * scale , y: land.constPosition.y * scale}
        }
        setWorldData({lands: JSON.parse(JSON.stringify(lands)), info: worldData.info})
    }, [scale]);
    const zoomIn = () => {
        setScale(Math.min(scale + g_unitScale, g_maximumScale));
    }
    const zoomOut = () => {
        setScale(Math.max(scale - g_unitScale, g_minimumScale));
    }
    const onWheelHandler = (e) => {
        if ( e.deltaY < 0 ) {
            zoomIn();
        } else {
            zoomOut();
        }
    }

    const [isVisible, setIsVisible] = useState(true);
    useEffect(() => { setIsVisible(props.isVisible) }, [props.isVisible]);

    const [ searchLandData, setSearchLandData ] = useState('')
    const onSearchLandDataChange = (e) => {
        var searchData = e.target.value;
        setSearchLandData(searchData)
        var i
        for ( i = 0 ; i < worldData.lands.length ; ++ i ) {
            var land = worldData.lands[i];
            if ( searchData != '' && (searchData.toLowerCase().includes(land.name.toLowerCase()) || land.name.toLowerCase().includes(searchData.toLowerCase())) ) {
                break;
            }
        }
        if ( i < worldData.lands.length ) {
            var searchLand = worldData.lands[i]
            var xPos = -searchLand.position.x - g_landSize.width / 2
            var yPos = -searchLand.position.y - g_landSize.height / 2
            mapPositionRef.current.x = xPos
            mapPositionRef.current.y = yPos
            setMapPosition({x: xPos, y: yPos})
        }
    }

    const [visitLand, setVisitLand] = useState(null)
    const onLandClick = (landInfo) => {
        setVisitLand(landInfo);
        setConfirmActionType('visit');
        setConfirmModalOpen(true);
    }

    const [ confirmActionType, setConfirmActionType ] = useState('')
    const [confirmModalOpen, setConfirmModalOpen] = useState(false)
    const onCloseConfirmModal = () => {
        setConfirmModalOpen(false)
    }
    const onDoAction = () => {
        setOnLoading(true);
        onCloseConfirmModal();
        props.gameCallback_onVisitLand(visitLand);
    }

    return (
        <>
            <div className={'world' + (isVisible ? '' : ' notVisible')}
                onWheel={(e) => onWheelHandler(e)}
                onTouchStart={(e) => onTouchStartHandler(e)}
                onTouchMove={(e) => onTouchMoveHandler(e)}
                onTouchEnd={(e) => onTouchEndHandler(e)}
                onTouchCancel={(e) => onTouchEndHandler(e)}
                onMouseDown={(e) => onMouseDownHandler(e)}
                onMouseMove={(e) => onMouseMoveHandler(e)}
                onMouseUp={(e) => onMouseUpHandler(e)} >
                <div className='searchLand'>
                    <TextField
                        onChange={(e) => {onSearchLandDataChange(e)}}
                        value={searchLandData}
                        label="Land Data Search" 
                        variant="filled"
                    />
                </div>
                {worldData.info && <div className='info-banner'>
                    {worldData.info.home == 1 && <img className='home-mark' src={homeMark} />}
                    <div className='world-info'>
                        You are located in <a>{worldData.info.name}</a> (<b>{worldData.lands.length}</b>Lands)
                    </div>
                </div>}
                <div className='map' style={{width: g_mapSize.width, height: g_mapSize.height, left: mapPosition.x-(g_mapSize.width-windowSize.width)/2, top: mapPosition.y-(g_mapSize.height-windowSize.height)/2}}>
                    {worldData.lands && worldData.lands.map((land, index) => (
                        <Land
                            searchData={searchLandData}
                            key={index} 
                            info={land}
                            size={landSize}
                            onLandClick={onLandClick}
                        />
                    )) }
                </div>
            </div>
            
            <props.ConfirmContext.ConfirmationDialog
                open={confirmModalOpen}
                onClose={onCloseConfirmModal}
                >
                <DialogContent>
                    <DialogContentText>
                        Do you want to visit "{visitLand?.name}" Land?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onDoAction} autoFocus>
                        Sure
                    </Button>
                </DialogActions>
            </props.ConfirmContext.ConfirmationDialog>

            <ToastContainer 
                position="top-right"
                autoClose={1500}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
            />

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

function Land({ searchData, info, size, onLandClick }) {
    const [hover, setHover] = useState(false)
    return (
        <div className={'land' + (info.owned == 1 ? ' owned' : '') + (info.home == 1 ? ' home' : '') + (searchData != '' && info.name && (searchData.toLowerCase().includes(info.name.toLowerCase()) || info.name.toLowerCase().includes(searchData.toLowerCase())) ? ' searched' : '')}
            style={{width: size.width, height: size.height,
                left: info.position.x + g_mapSize.width / 2,
                top: info.position.y + g_mapSize.height / 2
            }}>
            {size.width > 100 && <div className='owner-info'>
                <img className='owner-cityImage' src={info.ownerInfo.cityImage || cityImage} />
            </div>}
            {info.home == 1 && <div className='my-land-mark'>
                <img className='home-mark' src={homeMark} ></img>
            </div>}
            <div className={'visit-mark'} onClick={() => !info.isPrivate && onLandClick(info)} onMouseEnter={() => {setHover(true)}} onMouseLeave={() => {setHover(false)}}>
                {!info.isPrivate ? <VisibilityIcon className='eyeIcon' /> : <VisibilityOffIcon className='eyeIcon' />}
            </div>
            <img src={info.type == 'mountain' ? MountainImg : ForestImg} className={"landImage" + (info.owned == 1 ? ' owned' : '')} draggable={false} style={{width: size.width, height: size.height, filter: (hover ? (info.owned == 1 ? "drop-shadow(0px 0px 50px rgb(0, 255, 0))" : "drop-shadow(0px 0px 5px rgb(0, 255, 255))") : '')}} alt={info.name} />
            <span className='landName'>{info.name}</span>
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

export default World