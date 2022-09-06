import './game-prestige.scss';

import {
  useEffect,
  useState,
} from 'react';

import axios from 'axios';

import {
  Button,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

import { playSound } from '../../utils/sounds';

const classNameForComponent = 'game-prestige' // ex: game-inventory
const componentTitle = 'Prestige' // ex: Inventory
const hasTab = false // true if this component has tabs
const tabNames = ['A', 'B', 'C', 'D', 'E'] // tab display names

function GamePrestige/* Component_Name_You_Want */(props) {
    const [nftInfo, setNftInfo] = useState(props.nftInfo)
    useEffect(() => {
        setNftInfo(props.nftInfo)
        console.log('nftInfo', nftInfo)
    }, [props.nftInfo])

    const [onLoading, setOnLoading] = useState(true)
    const [prestigeData, setPrestigeData] = useState({})
    useEffect(() => {
        setOnLoading(true)
        axios({
            method: 'post',
            url: '/api/m1/buildings/getPrestigeData',
            data: {
                address: props.metamask.walletAccount,
                buildingType: nftInfo.type,
                level: nftInfo.level
            }
        })
            .then(response => {
                try {
                    if (response.data.success) {
                        const res = response.data.data
                        console.log('getPrestigeData', res)
                        setPrestigeData(res)
                        setOnLoading(false)
                    } else {
                        props.callback_Logout() //Logout because the user forced the API
                    }
                } catch (err) {
                    console.error(err)
                }
            })
            .catch(error => {
                error.response.status == 500
                    && props.callback_Logout()

                error.response.status == 401
                    && props.callback_Logout()
            })
    }, [])

    const [currentTabIndex, setCurrentTabIndex] = useState(0)
    const tabChanged = (index) => {
        if (currentTabIndex === index) {
            return
        }
        setCurrentTabIndex(index)
    }

    // confirm and confirmed modals manage | api call
    const [doingAction, setDoingAction] = useState(false);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [confirmActionType, setConfirmActionType] = useState('');
    const onDoAction = () => {
        setConfirmActionType('prestige')
        setConfirmModalOpen(true)
    }
    const onCloseConfirmModal = () => {
        setConfirmModalOpen(false);
    }
    const proceedAction = () => {
        onCloseConfirmModal();
        setDoingAction(true);
        axios({
            method: 'post',
            url: '/api/m1/buildings/doPrestige',
            data: {
                address: props.metamask.walletAccount,
                buildingType: nftInfo.type,
                level: nftInfo.level
            }
        })
            .then(response => {
                onDidAction(response)
            })
            .catch(error => {
                error.response.status == 500 && props.callback_Logout()
                error.response.status == 401 && props.callback_Logout()
            })
    }

    // response process
    const [actionResModalOpen, setActionResModalOpen] = useState(false)
    const [actionRes, setActionRes] = useState(null)
    const [resActionType, setResActionType] = useState('')
    const onDidAction = (response) => {
        console.log(response)
        playSound(confirmActionType)
        setActionRes(response)
        setResActionType(confirmActionType)
        setDoingAction(false)
        setActionResModalOpen(true)
    }
    const onCloseActionResModal = () => {
        setActionResModalOpen(false)
        setResActionType('')
        props.prestigeDone();
    }

    return (<>
        <div className={'game-component ' + classNameForComponent}>
            <div className='game-container'>
                <div className='header'>
                    <span className='title'>{componentTitle}</span>
                </div>
                <div className='content'>
                    {(onLoading || doingAction) &&
                        <div className='api-loading'>
                            <span className='apiCallLoading'></span>
                            <span className={'loader ' + confirmActionType + '-loader'}></span>
                        </div>}

                    {hasTab &&
                        <div className='tab-navs'>
                            {tabNames.map((tabName, index) => (
                                <div key={index} className={'tab-nav ' + (currentTabIndex === index ? 'active' : '')} onClick={() => tabChanged(index)}>{tabName}</div>
                            ))}
                        </div>}
                    <div className='scroll-content'>
                        {hasTab &&
                            <div className='tab-content'>
                                {/* add tab content here */}
                                <span style={{ color: 'white' }}> {currentTabIndex + 1}th Tab </span>
                            </div>}
                        {!onLoading && <>
                            <div className="prestige-left-panel">
                                <div className='nft-image'>
                                    <img src={nftInfo.imageSprite} />
                                    <div className='nft-level'>
                                        Lvl +<a className={nftInfo.levelMax ? 'max' : ''}>{nftInfo.levelMax ? `${nftInfo.level}(MAX)` : nftInfo.level}</a>
                                    </div>
                                </div>
                            </div>
                            <div className="prestige-right-panel">
                                <div className="prestige-description">
                                    There will be some drops if you reset NFT-level. <br />
                                    The NFT lvl will be 1.
                                </div>
                                <div className='action-panel'>
                                    <Button variant="contained" className={prestigeData.length == 0 ? 'notAllowed' : ''} onClick={onDoAction}>
                                        Prestige
                                    </Button>
                                </div>
                                <div className="drops-view">
                                    {prestigeData.map((drop, index) => (
                                        <div key={index} className="drop">
                                            <div className='drop-desc'>
                                                <span className='drop-quantity'>x {drop.dropQuantity}</span>
                                                <span className='drop-name'>{drop.name}</span>
                                            </div>
                                            <img className='drop-img' src={drop.image} />
                                        </div>
                                    ))}
                                    <div className='noDropDescription'>There is no drop for prestige</div>
                                </div>
                            </div>
                        </>}
                    </div>
                </div>
            </div>
            <props.ConfirmContext.ConfirmationDialog
                open={confirmModalOpen}
                onClose={onCloseConfirmModal}
            >
                <DialogTitle>
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Do you want to prestige?<br />The NFT will be LVL +1.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={proceedAction} autoFocus>
                        Sure
                    </Button>
                </DialogActions>
            </props.ConfirmContext.ConfirmationDialog>
            <props.ConfirmContext.ConfirmedDialog
                open={actionResModalOpen}
                onClose={onCloseActionResModal}
            >
                <DialogTitle>
                    {actionRes?.data.success ? 'Success!' : 'Failed!'}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {actionRes?.data.success ? 'Successfully done!' : actionRes?.data.error}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onCloseActionResModal} autoFocus>
                        Ok!
                    </Button>
                </DialogActions>
            </props.ConfirmContext.ConfirmedDialog>
        </div>
        {/*  { onLoading ?
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
    </>)
}

export default GamePrestige // Component_Name_You_Want