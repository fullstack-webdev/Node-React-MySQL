import './bonus.scss';

import {
  useEffect,
  useState,
} from 'react';

import axios from 'axios';
import { Scrollbars } from 'react-custom-scrollbars';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

import BonusConsumable from '../../components-game/bonus/BonusConsumable';
import BonusItem from '../../components-game/bonus/BonusItem';
import BonusSlot from '../../components-game/bonus/BonusSlot';
import { playSound } from '../../utils/sounds';

const classNameForComponent = 'game-bonus' // ex: game-inventory
const componentTitle = 'Bonus' // ex: Inventory
const hasTab = false // true if this component has tabs
const tabNames = ['A', 'B', 'C', 'D', 'E'] // tab display names

const MAX_IMPLICIT_BONUS = 1
const MAX_PREFIX_BONUS = 2
const MAX_SUFFIX_BONUS = 2

const MAX_IMPLICIT_TIER = 3
const MAX_PREFIX_TIER = 5
const MAX_SUFFIX_TIER = 5

function Bonus/* Component_Name_You_Want */(props) {
    const [currentTabIndex, setCurrentTabIndex] = useState(0)
    const tabChanged = (index) => {
        if (currentTabIndex === index) {
            return
        }
        setCurrentTabIndex(index)
    }

    const [onLoading, setOnLoading] = useState(true)
    const [tools, setTools] = useState([])
    useEffect(() => {
        reloadData()
    }, [])
    const reloadData = () => {
        setOnLoading(true);
        axios
            .post("/api/m1/bonus/getEnchantingTable", {
                address: props.metamask.walletAccount
            })
            .then((response) => {
                if (response.data.success) {
                    let res = response.data.data;
                    for (let tool of res.tools) {
                        let bonuses = tool.bonuses;
                        let newBonuses = [];
                        let suffix = [], prefix = [], implicit = [];
                        for (let bonus of bonuses) {
                            bonus.uid = `${tool.idToolInstance}-${bonus.idBonus}`;
                            if (bonus.type == 'SUFFIX') {
                                suffix.push(bonus);
                            } else if (bonus.type == 'PREFIX') {
                                prefix.push(bonus);
                            } else if (bonus.type == 'IMPLICIT') {
                                implicit.push(bonus);
                            }
                        }
                        for (let i = 0; i < MAX_PREFIX_BONUS; ++i) {
                            newBonuses.push(prefix[i] ? prefix[i] : 'PREFIX');
                        }
                        for (let i = 0; i < MAX_SUFFIX_BONUS; ++i) {
                            newBonuses.push(suffix[i] ? suffix[i] : 'SUFFIX');
                        }
                        for (let i = 0; i < MAX_IMPLICIT_BONUS; ++i) {
                            newBonuses.push(implicit[i] ? implicit[i] : 'IMPLICIT');
                        }
                        tool.bonuses = newBonuses;
                    }
                    setTools(JSON.parse(JSON.stringify(res.tools)));
                    setConsumables(JSON.parse(JSON.stringify(res.bonus_consumables)));
                    if (res.tools.length != 0) {
                        setSelectedTool(JSON.parse(JSON.stringify(res.tools[0])));
                    }
                    setOnLoading(false)
                }
            })
            .catch((error) => {
                error.response.status == 500 && props.callback_Logout()
                error.response.status == 401 && props.callback_Logout()
            });
    }

    const [consumables, setConsumables] = useState([])
    const [selectedTool, setSelectedTool] = useState({})
    const onSelectTool = (toolInfo) => {
        setSelectedTool(toolInfo);
    }

    const [selectedBonus, setSelectedBonus] = useState({ uid: '' })
    const onSelectBonus = (bonusInfo) => {
        if (bonusInfo.uid == selectedBonus.uid) {
            // setSelectedBonus({ uid: '' });
        } else {
            setSelectedBonus(bonusInfo);
        }
    }

    const onSelectCurrentToolBonus = (bonusInfo) => {
        if (bonusInfo.uid == selectedBonus.uid) {
            // setSelectedBonus({ uid: '' });
        } else {
            setSelectedBonus(bonusInfo);
        }
    }

    const [currentConsumable, setCurrentConsumable] = useState(null);
    const onSelectConsumable = (consumableInfo) => {
        setCurrentConsumable(consumableInfo);
        onDoAction(consumableInfo.type);
    }

    const [toolPanelOpen, setToolPanelOpen] = useState(false)
    const onToolPanelChange = () => {
        setToolPanelOpen(!toolPanelOpen);
    }

    const [doingAction, setDoingAction] = useState(false)
    const [confirmActionType, setConfirmActionType] = useState('');
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
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
        if (confirmActionType == 'ENCHANTMENT') {
            axios({
                method: 'post',
                url: '/api/m1/bonus/enchantTool',
                data: {
                    address: props.metamask.walletAccount,
                    idToolInstance: selectedTool.idToolInstance,
                    idItemConsumableBonus: currentConsumable.idItemConsumableBonus
                }
            })
                .then(response => {
                    onDidAction(response);
                })
                .catch(error => {
                    error.response.status == 500 && props.callback_Logout()
                    error.response.status == 401 && props.callback_Logout()
                })
        } else if (confirmActionType == 'REROLL') {
            axios({
                method: 'post',
                url: '/api/m1/bonus/rerollBonus',
                data: {
                    address: props.metamask.walletAccount,
                    idToolInstance: selectedTool.idToolInstance,
                    idItemConsumableBonus: currentConsumable.idItemConsumableBonus
                }
            })
                .then(response => {
                    onDidAction(response);
                })
                .catch(error => {
                    error.response.status == 500 && props.callback_Logout()
                    error.response.status == 401 && props.callback_Logout()
                })
        } else if (confirmActionType == 'ELEVATE') {
            axios({
                method: 'post',
                url: '/api/m1/bonus/elevateBonus',
                data: {
                    address: props.metamask.walletAccount,
                    idToolInstance: selectedTool.idToolInstance,
                    idItemConsumableBonus: currentConsumable.idItemConsumableBonus
                }
            })
                .then(response => {
                    onDidAction(response);
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
        playSound(confirmActionType)
        if (response.data.success) {
            let res = response.data.data;

            console.log(confirmActionType, res);
            if (confirmActionType == 'REROLL' || confirmActionType == 'ELEVATE') {
                setSelectedBonus({ uid: '' });
            }

            try {
                // update consumable inventory
                if (res.inventory.action == 'edit') {
                    setConsumables(consumables.map((consumable) => (consumable.idItemConsumableBonus == res.inventory.idItemConsumableBonus ? { ...consumable, quantity: res.inventory.remainingQuantity } : consumable)))
                } else if (res.inventory.action == 'remove') {
                    setConsumables(consumables.map((consumable) => (consumable.idItemConsumableBonus == res.inventory.idItemConsumableBonus ? null : consumable)))
                }

                // update current tool
                let currentTool = JSON.parse(JSON.stringify(res.tool));
                let newBonuses = [];
                let suffix = [], prefix = [], implicit = [];
                for (let bonus of currentTool.bonuses) {
                    bonus.uid = `${selectedTool.idToolInstance}-${bonus.idBonus}`;
                    if (bonus.type == 'SUFFIX') {
                        suffix.push(bonus);
                    } else if (bonus.type == 'PREFIX') {
                        prefix.push(bonus);
                    } else if (bonus.type == 'IMPLICIT') {
                        implicit.push(bonus);
                    }
                }
                for (let i = 0; i < MAX_PREFIX_BONUS; ++i) {
                    newBonuses.push(prefix[i] ? prefix[i] : 'PREFIX');
                }
                for (let i = 0; i < MAX_SUFFIX_BONUS; ++i) {
                    newBonuses.push(suffix[i] ? suffix[i] : 'SUFFIX');
                }
                for (let i = 0; i < MAX_IMPLICIT_BONUS; ++i) {
                    newBonuses.push(implicit[i] ? implicit[i] : 'IMPLICIT');
                }
                currentTool.bonuses = newBonuses;

                setSelectedTool(JSON.parse(JSON.stringify(currentTool)));
                setTools(tools.map((tool) => (tool.idToolInstance == currentTool.idToolInstance ? currentTool : tool)));
            } catch (err) {
                console.log(err);
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
                            <div className='bonus-left-panel'>
                                {tools.length != 0 ? <>
                                    <div className='tool-list-panel'>

                                        <Accordion expanded={toolPanelOpen} onChange={() => onToolPanelChange()}>
                                            <AccordionSummary className='summary' expandIcon={<ExpandMoreIcon />}>
                                                <div className='selected-tool'>
                                                    <div className='selected-tool-info'>
                                                        {selectedTool.name}
                                                        <a>Lvl +{selectedTool.level}</a>
                                                        <div className='selected-tool-img'>
                                                            <img src={selectedTool.image} />
                                                        </div>
                                                    </div>
                                                    <div className='selected-tool-bonus-info'>
                                                        {selectedTool.bonuses.map((bonus, index) => (
                                                            <BonusItem
                                                                key={index}
                                                                info={bonus}
                                                                selectedBonus={selectedBonus}
                                                                cb_onSelectBonus={onSelectBonus}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            </AccordionSummary>
                                            <AccordionDetails className='details' style={{ height: `${tools.length * 73 - 1}px` }}>
                                                <Scrollbars
                                                    style={{ width: '100%', height: '100%' }}
                                                    autoHide={false}
                                                    renderThumbVertical={props => <div {...props} className="thumb-vertical" />}
                                                >
                                                    <div className='tool-list'>
                                                        {tools.map((tool, index) => (
                                                            <div
                                                                key={index}
                                                                className={'tool' + (selectedTool.idToolInstance == tool.idToolInstance ? ' selected' : '')}
                                                                onClick={() => {
                                                                    onSelectTool(tool);
                                                                }}
                                                            >
                                                                <div className='tool-left-panel'>
                                                                    <div className='tool-img'>
                                                                        <img src={tool.image} />
                                                                    </div>
                                                                </div>
                                                                <div className='tool-right-panel'>
                                                                    <div className='tool-info'>
                                                                        {tool.name} <a>Lvl +{tool.level}</a>
                                                                    </div>
                                                                    <div className='tool-bonus-info'>
                                                                        {tool.bonuses.map((bonus, index) => (
                                                                            <BonusItem
                                                                                key={index}
                                                                                info={bonus}
                                                                                selectedBonus={selectedBonus}
                                                                                cb_onSelectBonus={onSelectBonus}
                                                                            />
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </Scrollbars>
                                            </AccordionDetails>
                                        </Accordion>
                                    </div>

                                    <div className='selected-tool-panel'>
                                        <div className='tool-info'>
                                            <div className='tool-type'>
                                                {selectedTool.type}
                                            </div>
                                            <div className='tool-header'>
                                                <div className='tool-img'>
                                                    <img src={selectedTool.image} />
                                                </div>
                                                <div className='tool-attr'>
                                                    <div className='tool-name'>
                                                        {selectedTool.name}
                                                    </div>
                                                    <div className='tool-lvl'>
                                                        Lvl +{selectedTool.level}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className='tool-description'>
                                                {selectedTool.description}
                                            </div>
                                        </div>
                                        <div className='bonus-panel'>
                                            {selectedTool.bonuses.map((bonus, index) => (
                                                <BonusSlot
                                                    key={index}
                                                    info={bonus}
                                                    selectedBonus={selectedBonus}
                                                    cb_onSelectBonus={onSelectCurrentToolBonus}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </>
                                    : <>
                                        <div className='noToolDescription'>
                                            You have no tools yet.
                                        </div>
                                    </>}
                            </div>
                            <div className='bonus-right-panel'>
                                <div className='selected-bonus-info'>
                                    {selectedBonus.uid == '' ? <>
                                        <div className='noSelectedBonusDescription'>
                                            Bonus details..<br />
                                            Please select the bonus you want.
                                        </div>
                                    </>
                                        : <>
                                            <div className={'bonus-type ' + selectedBonus.type}>
                                                {selectedBonus.type}
                                            </div>
                                            <div className='bonus-name'>
                                                {selectedBonus.name}
                                            </div>
                                            <div className='bonus-description'>
                                                {selectedBonus.description}
                                            </div>
                                            <div className='bonus-footer'>
                                                <div className='bonus-effect'>
                                                    effect: <a>{selectedBonus.flat || selectedBonus.percentage}</a>{selectedBonus.percentage && '%'}
                                                </div>
                                                <div className='bonus-tier'>
                                                    tier: <a>{selectedBonus.tier}</a>
                                                </div>
                                            </div>
                                        </>
                                    }
                                </div>
                                <div className='consumable-panel'>
                                    {consumables.map((consumable, index) => (
                                        consumable && consumable.quantity > 0 &&
                                        <BonusConsumable
                                            key={index}
                                            info={consumable}
                                            selectedTool={selectedTool}
                                            cb_onSelectConsumable={onSelectConsumable}
                                        />
                                    ))}
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
                    {confirmActionType == 'ERROR' && 'Warning'}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {
                            confirmActionType == 'ERROR' ? currentConsumable.message :
                                <>
                                    Do you want to use {confirmActionType} on the {currentConsumable?.effectOn.split(',').join(', ')}?
                                </>
                        }
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            if (confirmActionType == 'ERROR') {
                                onCloseConfirmModal();
                            } else {
                                proceedAction();
                            }
                        }}
                        autoFocus
                    >
                        Sure
                    </Button>
                </DialogActions>
            </props.ConfirmContext.ConfirmationDialog>
            <props.ConfirmContext.ConfirmedDialog
                open={actionResModalOpen}
                onClose={onCloseActionResModal}
            >
                {/* <DialogTitle>
                    {actionRes?.data.success ? 'Success!' : 'Failed!'}
                </DialogTitle> */}
                <DialogContent>
                    <DialogContentText>
                        {actionRes?.data.success ? 'Successfully done!' : 'Failed!'}
                        {/* {resActionType == 'ENCHANTMENT' && '123'}
                        {resActionType == 'REROLL' && '456'}
                        {resActionType == 'ELEVATE' && '789'} */}
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

export default Bonus // Component_Name_You_Want