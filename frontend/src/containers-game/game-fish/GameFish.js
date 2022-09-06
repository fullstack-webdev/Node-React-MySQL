import './game-fish.scss';
import '../../json-mockup';

import React, {
  useEffect,
  useState,
} from 'react';

import axios from 'axios';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LockOpenOutlinedIcon from '@mui/icons-material/LockOpenOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import UpgradeIcon from '@mui/icons-material/Upgrade';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  CircularProgress,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';

import BonusBar from '../../components-game/bonus/BonusBar';
import BonusView from '../../components-game/bonus/BonusView';
// import toolRepairingGif from '../../assets-game/toolRepairing.gif';
// import toolUpgradingGif from '../../assets-game/toolUpgrading.gif';
import { playSound } from '../../utils/sounds';
import {
  getRemainingTime_InMinute,
  msToTime,
} from '../../utils/utils';

const ANCIEN_IMAGE = 'https://ancient-society.s3.eu-central-1.amazonaws.com/resources/ancien.webp'

const classNameForComponent = 'game-fish' // ex: game-inventory
const componentTitle = 'Fish' // ex: Inventory
const hasTab = false // true if this component has tabs
const tabNames = ['A', 'B', 'C', 'D', 'E'] // tab display names

function GameFish(props) {
    // Tab
    const [currentTabIndex, setCurrentTabIndex] = useState(0)
    const tabChanged = (index) => {
        playSound('tab')
        if (currentTabIndex === index) {
            return
        }
        setCurrentTabIndex(index)
    }

    const [idDelegate, setIdDelegate] = useState(props.idDelegate)
    useEffect(() => { setIdDelegate(props.idDelegate) }, [props.idDelegate])
    const [delegationData, setDelegationData] = useState(props.delegationData)
    useEffect(() => { setDelegationData(props.delegationData) }, [props.delegationData])

    // Data
    const [onLoading, setOnLoading] = useState(true)
    const [seas, setSeas] = useState([])
    const [seaIndex, setSeaIndex] = useState(0);
    const [rods, setRods] = useState([])
    const [currentInventory, setCurrentInventory] = useState({})
    const [fishermanIsFishing, setFishermanIsFishing] = useState(false)
    const [passiveInfo, setPassiveInfo] = useState({})

    useEffect(() => {
        axios.post('/api/m1/fisherman/getFisherman', {
            address: props.metamask.walletAccount,
            idDelegate: idDelegate
        })
            .then(response => {
                const fishermanResponse = response.data.data.fishermanResponse
                console.log(fishermanResponse)
                updateState(fishermanResponse)
                setOnLoading(false)
            })
            .catch(error => {
                error.response.status == 500 && props.callback_Logout()
                error.response.status == 401 && props.callback_Logout()
            })
    }, [])

    const showSeaInfoHandler = (sIndex) => {
        playSound('popup')
        setOpenConfirmType('info')
        setSeaIndex(sIndex)
    }

    // equippedRod
    const [currentRod, setCurrentRod] = useState({})
    useEffect(() => {
        for (var i = 0; i < rods.length; ++i) {
            if (rods[i].status == 'equipped') {
                setCurrentRod(rods[i])
                break
            }
        }
    }, [rods])

    // ChangeRod Button/Popup
    const onChangeRodClick = (e) => {
        playSound('button')
        // playSound('popup')
        setOpenConfirmType('change')
    }

    const onRodMenuClick = (rod) => {
        playSound('touch')
        onCloseConfirmModal()
        setDoingAction(true)
        setConfirmActionType('change')
        if (rod.status == 'equipped') {
            axios.post('/api/m1/fisherman/unEquipRod', {
                address: props.metamask.walletAccount,
                idDelegate: idDelegate,
                idToolInstance: rod.id
            })
                .then(response => {
                    if (response.data.success) {
                        const res = response.data.data
                        clearInterval(rodEndingTimer)
                        setRodEndingTime(null)
                        setRodRemainingTime(null)
                        var newRods = JSON.parse(JSON.stringify(rods))
                        for (var i = 0; i < newRods.length; ++i) {
                            if (newRods[i].status == 'equipped') {
                                newRods[i].status = 'available'
                                break
                            }
                        }
                        setRods(newRods)
                        setSeas(res.seas)
                        setCurrentRod({})
                    }
                    setDoingAction(false)
                })
                .catch(error => {
                    error.response.status == 500 && props.callback_Logout()
                    error.response.status == 401 && props.callback_Logout()
                })
        } else {
            axios.post('/api/m1/fisherman/changeRod', {
                address: props.metamask.walletAccount,
                idDelegate: idDelegate,
                idToolInstance: rod.id
            })
                .then(response => {
                    if (response.data.success) {
                        const res = response.data.data
                        if (!res.rod.isFishing) {
                            clearInterval(rodEndingTimer)
                            setRodEndingTime(null)
                            setRodRemainingTime(null)
                        } else {
                            setRodEndingTime(res.rod.rodEndingTime)
                        }
                        var newRods = JSON.parse(JSON.stringify(rods))
                        for (var i = 0; i < newRods.length; ++i) {
                            if (newRods[i].status == 'equipped') {
                                newRods[i].status = 'available'
                            } else if (newRods[i].id == rod.id) {
                                for (var x in res.rod) {
                                    newRods[i][x] = res.rod[x]
                                }
                            }
                        }
                        setRods(newRods)
                        setSeas(res.seas)
                        setCurrentInventory(res.equippedRodInstanceData)
                        setPassiveInfo({ ...passiveInfo, maxPerformableActions: res.passiveInfo.maxPerformableActions })
                    }
                    setDoingAction(false)
                })
                .catch(error => {
                    error.response.status == 500 && props.callback_Logout()
                    error.response.status == 401 && props.callback_Logout()
                })
        }
    }

    // FISHING ENDING TIME
    const [fishingEndingTime, setFishingEndingTime] = useState(null)
    const [fishingRemainingTime, setFishingRemainingTime] = useState(null)
    const [fishingEndingTimer, setFishingEndingTimer] = useState(null)
    const [rodEndingTime, setRodEndingTime] = useState(null)
    const [rodRemainingTime, setRodRemainingTime] = useState(null)
    const [rodEndingTimer, setRodEndingTimer] = useState(null)
    const [inCooldown, setInCooldown] = useState(false)

    const [nextStoreTimer, setNextStoreTimer] = useState(null)
    const [nextStoreTime, setNextStoreTime] = useState(null)
    const [nextStoreRemainingTime, setNextStoreRemainingTime] = useState(null)
    useEffect(() => {
        if (!nextStoreTime) return
        clearInterval(nextStoreTimer)
        setNextStoreTimer(setInterval(() => {
            setNextStoreRemainingTime(getRemainingTime_InMinute(nextStoreTime))
        }, 1000))
    }, [nextStoreTime])

    useEffect(() => {
        if (nextStoreRemainingTime < 0) {
            clearInterval(nextStoreTimer)
            setOnLoading(true)
            axios.post('/api/m1/fisherman/getFisherman', {
                address: props.metamask.walletAccount,
                idDelegate: idDelegate
            })
                .then(response => {
                    const fishermanResponse = response.data.data.fishermanResponse
                    console.log(fishermanResponse)
                    updateState(fishermanResponse)
                    setOnLoading(false)
                })
                .catch(error => {
                    error.response.status == 500 && props.callback_Logout()
                    error.response.status == 401 && props.callback_Logout()
                })
        }
    }, [nextStoreRemainingTime])

    useEffect(() => {
        if (!fishingEndingTime) return
        clearInterval(fishingEndingTimer)
        setFishingEndingTimer(setInterval(() => {
            setFishingRemainingTime(getRemainingTime_InMinute(fishingEndingTime))
        }, 1000))
    }, [fishingEndingTime])

    useEffect(() => {
        if (!rodEndingTime) return
        clearInterval(rodEndingTimer)
        setRodEndingTimer(setInterval(() => {
            setRodRemainingTime(getRemainingTime_InMinute(rodEndingTime))
        }, 1000))
    }, [rodEndingTime])

    useEffect(() => {
        if (fishingRemainingTime < 0) clearInterval(fishingEndingTimer)
        if (rodRemainingTime < 0) clearInterval(rodEndingTimer)
        if (rodRemainingTime < 0 && fishingRemainingTime < 0) setInCooldown(false)
        if (rodRemainingTime > 0 || fishingRemainingTime > 0) setInCooldown(true)

    }, [fishingRemainingTime, rodRemainingTime])

    useEffect(() => {
        console.log("coolDown: ", inCooldown)

    }, [inCooldown])

    useEffect(() => {
        console.log("currentInventory: ", currentInventory)

    }, [currentInventory])

    // RepairRod Button/Dialog  
    const onRepairRodClick = () => {
        playSound('button')
        setOpenConfirmType('repair')
    }

    // UpgradeRod Button/Dialog  
    const onUpgradeRodClick = () => {
        playSound('button')
        //setOpenConfirmType('upgrade')
    }

    // Inventory Button
    const onInventoryClick = (e) => {
        playSound('button')
        props.navbarCallback_showComponent('craft-inventory', { id: currentInventory.id })
    }

    // DO FISH
    const [doingAction, setDoingAction] = useState(false)
    const [fishingSea, setFishingSea] = useState(null)

    const onFishClick = (sea) => {
        // playSound('button')
        playSound('confirm')
        setOpenConfirmType('fish');
        setFishingSea(sea)
    }

    const onActionBtnClick = (actionType) => {
        playSound('button')
        playSound('confirm')
        onCloseConfirmModal()
        setConfirmActionType(actionType)
        if (actionType == 'repair') {
            setDoingAction(true);
            axios.post('/api/m1/fisherman/repairRod', {
                address: props.metamask.walletAccount,
                idDelegate: idDelegate,
                idToolInstance: currentInventory.id,
                consumableIds: [repairConsumables[0].id, repairConsumables[1].id]
            })
                .then(response => {
                    console.log('repairRod', response.data.data)
                    onResetConsumables()
                    if (response.data.success) {
                        props.callback_setInventory(response.data.data.storage)
                        updateInventoryData(response)
                        setPassiveInfo({ ...passiveInfo, maxPerformableActions: response.data.data.maxPerformableActions })
                    }
                    setDoingAction(false)
                    onDidAction(response.data)
                })
                .catch(error => console.log(error))
        }
    }

    const updateInventoryData = (response) => {
        if (response.data.success && response.data.data.inventory != undefined) {
            const inventory = response.data.data.inventory
            for (var i = 0; i < inventory.length; ++i) {
                const elements = inventory[i].elements
                for (var j = 0; j < elements.length; ++j) {
                    const action = inventory[i].action, element = elements[j]
                    if (action == 'edit' && element.type == 'tool' && element.id == currentInventory.id) {
                        setCurrentInventory(element)
                        setRods(rods.map((rod) => (rod.id == element.id ? { ...rod, level: element.level, rarity: element.level, durability: element.durability } : rod)))
                        break
                    }
                }
            }
        }
    }

    const onCloseConfirmModal = () => {
        setOpenConfirmType('')
        setActionRes(null)
    }

    const updateState = (fishermanResponse) => {
        setPassiveInfo(fishermanResponse.passiveInfo)
        setHasConsumables(fishermanResponse.hasConsumables)
        setConsumables(fishermanResponse.consumables)
        setSeas(fishermanResponse.seas)
        setRods(fishermanResponse.rods)
        setFishermanIsFishing(fishermanResponse.fishermanIsFishing)
        setCurrentInventory(fishermanResponse.equippedRodInstanceData)
        fishermanResponse.fishermanEndingTime ? setFishingEndingTime(fishermanResponse.fishermanEndingTime) : null
        fishermanResponse.rodEndingTime ? setRodEndingTime(fishermanResponse.rodEndingTime) : null
        fishermanResponse.passiveInfo.nextStoreTime ? setNextStoreTime(fishermanResponse.passiveInfo.nextStoreTime) : null
    }

    const onPassiveAction = () => {
        const confirmType = openConfirmType
        onCloseConfirmModal()
        setConfirmActionType(confirmType)
        setDoingAction(true)
        if (confirmType == 'unlock' || confirmType == 'passive') {
            axios.post('/api/m1/buildings/setPassiveOn', {
                address: props.metamask.walletAccount,
                idDelegate: idDelegate,
                pkBuilding: 1,
                buildingType: 4,
            })
                .then(response => {
                    onResetConsumables()
                    console.log('response', response.data)
                    if (response.data.success) {
                        if (response.data.data.done) {
                            if (response.data.data.storage) {
                                props.callback_setInventory(response.data.data.storage)
                            }
                            updateState(response.data.data.fishermanResponse)
                        }
                    }
                    setDoingAction(false)
                    onDidAction(response.data)
                })
                .catch(error => {
                    error.response.status == 500 && props.callback_Logout()
                    error.response.status == 401 && props.callback_Logout()
                })
        } else if (confirmType == 'active') {
            axios.post('/api/m1/buildings/setPassiveOff', {
                address: props.metamask.walletAccount,
                idDelegate: idDelegate,
                pkBuilding: 1,
                buildingType: 4,
            })
                .then(response => {
                    onResetConsumables()
                    console.log('response', response.data)
                    if (response.data.success) {
                        if (response.data.data.done) {
                            let fishermanRes = response.data.data.fishermanResponse;

                            setPassiveInfo(fishermanRes.passiveInfo)
                            fishermanRes.passiveInfo.nextStoreTime ? setNextStoreTime(fishermanRes.passiveInfo.nextStoreTime) : null
                        }
                    }
                    setDoingAction(false)
                    onDidAction(response.data)
                })
                .catch(error => {
                    error.response.status == 500 && props.callback_Logout()
                    error.response.status == 401 && props.callback_Logout()
                })
        } else if (confirmType == 'passiveUpgrade') {
            axios.post('/api/m1/buildings/upgradePassive', {
                address: props.metamask.walletAccount,
                idDelegate: idDelegate,
                pkBuilding: 1,
                buildingType: 4,
            })
                .then(response => {
                    onResetConsumables()
                    console.log('response', response.data)
                    if (response.data.success) {
                        if (response.data.data.done) {
                            if (response.data.data.storage) {
                                props.callback_setInventory(response.data.data.storage)
                            }
                            updateState(response.data.data.fishermanResponse)
                        }
                    }
                    setDoingAction(false)
                    onDidAction(response.data)
                })
                .catch(error => {
                    error.response.status == 500 && props.callback_Logout()
                    error.response.status == 401 && props.callback_Logout()
                })
        } else if (confirmType == 'burn') {
            axios.post('/api/m1/fisherman/burnPassiveLure', {
                address: props.metamask.walletAccount,
                idDelegate: idDelegate,
                burnLureCount: burnLureCount
            })
                .then(response => {
                    console.log('response', response.data)
                    if (response.data.success) {
                        if (response.data.data.done) {
                            setBurnLureCount(0)
                            let editInfo = response.data.data.passiveInfo
                            console.log(editInfo)
                            setPassiveInfo({ ...passiveInfo, maxPerformableActions: editInfo.maxPerformableActions, lureData: editInfo.lureData, burntActions: editInfo.burntActions })
                        }
                    }
                    setDoingAction(false)
                    onDidAction(response.data)
                })
                .catch(error => {
                    error.response.status == 500 && props.callback_Logout()
                    error.response.status == 401 && props.callback_Logout()
                })
        }
    }

    const onDoAction = () => {
        onCloseConfirmModal()
        if ((passiveInfo.isPassive && passiveInfo.maxPerformableActions == 0)) {
            return
        }
        setDoingAction(true)
        setConfirmActionType('fish');
        if (passiveInfo.isPassive) {
            axios.post('/api/m1/fisherman/startPassiveFishing', {
                address: props.metamask.walletAccount,
                idDelegate: idDelegate,
                idSea: fishingSea.id,
                consumableIds: [null, null],
                actionNumber: passiveInfo.maxPerformableActions
            })
                .then(response => {
                    onResetConsumables()
                    console.log('startPassiveFishing response', response.data)
                    if (response.data.success) {
                        if (response.data.data.storage) {
                            props.callback_setInventory(response.data.data.storage)
                        }
                        setPassiveInfo({ ...passiveInfo, maxPerformableActions: response.data.data.passiveInfo.maxPerformableActions, burntActions: response.data.data.passiveInfo.burntActions, storedActions: response.data.data.passiveInfo.storedActions })
                        setRods(rods.map((rod) => (rod.id == currentRod.id ? { ...rod, isFishing: true, durability: response.data.data.rod.durability } : rod)))
                        setSeas(response.data.data.seas)
                        setFishingEndingTime(response.data.data.fishingEndingTime)
                        setRodEndingTime(response.data.data.rodEndingTime)
                        setHasConsumables(response.data.data.hasConsumables)
                        setConsumables(response.data.data.consumables)
                        setCurrentInventory(response.data.data.equippedRodInstanceData)
                    }
                    setDoingAction(false)
                    onDidAction(response.data)
                })
                .catch(error => {
                    error.response.status == 500 && props.callback_Logout()
                    error.response.status == 401 && props.callback_Logout()
                })
        } else {
            axios.post('/api/m1/fisherman/startFishing', {
                address: props.metamask.walletAccount,
                idDelegate: idDelegate,
                idSea: fishingSea.id,
                consumableIds: [fishConsumables[0].id, fishConsumables[1].id]
            })
                .then(response => {
                    onResetConsumables()
                    console.log('startFishing response', response.data)
                    if (response.data.success) {
                        setRods(rods.map((rod) => (rod.id == currentRod.id ? { ...rod, isFishing: true, durability: response.data.data.rod.durability } : rod)))
                        setSeas(response.data.data.seas)
                        setFishingEndingTime(response.data.data.fishingEndingTime)
                        setRodEndingTime(response.data.data.rodEndingTime)
                        setHasConsumables(response.data.data.hasConsumables)
                        setConsumables(response.data.data.consumables)
                        setCurrentInventory(response.data.data.equippedRodInstanceData)
                    }
                    setDoingAction(false)
                    onDidAction(response.data)
                })
                .catch(error => {
                    error.response.status == 500 && props.callback_Logout()
                    error.response.status == 401 && props.callback_Logout()
                })
        }
    }

    const [openConfirmType, setOpenConfirmType] = useState('');
    const [confirmActionType, setConfirmActionType] = useState(null)
    const [actionResModalOpen, setActionResModalOpen] = useState(false)
    const [actionRes, setActionRes] = useState(null)

    const onUnLockBtnClick = () => {
        playSound('button')
        setOpenConfirmType('unlock')
    }
    const onPassiveBtnClick = () => {
        playSound('button')
        setOpenConfirmType('passive')
    }
    const onPassiveUpgradeBtnClick = () => {
        playSound('button')
        setOpenConfirmType('passiveUpgrade')
    }
    const onActiveBtnClick = () => {
        playSound('button')
        setOpenConfirmType('active')
    }

    const [burnLureCount, setBurnLureCount] = useState(0)
    const onBurnLureBtnClick = () => {
        playSound('button')
        setOpenConfirmType('burn')
    }

    const onDidAction = (response) => {
        playSound('confirm')
        setActionRes(response)
        setActionResModalOpen(true)
    }
    const onCloseActionResModal = () => {
        setConfirmActionType(null)
        setActionResModalOpen(false)
    }

    const [consumableOpen, setConsumableOpen] = useState('')
    const [consumableAnchorEl, setConsumableAnchorEL] = useState(null)

    const onConsumableBtnClick = (e, type) => {
        setConsumableAnchorEL(e.currentTarget)
        setConsumableOpen(type)
    }

    const onCloseConsumable = () => {
        setConsumableOpen('')
    }

    const [hasConsumables, setHasConsumables] = useState(false)
    const [consumables, setConsumables] = useState([])
    const [fishConsumables, setFishConsumables] = useState([{}, {}])
    const [repairConsumables, setRepairConsumables] = useState([{}, {}])
    const [upgradeConsumables, setUpgradeConsumables] = useState([{}, {}])

    const onResetConsumables = (consumType = '') => {
        if (consumType == '') {
            setRepairConsumables([{}, {}])
            setUpgradeConsumables([{}, {}])
            setFishConsumables([{}, {}])
        } else if (consumType == 'fish') {
            setFishConsumables([{}, {}])
        } else if (consumType == 'repair') {
            setRepairConsumables([{}, {}])
        } else if (consumType == 'upgrade') {
            setUpgradeConsumables([{}, {}])
        }
    }

    const onConsumableClick = (consumType, pconsumable) => {
        onCloseConsumable()
        if (consumType == 'fish1') {
            setFishConsumables(fishConsumables.map((consumable, index) => (index == 0 ? pconsumable : consumable)))
        } else if (consumType == 'fish2') {
            setFishConsumables(fishConsumables.map((consumable, index) => (index == 1 ? pconsumable : consumable)))
        } else if (consumType == 'repair1') {
            setRepairConsumables(repairConsumables.map((consumable, index) => (index == 0 ? pconsumable : consumable)))
        } else if (consumType == 'repair2') {
            setRepairConsumables(repairConsumables.map((consumable, index) => (index == 1 ? pconsumable : consumable)))
        } else if (consumType == 'upgrade1') {
            setUpgradeConsumables(upgradeConsumables.map((consumable, index) => (index == 0 ? pconsumable : consumable)))
        } else if (consumType == 'upgrade2') {
            setUpgradeConsumables(upgradeConsumables.map((consumable, index) => (index == 1 ? pconsumable : consumable)))
        }
    }

    const [openedActionPanel, setOpenedActionPanel] = useState(false)
    const onActionPanelChange = () => {
        setOpenedActionPanel(!openedActionPanel);
    }

    const [passivePanelOpen, setPassivePanelOpen] = useState(false)
    const onPassivePanelChange = () => {
        setPassivePanelOpen(!passivePanelOpen);
    }

    return (<>
        <div className={'game-component ' + classNameForComponent}>
            <div className='game-container'>
                <div className='header'>
                    <span className='title'>{componentTitle}</span>
                </div>
                <div className='content'>
                    {doingAction &&
                        <div className='api-loading'>
                            {/* confirmActionType == 'fish' ? <>
                        <img className='apiCallingGif' src={fishingGif} />
                    </> : confirmActionType == 'repair' ? <>
                        <img className='apiCallingGif' src={toolRepairingGif} />
                    </> : confirmActionType == 'upgrade' ? <>
                        <img className='apiCallingGif' src={toolUpgradingGif} />
                    </> : confirmActionType == 'change' ? <>
                        <img className='apiCallingGif' src={changingGif} />
                    </> :  */<span className='apiCallLoading'></span>}
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
                        {(onLoading && !doingAction) ? <CircularProgress size={50} sx={{ color: "gold" }} /> : <>
                            <div className='fish-info'>
                                <div className='passive-panel'>
                                    <Accordion
                                        expanded={passivePanelOpen}
                                        onChange={() => onPassivePanelChange()}
                                    >
                                        <AccordionSummary className='summary' expandIcon={<ExpandMoreIcon />}>
                                            <div className='setting-accordion-summary'>
                                                <span>Passive Mode</span>
                                                <span className={passiveInfo.locked ? 'locked' : 'unlocked'}>{passiveInfo.locked ? <><LockOutlinedIcon />Locked</> : <><LockOpenOutlinedIcon />Unlocked</>}
                                                </span>
                                            </div>
                                        </AccordionSummary>
                                        <AccordionDetails className='details'>
                                            {passiveInfo.locked ? <>
                                                <div className='actions'>
                                                    <span className='unlockDesc'>In passive mode, you can store fishing actions and do them at once.</span>
                                                    <Button className={'actionBtn unLockBtn' + (!passiveInfo.isUnlockAble ? ' notAllowed' : '')} onClick={onUnLockBtnClick} variant="outlined" endIcon={<LockOpenOutlinedIcon />}>
                                                        Unlock
                                                    </Button>
                                                </div>
                                                <div className='cost-list'>
                                                    {passiveInfo.unlockRequirements.length == 0 &&
                                                        <div className='noRequirementsText'>No Unlock requirements</div>}
                                                    {passiveInfo.unlockRequirements.map((requirement, index) => (
                                                        <div key={index} className={'cost' + (requirement.isAllowed ? '' : ' notAllowed')}>
                                                            <div className='costDesc'>
                                                                <span className='costQuantity'>x {requirement.quantity}</span>
                                                                <span className='costName'>{requirement.name}</span>
                                                            </div>
                                                            <img className='costImg' src={requirement.image} />
                                                        </div>
                                                    ))}
                                                </div>
                                            </> : <>
                                                <div className='actions'>
                                                    <div className='passive-info'>
                                                        <span className='passive-level'>Lvl : <b>+{passiveInfo.passiveLevel}{/* {passiveInfo.upgradeInfo.isUpgradable ? ` (-> +${passiveInfo.upgradeInfo.passiveLevel})` : ''} */}</b></span>
                                                        <span className='passive-fishingCoolDown'>Store CD : <b>{passiveInfo.fishingCoolDown}{/* {passiveInfo.upgradeInfo.isUpgradable ? ` (-> ${passiveInfo.upgradeInfo.fishingCoolDown})` : ''} */}</b> mins</span>
                                                    </div>
                                                    {passiveInfo.upgradeInfo.isUpgradable ?
                                                        <Button className={'actionBtn passiveUpgradeBtn' + (!passiveInfo.upgradeInfo.upgradeAllowed ? ' notAllowed' : '')} onClick={onPassiveUpgradeBtnClick} variant="outlined" endIcon={<UpgradeIcon />}>
                                                            Upgrade
                                                        </Button> :
                                                        <div className='notAllowedText'>At Max Level</div>}
                                                </div>
                                                {passiveInfo.upgradeInfo.isUpgradable ?
                                                    <div className='cost-list'>
                                                        {passiveInfo.upgradeInfo.upgradeRequirements.length == 0 &&
                                                            <div className='noRequirementsText'>No Upgrade requirements</div>}
                                                        {passiveInfo.upgradeInfo.upgradeRequirements.map((requirement, index) => (
                                                            <div key={index} className={'cost' + (requirement.isAllowed ? '' : ' notAllowed')}>
                                                                <div className='costDesc'>
                                                                    <span className='costQuantity'>x {requirement.quantity}</span>
                                                                    <span className='costName'>{requirement.name}</span>
                                                                </div>
                                                                <img className='costImg' src={requirement.image} />
                                                            </div>
                                                        ))}
                                                    </div> : null}
                                                <div className='actions' style={{ borderTop: '1px solid #3c3c3c', padding: '10px 0px 5px 0px' }}>
                                                    <div className='passiveSwitchText'>
                                                        Set Passive On/Off
                                                    </div>
                                                    <div className='passiveSwitchActions'>
                                                        <IconButton className={'iconBtn passiveBtn' + (passiveInfo.isPassive ? ' notAllowed' : '')} onClick={onPassiveBtnClick}>
                                                            <PlayCircleIcon />
                                                        </IconButton>
                                                        <IconButton className={'iconBtn activeBtn' + (!passiveInfo.isPassive ? ' notAllowed' : '')} onClick={onActiveBtnClick}>
                                                            <PauseCircleIcon />
                                                        </IconButton>
                                                    </div>

                                                </div>
                                            </>}
                                        </AccordionDetails>
                                    </Accordion>
                                </div>
                                <div className='fish-rod'>
                                    {currentRod.image !== undefined ?
                                        <>
                                            <div className='fish-img'>
                                                <BonusBar info={currentInventory.bonuses} />
                                                <BonusView icon={true} info={currentInventory.bonuses} />
                                                <img src={currentRod.image} />
                                                {/* <img className={'fish-img ' + ((doingAction || (idDelegate != null && !delegationData.inventory)) ? 'notAllowed' : '')} src={currentRod.image} onClick={() => onUpgradeRodClick()} /> */}
                                            </div>
                                            <div className='fish-rod-info'>
                                                <span className='fish-name'>
                                                    {currentRod.name != undefined ? currentRod.name : '..'}
                                                    {(currentRod.level != undefined && currentRod.level >= 0) ? `+ ${currentRod.level}` : null}
                                                    <br />
                                                    <b>Rarity: {currentRod.rarity}</b>
                                                </span>
                                                <div className='durability'>
                                                    <div className='durability-info'>
                                                        <span className='durability-label'>Durability</span>
                                                        <div className='durability-bar'></div>
                                                    </div>
                                                    <span className='durability-text'> {
                                                        currentRod.durability != undefined
                                                            ? currentRod.durability == -1 ? ' ∞'
                                                                : currentRod.durability
                                                            : '..'
                                                    } </span>
                                                </div>
                                            </div>
                                        </> :
                                        <div className='noEquippedText'>No Equipped Rod</div>}
                                </div>
                                <div className='fish-action'>
                                    <Accordion
                                        expanded={openedActionPanel}
                                        onChange={() => onActionPanelChange()}
                                    >
                                        <AccordionSummary className='summary' expandIcon={<ExpandMoreIcon />}>
                                            <div className='setting-accordion-summary'>
                                                <span>Show Actions</span>
                                                {/* <span>Fisher Timer</span> */}
                                            </div>
                                        </AccordionSummary>
                                        <AccordionDetails className='details'>
                                            <div className='fish-action-button'>

                                                <Button variant="outlined" color="success" onClick={(e) => !doingAction && onChangeRodClick(e)}
                                                    id='ChangeRodBtn'
                                                >{currentRod.image != undefined ? 'Change Rod' : 'Equip Rod'}</Button>

                                                {(idDelegate == null || delegationData.fisherman) && <Button variant="outlined" color="success" onClick={() => !doingAction && onRepairRodClick()}
                                                    id='repairRodBtn'
                                                    disabled={currentInventory?.isAvailable.repair !== 1 ? true : false}
                                                    className={currentInventory?.isAvailable.repair !== 1 ? 'notAllowed' : ''}
                                                > {'Repair Rod'} </Button>}
                                                <Button variant="outlined" color="success" onClick={() => !doingAction && onInventoryClick()} id='inventoryBtn'>
                                                    {'Inventory'}
                                                </Button>

                                            </div>
                                            <div className='fish-timer'>
                                                {/* ENDING TIMES */}
                                                {fishingRemainingTime > 0 ?
                                                    <p className='remainingTime remainingTimeFisherman'>Next Fisherman spot: <b>{
                                                        `${msToTime(fishingRemainingTime).hours}:${msToTime(fishingRemainingTime).minutes}:${msToTime(fishingRemainingTime).seconds}`
                                                    }</b> min</p>
                                                    : null}
                                                {rodRemainingTime > 0 ?
                                                    <p className='remainingTime remainingTimeRod'>Equipped Rod available in: <b>{
                                                        `${msToTime(rodRemainingTime).hours}:${msToTime(rodRemainingTime).minutes}:${msToTime(rodRemainingTime).seconds}`
                                                    }</b> min</p>
                                                    : null}
                                                {fishingRemainingTime <= 0 && rodRemainingTime <= 0 && <p className='noFishingText'>Available for fishing</p>}
                                            </div>
                                        </AccordionDetails>
                                    </Accordion>
                                </div>
                            </div>
                            <div className="fish-items">
                                {!passiveInfo.isPassive ?
                                    <div className='consumables'>
                                        {hasConsumables ?
                                            <>
                                                <span className='desc'>Consumable</span>
                                                <div
                                                    className={'consumableBtn'}
                                                    onClick={(e) => { onConsumableBtnClick(e, 'fish1') }}
                                                    id='fishConsumableBtn1'
                                                    aria-controls={consumableOpen == 'fish1' ? 'fishConsumableMenu1' : undefined}
                                                    aria-haspopup="true"
                                                    aria-expanded={consumableOpen == 'fish1' ? 'true' : undefined}
                                                >
                                                    {fishConsumables[0].id != undefined && <img className='consumable-image' src={fishConsumables[0].image}></img>}
                                                </div>
                                                <Menu
                                                    id='fishConsumableMenu1'
                                                    anchorEl={consumableAnchorEl}
                                                    open={consumableOpen == 'fish1'}
                                                    onClose={onCloseConsumable}
                                                    MenuListProps={{
                                                        'aria-labelledby': 'fishConsumableBtn1',
                                                    }}
                                                    anchorOrigin={{
                                                        vertical: 'bottom',
                                                        horizontal: 'center',
                                                    }}
                                                    transformOrigin={{
                                                        vertical: 'top',
                                                        horizontal: 'center',
                                                    }}
                                                >
                                                    <div className='noConsumableText'>
                                                        No More Consumable
                                                    </div>
                                                    {consumables.map((consumable, index) => (
                                                        consumable.id != fishConsumables[0].id && consumable.id != fishConsumables[1].id &&
                                                        <MenuItem key={index} onClick={() => onConsumableClick('fish1', consumable)}>
                                                            <img className='consumableImage' src={consumable.image}></img>
                                                            <div className='consumableDesc'>
                                                                <span className='consumableName'>{consumable.name}</span>
                                                                <span className='consumableQuantity'>x {consumable.quantity}</span>
                                                                <span className='consumableDescription'>{consumable.description}</span>
                                                            </div>
                                                        </MenuItem>
                                                    ))}
                                                </Menu>
                                                <div
                                                    className={'consumableBtn'}
                                                    onClick={(e) => { onConsumableBtnClick(e, 'fish2') }}
                                                    id='fishConsumableBtn2'
                                                    aria-controls={consumableOpen == 'fish2' ? 'fishConsumableMenu2' : undefined}
                                                    aria-haspopup="true"
                                                    aria-expanded={consumableOpen == 'fish2' ? 'true' : undefined}
                                                >
                                                    {fishConsumables[1].id != undefined && <img className='consumable-image' src={fishConsumables[1].image}></img>}
                                                </div>
                                                <Menu
                                                    id='fishConsumableMenu2'
                                                    anchorEl={consumableAnchorEl}
                                                    open={consumableOpen == 'fish2'}
                                                    onClose={onCloseConsumable}
                                                    MenuListProps={{
                                                        'aria-labelledby': 'fishConsumableBtn2',
                                                    }}
                                                    anchorOrigin={{
                                                        vertical: 'bottom',
                                                        horizontal: 'center',
                                                    }}
                                                    transformOrigin={{
                                                        vertical: 'top',
                                                        horizontal: 'center',
                                                    }}
                                                >
                                                    <div className='noConsumableText'>
                                                        No More Consumable
                                                    </div>
                                                    {consumables.map((consumable, index) => (
                                                        consumable.id != fishConsumables[0].id && consumable.id != fishConsumables[1].id &&
                                                        <MenuItem key={index} onClick={() => onConsumableClick('fish2', consumable)}>
                                                            <img className='consumableImage' src={consumable.image}></img>
                                                            <div className='consumableDesc'>
                                                                <span className='consumableName'>{consumable.name}</span>
                                                                <span className='consumableQuantity'>x {consumable.quantity}</span>
                                                                <span className='consumableDescription'>{consumable.description}</span>
                                                            </div>
                                                        </MenuItem>
                                                    ))}
                                                </Menu>
                                                <div className='resetBtn'>
                                                    <Button variant="contained" onClick={() => onResetConsumables('fish')}>
                                                        Reset
                                                    </Button>
                                                </div>
                                            </> :
                                            <div className='noConsumableText'>
                                                No Consumable
                                            </div>}
                                    </div> :
                                    <div className='lure-panel'>
                                        <div className='lure-info'>
                                            <div className='lure-left'>
                                                <img className='lure-image' src={passiveInfo.lureData.image} />
                                                <div className='lure-desc'>
                                                    You can use each <b>{passiveInfo.lureData.name}</b> to add <a>{passiveInfo.constant.actionCountPerFishingLure}</a> actions.<br />
                                                    <div className={'lure-quantity' + (Number(burnLureCount) > passiveInfo.lureData.quantity ? ' missing' : '')}> x{passiveInfo.lureData.quantity - Number(burnLureCount)}</div>
                                                </div>
                                            </div>
                                            <div className='lure-right'>
                                                <input className='burnLureInput' type='number' value={burnLureCount} onChange={(e) => {
                                                    var str = e.target.value
                                                    if (typeof str !== 'string' && typeof str !== 'number') {
                                                        setBurnLureCount('')
                                                    } else {
                                                        let burnCount = Number(str)
                                                        if (burnCount == '') {
                                                            setBurnLureCount('')
                                                        } else {
                                                            burnCount = Math.max(Math.min(burnCount, Math.floor((passiveInfo.maxStorableActions - passiveInfo.burntActions + passiveInfo.constant.actionCountPerFishingLure - 1) / passiveInfo.constant.actionCountPerFishingLure)), 0)
                                                            setBurnLureCount(burnCount)
                                                        }
                                                    }
                                                }} />
                                                <Button variant="contained" className={'burnLureBtn' + ((Number(burnLureCount) > passiveInfo.lureData.quantity || Number(burnLureCount) == 0) ? ' missing' : '')} onClick={onBurnLureBtnClick}>
                                                    Burn
                                                </Button>
                                            </div>
                                        </div>
                                        <div className='possibleActionCount'>
                                            Burnt Actions:<b>{passiveInfo.burntActions}</b>/{passiveInfo.maxStorableActions}<div>(After burn:<a>{Math.min(passiveInfo.burntActions + passiveInfo.constant.actionCountPerFishingLure * burnLureCount, passiveInfo.maxStorableActions)}</a></div>)
                                        </div>
                                        <div className='action-info'>
                                            <div className='storedActionBar'>
                                                <div className='bar-desc'>
                                                    Stored :
                                                </div>
                                                <span className='bar-text'>
                                                    <a>{passiveInfo.storedActions}</a>/{passiveInfo.maxStorableActions}
                                                </span>
                                                {(passiveInfo.storedActions < passiveInfo.maxStorableActions) &&
                                                    <div className='nextStore'>
                                                        (To next:<a>{msToTime(nextStoreRemainingTime).hours}:{msToTime(nextStoreRemainingTime).minutes}:{msToTime(nextStoreRemainingTime).seconds}</a>)
                                                    </div>}
                                            </div>
                                            <div className='performActionCount'>
                                                Performable Actions : <b>{passiveInfo.maxPerformableActions}</b>
                                                {/* (Will cost<a>{passiveInfo.constant.ancienCostPerEachFishingAction * passiveInfo.maxPerformableActions}</a> 
                            <img src={ANCIEN_IMAGE} />) */}
                                            </div>
                                        </div>
                                    </div>
                                }

                                {/* SEAS */}
                                {
                                    seas.map((sea, index) => (
                                        (sea.always == 1 || passiveInfo.locked || !passiveInfo.isPassive) &&
                                        <div className={'fish-item' + (sea.always == 0 ? ' special-sea' : '')} style={(index === seas.length - 1) ? { marginBottom: '0px' } : {}} key={index}>
                                            <span className='fish-item-title'>{sea.title}</span>
                                            <div className='fish-item-content'>
                                                <div className="fish-item-text">
                                                    <div><span className='fish-item-description'>{sea.description}</span></div>
                                                    <div><span className='fish-item-recipe'>Rarity Required {sea.rarityRequired}</span></div>
                                                    {/* { !sea.isAllowed && <div className="fish-item-warning">{sea.messageNotAllowed}</div>} */}
                                                </div>
                                                <div className='fish-item-detail'>
                                                    <IconButton onClick={() => showSeaInfoHandler(index)}><InfoOutlinedIcon></InfoOutlinedIcon></IconButton>
                                                </div>
                                            </div>
                                            <div className={'fish-item-btn' + (sea.isAllowed ? '' : ' notAllowed')}>
                                                {sea.isAllowed ?
                                                    <Button variant="contained" color="success" onClick={() => !doingAction && onFishClick(sea)}>
                                                        {'Fish'}
                                                    </Button> :
                                                    <Button variant="contained" color="error">Fish</Button>
                                                }
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        </>}
                    </div>
                </div>
            </div>

            <props.ConfirmContext.ConfirmationDialog
                className="confirm-panel"
                open={openConfirmType != ''}
                onClose={onCloseConfirmModal}
            >
                <DialogTitle>
                    {openConfirmType == 'change' && <>{openConfirmType} Rod</>}
                    {openConfirmType == 'repair' && <>{`Durability ${currentRod.durability}` + ` -> ${currentInventory.durabilityTotal}`}</>}
                </DialogTitle>
                <DialogContent>
                    {openConfirmType == 'unlock' && <DialogContentText>Do you want to unlock?</DialogContentText>}
                    {openConfirmType == 'passive' && <DialogContentText>Do you want to Passive On?</DialogContentText>}
                    {openConfirmType == 'passiveUpgrade' && <DialogContentText>Do you want to upgrade to Lvl +{passiveInfo.upgradeInfo.passiveLevel}?</DialogContentText>}
                    {openConfirmType == 'active' && <DialogContentText>Do you want to Passive Off?<br />Store CoolDown will be reset.</DialogContentText>}
                    {openConfirmType == 'burn' && <DialogContentText>Do you want to use {burnLureCount} lures?</DialogContentText>}

                    {openConfirmType == 'fish' &&
                        <DialogContentText>
                            {(passiveInfo.isPassive && passiveInfo.maxPerformableActions == 0) ? <>No performable actions</> : <> Are you sure you want to fish at {fishingSea?.title}?
                                {fishingSea.specialInfo && fishingSea.specialInfo.burn == 1 && <><br />You will use {fishingSea.specialInfo.type == 'item' ? `x` : ''}<span className='burnInventory'>{fishingSea.specialInfo.type == 'item' ? `${fishingSea.specialInfo.quantity}` : ''} {fishingSea.specialInfo.name}{fishingSea.specialInfo.type == 'tool' ? ` +${fishingSea.specialInfo.level}` : ''}</span></>}
                                {fishConsumables[0].id != undefined && <><br />{fishConsumables[0].description}</>}
                                {fishConsumables[1].id != undefined && <><br />{fishConsumables[1].description}</>}</>}
                        </DialogContentText>
                    }
                    {openConfirmType == 'change' &&
                        <div className='changeRodMenu'>
                            {rods.length == 0 && <span className='noRodText'>You have no rod yet.</span>}
                            {rods.map((rod, index) => (
                                <div
                                    onClick={() => onRodMenuClick(rod)}
                                    key={index}
                                    className={'ownedRod ' + rod.status}
                                >
                                    <BonusBar info={rod.bonuses} />
                                    <div className='statusText'>
                                        {rod.status == 'equipped' && <div className='rodStatusText rodEquipText'>EQUIPPED</div>}
                                        {rod.status == 'not-available' && <div className='rodStatusText rodWarningText'>MISSING</div>}
                                        {rod.isFishing == 1 && <div className='rodStatusText rodFishingText'>FISHING</div>}
                                    </div>
                                    <img className='rodImage' src={rod.image} />
                                    <div className='rodDesc'>
                                        <span className='rodName'>{rod.name}</span>
                                        <span className='rodInfo'>{rod.level >= 0 ? `LVL + ${rod.level},` : null} Rarity {rod.rarity}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    }
                    {openConfirmType == 'info' &&
                        <div className="seaInfoMenu">
                            {seas[seaIndex].drop.map((drop, sIndex) => (
                                <div key={sIndex} className="ownedSeaInfo">
                                    <div className='drop'>
                                        <div className='drop-desc'>
                                            <span className={'drop-desc-name-' + drop.rarity}>{drop.name}</span>
                                            {/* <br/>
                            <span>{drop.description}</span> */}
                                        </div>
                                        <img className='drop-image' src={drop.image} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    }
                    {openConfirmType == 'repair' &&
                        <>
                            <div className='action-panel repair-panel'>
                                {currentInventory?.isAvailable.repair ?
                                    <>
                                        <div className='actions-list'>
                                            <div className='actions'>
                                                <div className={'actionBtn repairBtn' + (currentInventory?.repair.isAllowed ? '' : ' notAllowed')}>
                                                    <Button variant="contained" onClick={() => onActionBtnClick('repair')}>
                                                        {doingAction ? <CircularProgress size={15} sx={{ color: "black" }} /> : 'Repair'}
                                                    </Button>
                                                </div>
                                                <div className='consumables'>
                                                    {currentInventory?.repair.hasConsumables ?
                                                        <>
                                                            <span className='desc'>Consumable</span>
                                                            <div className='consumable-panel'>
                                                                <div
                                                                    className={'consumableBtn' + (currentInventory?.repair.isAllowed ? '' : ' notAllowed')}
                                                                    onClick={(e) => { onConsumableBtnClick(e, 'repair1') }}
                                                                    id='repairConsumableBtn1'
                                                                    aria-controls={consumableOpen == 'repair1' ? 'repairConsumableMenu1' : undefined}
                                                                    aria-haspopup="true"
                                                                    aria-expanded={consumableOpen == 'repair1' ? 'true' : undefined}
                                                                >
                                                                    {repairConsumables[0].id != undefined && <img className='consumable-image' src={repairConsumables[0].image}></img>}
                                                                </div>
                                                                <Menu
                                                                    id='repairConsumableMenu1'
                                                                    anchorEl={consumableAnchorEl}
                                                                    open={consumableOpen == 'repair1'}
                                                                    onClose={onCloseConsumable}
                                                                    MenuListProps={{
                                                                        'aria-labelledby': 'repairConsumableBtn1',
                                                                    }}
                                                                    anchorOrigin={{
                                                                        vertical: 'bottom',
                                                                        horizontal: 'center',
                                                                    }}
                                                                    transformOrigin={{
                                                                        vertical: 'top',
                                                                        horizontal: 'center',
                                                                    }}
                                                                >
                                                                    <div className='noConsumableText'>
                                                                        No More Consumable
                                                                    </div>
                                                                    {currentInventory?.repair.consumables.map((consumable, index) => (
                                                                        consumable.id != repairConsumables[0].id && consumable.id != repairConsumables[1].id &&
                                                                        <MenuItem key={index} onClick={() => onConsumableClick('repair1', consumable)}>
                                                                            <img className='consumableImage' src={consumable.image}></img>
                                                                            <div className='consumableDesc'>
                                                                                <span className='consumableName'>{consumable.name}</span>
                                                                                <span className='consumableQuantity'>x {consumable.quantity}</span>
                                                                                <span className='consumableDescription'>{consumable.description}</span>
                                                                            </div>
                                                                        </MenuItem>
                                                                    ))}
                                                                </Menu>
                                                                <div
                                                                    className={'consumableBtn' + (currentInventory?.repair.isAllowed ? '' : ' notAllowed')}
                                                                    onClick={(e) => { onConsumableBtnClick(e, 'repair2') }}
                                                                    id='repairConsumableBtn2'
                                                                    aria-controls={consumableOpen == 'repair2' ? 'repairConsumableMenu2' : undefined}
                                                                    aria-haspopup="true"
                                                                    aria-expanded={consumableOpen == 'repair2' ? 'true' : undefined}
                                                                >
                                                                    {repairConsumables[1].id != undefined && <img className='consumable-image' src={repairConsumables[1].image}></img>}
                                                                </div>
                                                                <Menu
                                                                    id='repairConsumableMenu2'
                                                                    anchorEl={consumableAnchorEl}
                                                                    open={consumableOpen == 'repair2'}
                                                                    onClose={onCloseConsumable}
                                                                    MenuListProps={{
                                                                        'aria-labelledby': 'repairConsumableBtn2',
                                                                    }}
                                                                    anchorOrigin={{
                                                                        vertical: 'bottom',
                                                                        horizontal: 'center',
                                                                    }}
                                                                    transformOrigin={{
                                                                        vertical: 'top',
                                                                        horizontal: 'center',
                                                                    }}
                                                                >
                                                                    <div className='noConsumableText'>
                                                                        No More Consumable
                                                                    </div>
                                                                    {currentInventory?.repair.consumables.map((consumable, index) => (
                                                                        consumable.id != repairConsumables[0].id && consumable.id != repairConsumables[1].id &&
                                                                        <MenuItem key={index} onClick={() => onConsumableClick('repair2', consumable)}>
                                                                            <img className='consumableImage' src={consumable.image}></img>
                                                                            <div className='consumableDesc'>
                                                                                <span className='consumableName'>{consumable.name}</span>
                                                                                <span className='consumableQuantity'>x {consumable.quantity}</span>
                                                                                <span className='consumableDescription'>{consumable.description}</span>
                                                                            </div>
                                                                        </MenuItem>
                                                                    ))}
                                                                </Menu>
                                                            </div>
                                                            <div className='resetBtn'>
                                                                <Button variant="contained" onClick={() => onResetConsumables('repair')}>
                                                                    Reset
                                                                </Button>
                                                            </div>
                                                        </> :
                                                        <div className='noConsumableText'>
                                                            No Consumable
                                                        </div>}
                                                </div>
                                            </div>
                                            <div className='cost-list'>
                                                {currentInventory?.repair.requirements.length == 0 &&
                                                    <div className='noRequirementsText'>No requirements</div>}
                                                {currentInventory?.repair.requirements.map((requirement, index) => (
                                                    <div key={index} className={'cost' + (requirement.isAllowed ? '' : ' notAllowed')}>
                                                        <div className='costDesc'>
                                                            <span className='costQuantity'>x {requirement.quantity}</span>
                                                            <span className='costName'>{requirement.name}</span>
                                                        </div>
                                                        <img className='costImg' src={requirement.image} />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className='desc-panel'>
                                            Are you sure you want to repair?<br />
                                            After the repair the durability will be {currentInventory.durabilityTotal}.
                                        </div>
                                    </>
                                    :
                                    <span className='availableText'>Not repairable</span>}
                            </div>
                        </>
                    }
                    {openConfirmType == 'upgrade' &&
                        <>
                            <div className='action-panel upgrade-panel'>
                                {currentInventory?.isAvailable.upgrade ?
                                    <>
                                        <div className='actions-list'>
                                            <div className='actions'>
                                                <div className={'actionBtn upgradeBtn' + (currentInventory?.upgrade.isAllowed ? '' : ' notAllowed')}>
                                                    <Button variant="contained" onClick={() => onActionBtnClick('upgrade')}>
                                                        {doingAction ? <CircularProgress size={15} sx={{ color: "black" }} /> : 'Upgrade'}
                                                    </Button>
                                                </div>
                                                <div className='consumables'>
                                                    {currentInventory?.upgrade.hasConsumables ?
                                                        <><span className='desc'>Consumable</span>
                                                            <div className='consumable-panel'>
                                                                <div
                                                                    className={'consumableBtn' + (currentInventory?.upgrade.isAllowed ? '' : ' notAllowed')}
                                                                    onClick={(e) => { onConsumableBtnClick(e, 'upgrade1') }}
                                                                    id='upgradeConsumableBtn1'
                                                                    aria-controls={consumableOpen == 'upgrade1' ? 'upgradeConsumableMenu1' : undefined}
                                                                    aria-haspopup="true"
                                                                    aria-expanded={consumableOpen == 'upgrade1' ? 'true' : undefined}
                                                                >
                                                                    {upgradeConsumables[0].id != undefined && <img className='consumable-image' src={upgradeConsumables[0].image}></img>}
                                                                </div>
                                                                <Menu
                                                                    id='upgradeConsumableMenu1'
                                                                    anchorEl={consumableAnchorEl}
                                                                    open={consumableOpen == 'upgrade1'}
                                                                    onClose={onCloseConsumable}
                                                                    MenuListProps={{
                                                                        'aria-labelledby': 'upgradeConsumableBtn1',
                                                                    }}
                                                                    anchorOrigin={{
                                                                        vertical: 'bottom',
                                                                        horizontal: 'center',
                                                                    }}
                                                                    transformOrigin={{
                                                                        vertical: 'top',
                                                                        horizontal: 'center',
                                                                    }}
                                                                >
                                                                    <div className='noConsumableText'>
                                                                        No More Consumable
                                                                    </div>
                                                                    {currentInventory?.upgrade.consumables.map((consumable, index) => (
                                                                        consumable.id != upgradeConsumables[0].id && consumable.id != upgradeConsumables[1].id &&
                                                                        <MenuItem key={index} onClick={() => onConsumableClick('upgrade1', consumable)}>
                                                                            <img className='consumableImage' src={consumable.image}></img>
                                                                            <div className='consumableDesc'>
                                                                                <span className='consumableName'>{consumable.name}</span>
                                                                                <span className='consumableQuantity'>x {consumable.quantity}</span>
                                                                                <span className='consumableDescription'>{consumable.description}</span>
                                                                            </div>
                                                                        </MenuItem>
                                                                    ))}
                                                                </Menu>
                                                                <div
                                                                    className={'consumableBtn' + (currentInventory?.upgrade.isAllowed ? '' : ' notAllowed')}
                                                                    onClick={(e) => { onConsumableBtnClick(e, 'upgrade2') }}
                                                                    id='upgradeConsumableBtn2'
                                                                    aria-controls={consumableOpen == 'upgrade2' ? 'upgradeConsumableMenu2' : undefined}
                                                                    aria-haspopup="true"
                                                                    aria-expanded={consumableOpen == 'upgrade2' ? 'true' : undefined}
                                                                >
                                                                    {upgradeConsumables[1].id != undefined && <img className='consumable-image' src={upgradeConsumables[1].image}></img>}
                                                                </div>
                                                                <Menu
                                                                    id='upgradeConsumableMenu2'
                                                                    anchorEl={consumableAnchorEl}
                                                                    open={consumableOpen == 'upgrade2'}
                                                                    onClose={onCloseConsumable}
                                                                    MenuListProps={{
                                                                        'aria-labelledby': 'upgradeConsumableBtn2',
                                                                    }}
                                                                    anchorOrigin={{
                                                                        vertical: 'bottom',
                                                                        horizontal: 'center',
                                                                    }}
                                                                    transformOrigin={{
                                                                        vertical: 'top',
                                                                        horizontal: 'center',
                                                                    }}
                                                                >
                                                                    <div className='noConsumableText'>
                                                                        No More Consumable
                                                                    </div>
                                                                    {currentInventory?.upgrade.consumables.map((consumable, index) => (
                                                                        consumable.id != upgradeConsumables[0].id && consumable.id != upgradeConsumables[1].id &&
                                                                        <MenuItem key={index} onClick={() => onConsumableClick('upgrade2', consumable)}>
                                                                            <img className='consumableImage' src={consumable.image}></img>
                                                                            <div className='consumableDesc'>
                                                                                <span className='consumableName'>{consumable.name}</span>
                                                                                <span className='consumableQuantity'>x {consumable.quantity}</span>
                                                                                <span className='consumableDescription'>{consumable.description}</span>
                                                                            </div>
                                                                        </MenuItem>
                                                                    ))}
                                                                </Menu>
                                                            </div>
                                                            <div className='resetBtn'>
                                                                <Button variant="contained" onClick={() => onResetConsumables('upgrade')}>
                                                                    Reset
                                                                </Button>
                                                            </div>
                                                        </> :
                                                        <div className='noConsumableText'>
                                                            No Consumable
                                                        </div>}
                                                </div>
                                            </div>
                                            <div className='cost-list'>
                                                {currentInventory?.upgrade.requirements.length == 0 &&
                                                    <div className='noRequirementsText'>No requirements</div>}
                                                {currentInventory?.upgrade.requirements.map((requirement, index) => (
                                                    <div key={index} className={'cost' + (requirement.isAllowed ? '' : ' notAllowed')}>
                                                        <div className='costDesc'>
                                                            <span className='costQuantity'>x {requirement.quantity}</span>
                                                            <span className='costName'>{requirement.name}</span>
                                                        </div>
                                                        <img className='costImg' src={requirement.image} />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className='desc-panel'>
                                            Are you sure you want to upgrade?<br />
                                            {upgradeConsumables[0].id == 1 || upgradeConsumables[1].id == 1 ? 'The upgrade can fail.' : 'The upgrade can fail and the tool could be downgraded.'}
                                            <br />
                                            Probability of Success: {Math.min((upgradeConsumables[0].id == 2 || upgradeConsumables[1].id == 2 ? 10 : 0) + (upgradeConsumables[0].id == 6 || upgradeConsumables[1].id == 6 ? 5 : 0) + (upgradeConsumables[0].id == 7 || upgradeConsumables[1].id == 7 ? 15 : 0) + currentInventory.upgrade?.probability, 100)}%
                                        </div>
                                    </>
                                    :
                                    <span className='availableText'>Not upgradable</span>}
                            </div>
                        </>
                    }
                </DialogContent>
                {openConfirmType == 'fish' &&
                    <DialogActions>
                        <Button onClick={onDoAction} autoFocus> {(passiveInfo.isPassive && passiveInfo.maxPerformableActions == 0) ? 'Ok' : 'Fish'} </Button>
                    </DialogActions>
                }
                {(openConfirmType == 'unlock' || openConfirmType == 'passive' || openConfirmType == 'active' || openConfirmType == 'passiveUpgrade' || openConfirmType == 'burn') &&
                    <DialogActions>
                        <Button onClick={onPassiveAction} autoFocus> Sure </Button>
                    </DialogActions>
                }
            </props.ConfirmContext.ConfirmationDialog>

            <props.ConfirmContext.ConfirmedDialog
                open={actionResModalOpen}
                onClose={onCloseActionResModal}
            >
                <DialogTitle>
                    {confirmActionType == 'fish' && (actionRes?.success ? "Success!" : 'Failed!')}
                    {(confirmActionType == 'upgrade' || confirmActionType == 'repair') && (actionRes?.data.done ? "Success!" : 'Failed!')}
                    {(confirmActionType == 'unlock' || confirmActionType == 'passive' || confirmActionType == 'active' || confirmActionType == 'passiveUpgrade' || confirmActionType == 'burn') &&
                        ((actionRes?.success && actionRes?.data.done) ? "Success!" : 'Failed!')
                    }
                </DialogTitle>
                <DialogContent>
                    {actionRes?.success ?
                        <>
                            {(confirmActionType == 'unlock' || confirmActionType == 'passive' || confirmActionType == 'active' || confirmActionType == 'passiveUpgrade' || confirmActionType == 'burn') &&
                                <DialogContentText>{actionRes?.data.message}</DialogContentText>
                            }
                            {confirmActionType == 'fish' &&
                                <div id="fishDropView">
                                    {actionRes?.data.drop.map((drop, index) => (
                                        <div className='drop' key={index}>
                                            <img className='drop-image' src={drop.image} />
                                            <div className={'drop-name drop-rarity-' + drop.rarity}>{drop.name}{drop.type == 'fish' && ` (${drop.experience} EXP)`}</div>
                                            {drop.type != 'fish' && <div className={'drop-desc drop-rarity-' + drop.rarity}>x {drop.quantity}</div>}
                                        </div>
                                    ))}
                                </div>
                            }
                            {confirmActionType == 'repair' &&
                                <div id="repairResponse">
                                    {actionRes?.data.message} <br /> {actionRes?.data.done ? `Now the durability is ${actionRes?.data.durability}.` : actionRes?.data.message}
                                </div>
                            }
                        </> :
                        <DialogContentText>
                            {actionRes?.error.errorMessage}
                        </DialogContentText>
                    }
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

export default GameFish