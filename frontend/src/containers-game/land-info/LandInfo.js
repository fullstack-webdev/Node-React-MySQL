import './land-info.scss';

import {
  useEffect,
  useState,
} from 'react';

import axios from 'axios';

import CancelIcon from '@mui/icons-material/Cancel';
import DoneIcon from '@mui/icons-material/Done';
import EditIcon from '@mui/icons-material/Edit';
import {
  Button,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
} from '@mui/material';

import { playSound } from '../../utils/sounds';
import { getShortData } from '../../utils/utils';

const classNameForComponent = 'land-info' // ex: game-inventory
const componentTitle = 'Land-Info' // ex: Inventory
const hasTab = true // true if this component has tabs
const tabNames = ['Land', 'Contract'] // tab display names

function LandInfo/* Component_Name_You_Want */(props) {
    const [ onLoading, setOnLoading ] = useState(true)
    
    const [ landData, setLandData ] = useState(props.landData)
    useEffect(() => { setLandData(props.landData) }, [props.landData])

    const [landInfo, setLandInfo] = useState({})
    
    useEffect(() => {
        reloadData()
    }, [])
    const reloadData = () => {
        setOnLoading(true);
        axios
        .post("/api/m1/land/getLandInfo", {
            address: props.metamask.walletAccount,
            idLandInstance: landData.info.id
        })
        .then((response) => {
            console.log('getLandInfo response', response.data)
            if ( response.data.success ) {
                setLandInfo(response.data.data);
                setOnLoading(false)
            }
        })
        .catch((error) => {
            error.response.status == 500 && props.callback_Logout()
            error.response.status == 401 && props.callback_Logout()
        });
    }

    const [ currentTabIndex, setCurrentTabIndex ] = useState(0)
    const tabChanged = (index) => {
        if ( currentTabIndex === index ) {
            return
        }
        setCurrentTabIndex(index)
    }

    const [ doingAction, setDoingAction ] = useState(false);
    const [ confirmActionType, setConfirmActionType ] = useState('');
    const [ confirmModalOpen, setConfirmModalOpen ] = useState(false);
    const onDoAction = (actionType) => {
        setConfirmActionType(actionType)
        setConfirmModalOpen(true)
    }
    const onCloseConfirmModal = () => {
        setConfirmModalOpen(false);
    }
    const proceedAction = () => {
        onCloseConfirmModal();
        setDoingAction(true);
        if ( confirmActionType == 'upgrade' ) {
            axios({
                method: 'post',
                url: '/api/m1/land/upgradeLand',
                data: {
                    address: props.metamask.walletAccount,
                    idLandInstance: landData.info.id,
                    consumableIds: []
                }
            })
            .then(response => {
                try {
                    onDidAction(response);
                } catch ( error ) {
                    console.log(error);
                }
            })
            .catch(error => {
                error.response.status == 500 && props.callback_Logout()
                error.response.status == 401 && props.callback_Logout()
            })
        } else if ( confirmActionType == 'claim' ) {
            axios({
                method: 'post',
                url: '/api/m1/land/claimStorageOwner',
                data: {
                    address: props.metamask.walletAccount,
                    idLandInstance: landData.info.id
                }
            })
            .then(response => {
                try {
                    onDidAction(response);
                } catch ( error ) {
                    console.log(error);
                }
            })
            .catch(error => {
                error.response.status == 500 && props.callback_Logout()
                error.response.status == 401 && props.callback_Logout()
            })
        }
    }
    // response process
    const [actionResModalOpen, setActionResModalOpen] = useState(false)
    const [actionRes, setActionRes] = useState(null)
    const [resActionType, setResActionType] = useState('')
    const onDidAction = (response) => {
        console.log(response)
        playSound(confirmActionType)
        if ( response.data.success ) {
            const res = response.data.data;
            console.log(res);
            if ( confirmActionType == 'upgrade' ) {
                reloadData();
            } else if ( confirmActionType == 'claim' ) {
                reloadData();
                props.callback_setInventory(response.data.data.resources);
            } else {
                setLandInfo({...landInfo, name: newLandName});
                setLandNameEdit(false);
            }
        }
        setActionRes(response)
        setResActionType(confirmActionType)
        setDoingAction(false)
        setActionResModalOpen(true)
    }
    const onCloseActionResModal = () => {
        setActionResModalOpen(false)
        setResActionType('')
    }

    // landName Edit
    const [landNameEdit, setLandNameEdit] = useState(false)
    const [newLandName, setNewLandName] = useState('')
    const onEditLandName = () => {
        setNewLandName(landInfo.name);
        setLandNameEdit(true);
    }
    const onUpdateLandName = () => {
        setDoingAction(true);
        axios({
            method: 'post',
            url: '/api/m1/land/setLandName',
            data: {
                address: props.metamask.walletAccount,
                idLandInstance: landData.info.id,
                landName: newLandName
            }
        })
        .then(response => {
            try {
                if ( response.data.success ) {
                    onDidAction(response);
                }
            } catch ( error ) {
                console.log(error);
            }
        })
        .catch(error => {
            error.response.status == 500 && props.callback_Logout()
            error.response.status == 401 && props.callback_Logout()
        })
    }
    const onCancelLandNameEdit = () => {
        setLandNameEdit(false);
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
                        <span className={'loader'}></span>
                    </div>}

                    { hasTab &&
                    <div className='tab-navs'>
                        { tabNames.map((tabName, index) => ( 
                            (index == 0 || landInfo.isPrivate == 0 || landInfo.owned == 1) && 
                            <div key={index} className={'tab-nav ' + (currentTabIndex === index ? 'active' : '')} onClick={() => tabChanged(index)}>{tabName}</div>
                        ))}
                    </div>}
                    <div className='scroll-content'>
                        { !onLoading && <>
                            {currentTabIndex == 0 && <div className='tab land-tab'>
                                <div className='landinfo-left-panel'>
                                    <div className='land-info'>
                                        <a>Type : </a>
                                        <a>{landInfo.landType}</a>
                                    </div>
                                    <div className='land-info'>
                                        <a>Rarity : </a>
                                        <a>{landInfo.rarity}</a>
                                    </div>
                                    <div className='land-info'>
                                        <a>Bonus : </a>
                                        <a>{landInfo.bonus}</a>%
                                    </div>
                                    <div className='land-info level'>
                                        <a>Lvl : </a>
                                        <a>{landInfo.upgradeInfo.level}</a>
                                    </div>
                                    <div className='land-info'>
                                        <a>Max Spot : </a>
                                        <a>{landInfo.maxSpot}</a>
                                    </div>
                                    <div className='land-info'>
                                        <a>Land Name : </a>
                                        <a className={landNameEdit ? 'landName-update-panel' : 'landName-edit-panel'}>
                                            {landNameEdit ? 
                                            <input 
                                                className={'landNameInput'}
                                                placeholder='xxx'
                                                /* maxLength="10" */
                                                value={newLandName}
                                                onChange={(e) => {
                                                    setNewLandName(e.target.value);
                                                }}
                                            />
                                             : landInfo.name}
                                            {landInfo.owned == 1 && <>
                                                <div className='land-name-edit-panel'>
                                                    {!landNameEdit && <IconButton
                                                        className={"iconBtn editBtn"}
                                                        onClick={onEditLandName}
                                                        aria-label="editLandName"
                                                        >
                                                        <EditIcon />
                                                    </IconButton>}
                                                    {landNameEdit && <IconButton
                                                        className={"iconBtn updateBtn" + (newLandName == '' ? ' notAllowed' : '')}
                                                        onClick={onUpdateLandName}
                                                        aria-label="unSell"
                                                        >
                                                        <DoneIcon />
                                                    </IconButton>}
                                                    {landNameEdit && <IconButton
                                                        className={"iconBtn cancelBtn" + (landNameEdit ? ' notAllowed' : '')}
                                                        onClick={onCancelLandNameEdit}
                                                        aria-label="unSell"
                                                        >
                                                        <CancelIcon />
                                                    </IconButton>}
                                                </div>
                                            </>}
                                        </a>
                                    </div>
                                    {landInfo.upgradeInfo.upgradeStatus == 1 &&<div className='land-info upgradeEndingTime'>
                                        <a>Upgrade Ending Time : </a>
                                        <a>{getShortData(landInfo.upgradeInfo.upgradeEndingTime)}</a>
                                    </div>}
                                </div>
                                <div className='landinfo-right-panel'>
                                    <div className='land-info'>
                                        <a>Owner : </a>
                                        <a>{landInfo.ownerInfo.cityName}</a>
                                    </div>
                                    <div className='land-info'>
                                        <div className='city-image'>
                                            <img src={landInfo.ownerInfo.cityImage} />
                                        </div>
                                        <div className='emblem-image'>
                                            <img src={landInfo.ownerInfo.imageEmblem} />
                                        </div>
                                    </div>
                                    <div className='land-info'>
                                        <a>Exp : </a>
                                        <a>{landInfo.ownerInfo.experience || 0}</a>
                                    </div>
                                </div>
                            </div>
                            }
                            {currentTabIndex == 1 && <div className='tab contract-tab'>
                                {landInfo.contractInfo.creationTime ? <><div className='landinfo-left-panel'>
                                    <div className='land-info'>
                                        <a>Fee : </a>
                                        <a>{landInfo.contractInfo.fee}</a>%
                                    </div>
                                    <div className='land-info'>
                                        <a>Creation Time : </a>
                                        <a>{getShortData(landInfo.contractInfo.creationTime)}</a>
                                    </div>
                                    <div className='land-info'>
                                        <a>Ending Time : </a>
                                        <a>{getShortData(landInfo.contractInfo.endingTime)}</a>
                                    </div>
                                    <div className='land-info'>
                                        <a>Generated Tickets : </a>
                                        <a>{landInfo.ticketInfo.generatedTicketCount ? landInfo.ticketInfo.generatedTicketCount : 0}</a>
                                    </div>
                                    <div className='land-info'>
                                        <a>Free Tickets : </a>
                                        <a>{landInfo.ticketInfo.freeTicketCount ? landInfo.ticketInfo.freeTicketCount : 0}</a>
                                    </div>
                                    <div className='land-info'>
                                        <a>Paid Tickets : </a>
                                        <a>{landInfo.ticketInfo.paidTicketCount ? landInfo.ticketInfo.paidTicketCount : 0}</a>
                                    </div>
                                </div>
                                    {landInfo.owned == 1 ? <><div className='landinfo-right-panel'>
                                        <div className='upgrade-panel'>
                                            {landInfo.upgradeInfo.upgradeAllowed ? <>
                                            <div className='upgrade-desc'>
                                                Upgrade
                                            </div>
                                            <div className='cost-list'>
                                                {landInfo.upgradeInfo.UpgradeCost.length == 0 &&
                                                <div className='noRequirementsText'>No requirements</div>}
                                                {landInfo.upgradeInfo.UpgradeCost.map((requirement, index) => (
                                                    <div key={index} className={'cost' + (requirement.isAllowed ? '' : ' notAllowed')}>
                                                        <div className='costDesc'>
                                                            <span className='costQuantity'>x {requirement.quantity}</span>
                                                            <span className='costName'>{requirement.name}</span>
                                                        </div>
                                                        <img className='costImg' src={requirement.image} />
                                                    </div>
                                                ))}
                                            </div>
                                            {landInfo.owned == 1 && landInfo.upgradeInfo.isUpgradable && <div className='actionBtn'>
                                            <Button 
                                                variant="contained" 
                                                className={'upgradeBtn'}
                                                onClick={() => { onDoAction('upgrade') }}
                                            >Upgrade</Button>
                                            </div>}
                                            </> : <>
                                            <div className='upgrade-desc'>
                                                Already at Max Level
                                            </div>
                                            </>}
                                        </div>
                                        <div className='claim-panel'>
                                            <div className='land-info claim-desc'>
                                                <a>Storage : </a>
                                                <a>{landInfo.storage || 0}</a>
                                            </div>
                                            {landInfo.owned == 1 &&  <div className='actionBtn'>
                                            <Button 
                                                variant="contained" 
                                                className={'claimBtn'}
                                                onClick={() => { onDoAction('claim') }}
                                            >Claim</Button>
                                            </div>}
                                        </div>
                                    </div>
                                    </> : 
                                    <div className='noContractDesc'>
                                        No Upgrade Info
                                    </div>
                                    }
                                </> :
                                <div className='noContractDesc'>
                                    No contract established for this land
                                </div>
                                }
                            </div>
                            }
                        </>
                        }
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
                        Do you want to {confirmActionType}?
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
                        {actionRes?.data.success ? 'Successfully done!' : actionRes?.data.error || 'Error occurred!'}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onCloseActionResModal} autoFocus>
                        Ok!
                    </Button>
                </DialogActions>
            </props.ConfirmContext.ConfirmedDialog>
        </div>
        {/* { onLoading ?
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

export default LandInfo // Component_Name_You_Want