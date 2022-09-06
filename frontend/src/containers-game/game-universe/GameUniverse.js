import './game-universe.scss';

import {
  useEffect,
  useState,
} from 'react';

import {
  Button,
  DialogActions,
  DialogContent,
  DialogContentText,
} from '@mui/material';

import homeMark from '../../assets-game/homeMark.png';
import worldImage from '../../assets-game/world.png';

const classNameForComponent = 'game-universe' // ex: game-inventory
const componentTitle = 'Universe' // ex: Inventory
const hasTab = false // true if this component has tabs
const tabNames = ['A', 'B', 'C', 'D', 'E'] // tab display names

function GameUniverse/* Component_Name_You_Want */(props) {
    const [ currentTabIndex, setCurrentTabIndex ] = useState(0)
    const tabChanged = (index) => {
        if ( currentTabIndex === index ) {
            return
        }
        setCurrentTabIndex(index)
    }

    const [ onLoading, setOnLoading ] = useState(true)
    const [ doingAction, setDoingAction ] = useState(false)
    const [ universeData, setUniverseData ] = useState([])
    useEffect(() => {
        props.callback_getUniverse();
    }, [])
    useEffect(() => {
        setUniverseData(props.universeData);
    }, [props.universeData]);
    useEffect(() => {
        setOnLoading(!universeData.worlds || universeData.worlds.length == 0)
    }, [universeData])

    const [visitWorld, setVisitWorld] = useState(null)
    const onWorldClick = (worldInfo) => {
        setVisitWorld(worldInfo);
        setConfirmActionType('visit');
        setConfirmModalOpen(true);
    }

    const [ confirmActionType, setConfirmActionType ] = useState('')
    const [confirmModalOpen, setConfirmModalOpen] = useState(false)
    const onCloseConfirmModal = () => {
        setConfirmModalOpen(false)
    }
    const onDoAction = () => {
      setDoingAction(true);
      onCloseConfirmModal();
      props.callback_onVisitWorld(visitWorld);
    }

    return ( <>
        <div className={'game-component ' + classNameForComponent}>
            <div className='game-container'>
                <div className='header'>
                    <span className='title'>{componentTitle}</span>
                </div>
                <div className='content'>
                    { (onLoading || doingAction) && 
                    <div className='api-loading'>
                        <span className='apiCallLoading'></span>
                        <span className={'loader ' + confirmActionType + '-loader'}></span>
                    </div>}

                    { hasTab &&
                    <div className='tab-navs'>
                        { tabNames.map((tabName, index) => (
                            <div key={index} className={'tab-nav ' + (currentTabIndex === index ? 'active' : '')} onClick={() => tabChanged(index)}>{tabName}</div>
                        ))}
                    </div>}
                    <div className='scroll-content'>
                        { hasTab && 
                        <div className='tab-content'>
                            {/* add tab content here */}
                            <span  style={{color: 'white'}}> {currentTabIndex + 1}th Tab </span>
                        </div>}
                        {!onLoading && <>
                        <div className='visit-desc'>
                            Choose a World to Explore.
                        </div>
                        <div className='universe'>
                            {universeData.worlds && universeData.worlds.map((world, index) => (
                                <div key={index} className={'world-view' + (world.home ? ' home' : '')}>
                                    {world.home && <img className='home-mark' src={homeMark} ></img>}
                                    <img className='world-img' onClick={() => onWorldClick(world)} src={world.image || worldImage} />
                                    <div className='world-name'>{world.name} (<b>{world.landCount}</b> {world.landCount > 1 ? 'lands' : 'land'})</div>
                                </div>
                            ))}
                        </div>
                        </>}
                    </div>
                </div>
            </div>
        </div>
{/*         { onLoading ?
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
        : null } */}
        <props.ConfirmContext.ConfirmationDialog
          open={confirmModalOpen}
          onClose={onCloseConfirmModal}
        >
          <DialogContent>
            <DialogContentText>
                Do you want to visit "{visitWorld?.name}"?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={onDoAction} autoFocus>
                Sure
            </Button>
          </DialogActions>
        </props.ConfirmContext.ConfirmationDialog>
    </>)
}

export default GameUniverse // Component_Name_You_Want