import '../game-craft-inventory/game-craft-inventory.scss';
import './game-gem.scss';

import {
  useEffect,
  useState,
} from 'react';

import axios from 'axios';
import { ethers } from 'ethers';
import { Scrollbars } from 'react-custom-scrollbars';
import {
  toast,
  ToastContainer,
} from 'react-toastify';

import {
  Button,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Menu,
  MenuItem,
} from '@mui/material';

import AlphaMarketplaceABI from '../../ABIs/alpha-market-abi.json';
import iconBack from '../../assets-game/arrow_back.svg';
import iconForward from '../../assets-game/arrow_forward.svg';
// import craftingGif from '../../assets-game/crafting.gif';
import imgEmporium from '../../assets-game/emporium.png';
import GemBundle from '../../components-game/gem/GemBundle';
import { serverConfig } from '../../config/serverConfig';
import { playSound } from '../../utils/sounds';
import {
  format,
  toFixed,
} from '../../utils/utils';

const classNameForComponent = 'game-craft-inventory game-gem' // ex: game-inventory
const componentTitle = 'GEM MERCHANT' // ex: Inventory
const hasTab = true // true if this component has tabs
const tabNames = ['Buy', 'Use'] // tab display names

//Alpha Ancient Marketplace Contract Address
const contractAlphaMarketplaceAddress = serverConfig?.contracts.gemMarketplace || '0x0000000000000000000000000000000000000000'
//Alpha Ancient Marketplace Contract ABI
const contractAlphaMarketplaceABI = AlphaMarketplaceABI

function GameGem/* Component_Name_You_Want */(props) {
    // tab manage
    const [ currentTabIndex, setCurrentTabIndex ] = useState(0)
    const tabChanged = (index) => {
        if ( currentTabIndex === index ) {
            return
        }
        setCurrentTabIndex(index)
        if ( index == 1 ) {
            getBoughtRecipes();
        } else if ( index == 0 ) {
            getBuyRecipes();
        }
    }

    // Delegate Info
    const [idDelegate, setIdDelegate] = useState(props.idDelegate)
    useEffect(() => { setIdDelegate(props.idDelegate)}, [props.idDelegate])
    const [delegationData, setDelegationData] = useState(props.delegationData)
    useEffect(() => { setDelegationData(props.delegationData) }, [props.delegationData])

    // loading flag
    const [onLoading, setOnLoading] = useState(true)

    // call getBuyRecipes at first
    useEffect(() => {
        getBuyRecipes()
    }, [])

    // use tab
    const [inventoryData, setInventoryData] = useState([])
    const getBoughtRecipes = () => {
        setOnLoading(true)
        axios({
            method: 'post',
            url: '/api/m1/inventory/getRecipeGem',
            data: {
                address: props.metamask.walletAccount
            }
        })
        .then(response => {
            try {
                if (response.data.success) {
                    const res = response.data.data
                    console.log('getRecipeGem', res)
                    setInventoryData(res.recipeListFinal)
                    setPage(1)
                    setOnLoading(false)
                } else {
                    this.props.callback_Logout() //Logout because the user forced the API
                }
            } catch ( err ) {
                console.error(err)
            }
        })
        .catch(error => {
            error.response.status == 500
            && props.callback_Logout()
        
            error.response.status == 401
            && props.callback_Logout()
        })
    }

    // buy tab
    const [buyList, setBuyList] = useState([])
    const getBuyRecipes = () => {
        setOnLoading(true)
        axios({
            method: 'post',
            url: '/api/m1/inventory/getBundleGem',
            data: {
                address: props.metamask.walletAccount
            }
        })
        .then(response => {
            try {
                if (response.data.success) {
                    const res = response.data.data
                    console.log('getBundleGem', res)
                    setBuyList(res.gemList)
                    setOnLoading(false)
                } else {
                    this.props.callback_Logout() //Logout because the user forced the API
                }
            } catch ( err ) {
                console.error(err)
            }
        })
        .catch(error => {
            error.response.status == 500
            && props.callback_Logout()
        
            error.response.status == 401
            && props.callback_Logout()
        })
    }

    // pagination
    const [pageSize, setPageSize] = useState(8)
    const [page, setPage] = useState(1)
    const goToPrevPage = () => {
        playSound('button')
        if ( page > 1 ) {
            setPage(page - 1)
        }
    }
    const goToNextPage = () => {
        playSound('button')
        if ( page * pageSize < inventoryData.length ) {
            setPage(page + 1)
        }
    }

    // doingAction flag - when the user call APIs which is not loading-api
    const [doingAction, setDoingAction] = useState(false)

    // detail view when click on the recipe
    const [detailVisible, setDetailVisible] = useState(false)
    const [currentInventory, setCurrentInventory] = useState({})
    const [maxPossibleCraftCount, setMaxPossibleCraftCount] = useState(1)
    const onCloseDetailView = (e) => {
        setDetailVisible(false)
    }
    const onInventoryClick = (inventory) => {
        setConfirmActionType('load')
        setDoingAction(true)
        axios({
            method: 'post',
            url: '/api/m1/inventory/getRecipeGemInstance',
            data: {
                address: props.metamask.walletAccount,
                idDelegate: idDelegate,
                idRecipe: inventory.id
            }
        })
        .then(response => {
            try {
                if (response.data.success) {
                    const res = response.data.data
                    console.log('getRecipeGemInstance', res)
                    setCurrentInventory(res.recipeGemData)
                    setMaxPossibleCraftCount(res.recipeGemData.maxPossibleCraftCount)
                    setConsumableSlots(new Array(res.recipeGemData.craft.requirements.length))
                    setDoingAction(false)
                    onResetConsumables()
                    setCraftRecipeCount(1)
                    setDetailVisible(true)
                } else {
                    this.props.callback_Logout() //Logout because the user forced the API
                }
            } catch ( err ) {
                console.error(err)
            }
        })
        .catch(error => {
            error.response.status == 500
            && props.callback_Logout()
        
            error.response.status == 401
            && props.callback_Logout()
        })
    }

    // consumables manage
    const [ craftConsumables, setCraftConsumables ] = useState([{}, {}])
    const [ consumableOpen, setConsumableOpen ] = useState('')
    const [ consumableAnchorEl, setConsumableAnchorEL ] = useState(null)
    const [ consumableSlots, setConsumableSlots ] = useState([])
    const onResetConsumables = () => {
        setCraftConsumables([{}, {}])
    }
    const onConsumableClick = (consumType, pconsumable) => {
        onCloseConsumable()
        if ( consumType == 'craft1' ) {
            setCraftConsumables(craftConsumables.map((consumable, index) => (index == 0 ? pconsumable : consumable)))
        } else if ( consumType == 'craft2' ) {
            setCraftConsumables(craftConsumables.map((consumable, index) => (index == 1 ? pconsumable : consumable)))
        }
    }
    const onConsumableBtnClick = (e, type) => {
        setConsumableAnchorEL(e.currentTarget)
        setConsumableOpen(type)
    }
    const onConsumableSlotClick = (tool, index) => {
        var newConsumableSlots = JSON.parse(JSON.stringify(consumableSlots))
        newConsumableSlots[index] = {id: tool.id, image: tool.image}
        setConsumableSlots(newConsumableSlots)
        onCloseConsumable()
    }
    const onCloseConsumable = () => {
        setConsumableOpen('')
    }

    // confirm, confirmed steps
    const [confirmModalOpen, setConfirmModalOpen] = useState(false)
    const [burnToolList, setBurnToolList] = useState([])
    const [slotNeed, setSlotNeed] = useState(true)
    const onActionBtnClick = (actionType) => {
        playSound('button')

        if ( actionType == 'craft' ) {
            var newBurnToolList = []
            var requirements = currentInventory.craft.requirements, i
            for ( i = 0 ; i < requirements.length ; ++ i ) {
                if ( requirements[i].burn ) {
                    if ( consumableSlots[i] == undefined ) {
                        break
                    }
                    newBurnToolList.push(consumableSlots[i].id)
                }
            }
            if ( i == requirements.length ) {
                setBurnToolList(newBurnToolList)
                setSlotNeed(false)
            } else {
                setSlotNeed(true)
            }
        } else if ( actionType == 'purchase' ) {
        }

        playSound('confirm')
        setConfirmActionType(actionType)
        setConfirmModalOpen(true)
    }
    const onCloseConfirmModal = () => {
        setConfirmModalOpen(false)
    }
    const [confirmActionType, setConfirmActionType] = useState(null)
    const onDoAction = () => {
        onCloseConfirmModal()
        setDoingAction(true)

        if ( confirmActionType == 'craft' ) {
            axios.post('/api/m1/inventory/craftGem',{
                address: props.metamask.walletAccount,
                idDelegate: idDelegate,
                idRecipe: currentInventory.id,
                burnToolIds: burnToolList,
                consumableIds: [craftConsumables[0].id, craftConsumables[1].id],
                craftCount: craftRecipeCount
            })
            .then(response => onDidAction(response))
            .catch(error => console.log(error))
        } else if ( confirmActionType == 'purchase' ) {
            Purchase();
        }
    }

    // toast
    const loading = (message) => toast.loading(message);
    const notify = (error) => toast.error(error);

    // purchase process
    const Purchase = async () => {
        console.log('purchase', currentBundle, purchaseCount)
        console.log('metamask', props.metamask)

        // check user's balance to purchase
        const purchaseNativePrice = currentBundle.price * purchaseCount
        const currentBalanceNative = await checkBalanceNATIVE()
        console.log(currentBalanceNative)
        if ( currentBalanceNative < purchaseNativePrice ) {
            onDidAction({
                data: {
                    success: false, 
                    error: {
                        errorMessage: `You haven't got enough MATIC to purchase, you have ${toFixed(currentBalanceNative, 4)} MATIC now`
                    }
                }
            })
        } else {
            // call ABI-Purchase
            mint()
        }
    }
    const checkBalanceNATIVE = async () => {
        const balance = await props.metamask.walletProvider.getBalance(props.metamask.walletAccount);
        console.log('wallet balance', balance);
        return(ethers.utils.formatEther(balance))
    }

    const mint = async () => {
        //Vars Declaration
        let mint = null;
        let receipt = null;
        
        //Initialize the Contract Object
        let contract = new ethers.Contract(contractAlphaMarketplaceAddress, contractAlphaMarketplaceABI, props.metamask.walletSigner);
    
        //Purchase
        let overrides = {
            value: ethers.utils.parseEther(toFixed(currentBundle.price * purchaseCount, 4).toString())
        }; //Because it's NATIVE CURRENCY

        try {
            mint = await contract.purchase(
                currentBundle.idBundleGems,
                purchaseCount,
                overrides
            );
        } catch ( err ) {
            notify(err.message);
            setDoingAction(false);
            return
        }

        if ( mint ) {
            let toastLoading = loading('Purchasing... Almost done!')
    
            receipt = await mint.wait();
    
            toast.update(toastLoading, { 
                render: "Done!", 
                type: "success", 
                isLoading: false,
                autoClose: 5000  });
        
            onDidAction({
                data: {
                    success: true, 
                    data: {
                        message: "Successfully done."
                    }
                }
            })
        } else {
           notify('Error, try again!');
           setDoingAction(false);
        }
    }

    // craft result
    const [actionResModalOpen, setActionResModalOpen] = useState(false)
    const [actionRes, setActionRes] = useState(null)
    const [resActionType, setResActionType] = useState('')
    const onDidAction = (response) => {
        console.log('didAction confirmActionType: ', response)
        playSound(confirmActionType)

        if ( confirmActionType == 'craft' ) {
            onResetConsumables()
            setCraftRecipeCount(1)
        }

        if ( response.data.success ) {
            if ( confirmActionType == 'craft' ) {
                props.callback_setInventory(response.data.data.storage)
                setCurrentInventory(JSON.parse(JSON.stringify(response.data.data.currentRecipeData)))
                setMaxPossibleCraftCount(response.data.data.currentRecipeData.maxPossibleCraftCount)
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

    // bundle process
    const [currentBundle, setCurrentBundle] = useState(null)
    const [purchaseCount, setPurchaseCount] = useState(1)

    // craft recipe count the user enters
    const [craftRecipeCount, setCraftRecipeCount] = useState(1)

    return ( <>
        <div className={'game-component ' + classNameForComponent}>
            <div className='game-container'>
                <div className='header'>
                    <span className='title'>{componentTitle}</span>
                </div>
                <div className='content'>
                    { (onLoading || doingAction) &&
                    <div className='api-loading'>
                        {/* confirmActionType == 'craft' ? <>
                            <img className='apiCallingGif' src={craftingGif} />
                        </> :  */<span className='apiCallLoading'></span>}
                        <span className={'loader ' + confirmActionType + '-loader'}></span>
                    </div>}
                    { hasTab && !detailVisible &&
                    <div className='tab-navs'>
                        { tabNames.map((tabName, index) => (
                            <div key={index} className={'tab-nav ' + (currentTabIndex === index ? 'active' : '')} onClick={() => tabChanged(index)}>{tabName}</div>
                        ))}
                    </div>}
                    <div className={'scroll-content' + (currentTabIndex == 0 ? " buy-gem-tab" : "")}>
                        { !onLoading && ( currentTabIndex == 1 ? <>
                        {/* Use TAB */}
                        {(!detailVisible && inventoryData.length) ?
                            <div className='craft-items'>
                                {inventoryData?.map((inventory, index) => (
                                    index >= pageSize * (page - 1) && index < pageSize * page &&
                                    <div key={index} className='craft-item-wrapper'>
                                        <div
                                            className='craft-item'
                                            onClick={() => {onInventoryClick(inventory)}}
                                        >
                                            <div className='craft-item-container'>
                                                <div className='craft-item-name'>
                                                    <span>{inventory.name}</span>
                                                </div>
                                                <img className='craft-item-img' src={inventory.image ? inventory.image : '..'}></img>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div> : null}

                        {!inventoryData.length ?
                            <>
                                <p className='notAvailableATM'>
                                    Hello Citizen! Welcome to my Emporium. I’m currently lost in my expeditions, I’ll be back soon with the best trades in the Empire!
                                </p>
                                <img src={imgEmporium} className='notAvailableATM_Img'/>
                            </>
                        : null}
                        

                        {detailVisible &&
                        <div className={'detailView'}>
                            <div className='container'>
                                <div className='left-side'>
                                    <div className='backBtn' onClick={onCloseDetailView}>
                                        <img className='backImg' src={iconBack} />
                                        <span className='backText'>Back</span>
                                    </div>
                                    <img className='inventory-image' src={currentInventory.image} />
                                    <span className='inventory-name'>
                                        {currentInventory.name}
                                    </span>
                                    {(idDelegate == null || delegationData.inventory) && <span className='inventory-description'>{currentInventory.description}</span>}
                                </div>
                                <div className='right-side'>
                                {(idDelegate == null || delegationData.inventory) ? <>
                                    {currentInventory.isAvailable && (currentInventory.isAvailable.craft == true || currentInventory.isAvailable.craft == false) &&
                                    <div className='action-panel craft-panel'>
                                        <div className='awards'>
                                            <div className='award-desc'>What will you get: </div>
                                            <img className='award-image' src={currentInventory.craft.product.image} />
                                            <div className='award-name'>{currentInventory.craft.product.name}</div>
                                            <div className='award-quantity'> x{currentInventory.craft.product.quantity}</div>
                                        </div>
                                        {currentInventory.isAvailable.craft ?
                                        <div className='needs'>
                                        <div className='actions'>
                                            <div className='multiple-description'>
                                                You can craft max 100 recipes at a time.
                                            </div>
                                            <input
                                                className='multipleInput'
                                                step={1}
                                                type='number'
                                                value={craftRecipeCount}
                                                onKeyPress={(e) => {
                                                    if (e.code === 'Minus') {
                                                        e.preventDefault();
                                                    } else if (e.code === 'NumpadSubtract') {
                                                        e.preventDefault();
                                                    } else if (e.code === 'Period') {
                                                        e.preventDefault();
                                                    } else if (e.code === 'NumpadDecimal') {
                                                        e.preventDefault();
                                                    } else if (e.code === 'Equal') {
                                                        e.preventDefault();
                                                    } else if (e.code === 'NumpadAdd') {
                                                        e.preventDefault();
                                                    } else if (e.code === 'Comma') {
                                                        e.preventDefault();
                                                    } else if (e.code === 'KeyE') {
                                                        e.preventDefault();
                                                    }
                                                }}
                                                onChange={(e) => {
                                                    if ( e.target.value == 0 ) {
                                                        setCraftRecipeCount('')
                                                    } else {
                                                        setCraftRecipeCount(Math.max(Math.min(maxPossibleCraftCount, parseInt(e.target.value), (currentInventory.craft.hasToolBurn ? 1 : 100)), 1));
                                                    }
                                                }}
                                                />
                                            <div className={'actionBtn craftBtn' + (currentInventory.craft.isAllowed ? '' : ' notAllowed')}>
                                                <Button variant="contained" onClick={() => onActionBtnClick('craft')}>
                                                    Craft
                                                </Button>
                                            </div>
                                            <div className='consumables'>
                                                { currentInventory.craft.hasConsumables ?
                                                <><span className='desc'>Consumable</span>
                                                <div className='consumable-panel'>
                                                    <div
                                                        className={'consumableBtn' + (currentInventory.craft.isAllowed ? '' : ' notAllowed')}
                                                        onClick={(e) => {onConsumableBtnClick(e, 'craft1')}}
                                                        id='craftConsumableBtn1'
                                                        aria-controls={consumableOpen == 'craft' ? 'craftConsumableMenu1' : undefined}
                                                        aria-haspopup="true"
                                                        aria-expanded={consumableOpen == 'craft' ? 'true' : undefined}
                                                    >
                                                        { craftConsumables[0].id != undefined && <img className='consumable-image' src={craftConsumables[0].image}></img>}
                                                    </div>
                                                    <Menu
                                                        id='craftConsumableMenu1'
                                                        anchorEl={consumableAnchorEl}
                                                        open={consumableOpen == 'craft1'}
                                                        onClose={onCloseConsumable}
                                                        MenuListProps={{
                                                            'aria-labelledby': 'craftConsumableBtn1',
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
                                                        {currentInventory.craft.consumables.map((consumable, index) => (
                                                            consumable.id != craftConsumables[0].id && consumable.id != craftConsumables[1].id &&
                                                            <MenuItem key={index} onClick={() => onConsumableClick('craft1', consumable)}>
                                                                <img className='consumableImage' src={consumable.image}></img>
                                                                <div className='consumableDesc'>
                                                                    <span className='consumableQuantity'>x {consumable.quantity}</span>
                                                                    <span className='consumableName'>{consumable.name}</span>
                                                                    <span className='consumableDescription'>{consumable.description}</span>
                                                                </div>
                                                            </MenuItem>
                                                        ))}
                                                    </Menu>
                                                    <div
                                                        className={'consumableBtn' + (currentInventory.craft.isAllowed ? '' : ' notAllowed')}
                                                        onClick={(e) => {onConsumableBtnClick(e, 'craft2')}}
                                                        id='craftConsumableBtn2'
                                                        aria-controls={consumableOpen == 'craft' ? 'craftConsumableMenu2' : undefined}
                                                        aria-haspopup="true"
                                                        aria-expanded={consumableOpen == 'craft' ? 'true' : undefined}
                                                    >
                                                        { craftConsumables[1].id != undefined && <img className='consumable-image' src={craftConsumables[1].image}></img>}
                                                    </div>
                                                    <Menu
                                                        id='craftConsumableMenu2'
                                                        anchorEl={consumableAnchorEl}
                                                        open={consumableOpen == 'craft2'}
                                                        onClose={onCloseConsumable}
                                                        MenuListProps={{
                                                            'aria-labelledby': 'craftConsumableBtn2',
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
                                                        {currentInventory.craft.consumables.map((consumable, index) => (
                                                            consumable.id != craftConsumables[0].id && consumable.id != craftConsumables[1].id &&
                                                            <MenuItem key={index} onClick={() => onConsumableClick('craft2', consumable)}>
                                                                <img className='consumableImage' src={consumable.image}></img>
                                                                <div className='consumableDesc'>
                                                                    <span className='consumableQuantity'>x {consumable.quantity}</span>
                                                                    <span className='consumableName'>{consumable.name}</span>
                                                                    <span className='consumableDescription'>{consumable.description}</span>
                                                                </div>
                                                            </MenuItem>
                                                        ))}
                                                    </Menu>
                                                </div>
                                                <div className='resetBtn'>
                                                    <Button variant="contained" onClick={() => onResetConsumables()}>
                                                        Reset
                                                    </Button>
                                                </div></> :
                                                <div className='noConsumableText'>
                                                    No Consumable
                                                </div>}
                                            </div>
                                        </div>
                                        <div className='cost-list'>
                                            {currentInventory.craft.requirements.length == 0 &&
                                            <div className='noRequirementsText'>No requirements</div>}
                                            {currentInventory.craft.requirements.map((requirement, index) => (
                                                <div key={index} className={'cost' + (requirement.isAllowed ? '' : ' notAllowed')}>
                                                    <div className='costDesc'>
                                                        {
                                                        requirement.level == undefined ? <span className='costQuantity'>x {requirement.quantity}</span> :
                                                        requirement.burn == 1 ? <span className='burnMark'>Sacrifice</span> : null
                                                        }
                                                        <span className='costName'>{requirement.name}{requirement.level != undefined ? ' + ' + requirement.level : ''}</span>
                                                    </div>
                                                    { requirement.burn != 1 && <img className='costImg' src={requirement.image} /> }
                                                    { requirement.burn == 1 &&
                                                    <>
                                                    <div
                                                        className={'consumableBtn'}
                                                        onClick={(e) => {onConsumableBtnClick(e, 'consumableSlot' + index)}}
                                                        id={'consumableSlot' + index}
                                                        aria-controls={consumableOpen == 'consumableSlot' + index ? 'consumableSlotMenu' + index : undefined}
                                                        aria-haspopup="true"
                                                        aria-expanded={consumableOpen == 'consumableSlot' + index ? 'true' : undefined}
                                                    >
                                                        { consumableSlots[index] != undefined && <img className='consumable-image' src={consumableSlots[index].image}></img>}
                                                    </div>
                                                    <Menu
                                                        id={'consumableSlotMenu' + index}
                                                        anchorEl={consumableAnchorEl}
                                                        open={consumableOpen == 'consumableSlot' + index}
                                                        onClose={onCloseConsumable}
                                                        MenuListProps={{
                                                            'aria-labelledby': 'craftConsumableBtn',
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
                                                            No More Tools
                                                        </div>
                                                        {toolList.map((tool, tIndex) => (
                                                            consumableSlots[index] == undefined && tool.level == requirement.level &&
                                                            <MenuItem key={tIndex} onClick={() => onConsumableSlotClick(tool, index)}>
                                                                <img className='consumableImage' src={tool.image}></img>
                                                                <div className='consumableDesc'>
                                                                    <span className='slotDurability'>Durable: {tool.durability}</span>
                                                                    <span className={'slotName' + tool.rarity}>{tool.name} + {tool.level}</span>
                                                                </div>
                                                            </MenuItem>
                                                        ))}
                                                    </Menu>
                                                    </>
                                                    }
                                                </div>
                                            ))}
                                        </div></div>
                                        :
                                        <span className='availableText'>Can't craft</span>}
                                    </div>}
                                </> :
                                <div className='item-description' style={{marginTop: "1rem"}}>
                                    {currentInventory.description}
                                </div>}
                                </div>
                            </div>
                        </div>
                        }
                        {!detailVisible &&
                        <div className='paginationPanel'>
                            <img className='actionBtn' src={iconBack} onClick={goToPrevPage} />
                            <img className='actionBtn' src={iconForward} onClick={goToNextPage} />
                        </div>}
                        </> : currentTabIndex == 0 ? <>
                        {/* Buy TAB */}
                        <div className='bundle-list'>
                            {buyList.map((bundle, index) => (
                                <GemBundle
                                    key={index}
                                    bundle={bundle}
                                    cb_purchase={(bundleInfo, purchaseCountInfo) => {
                                        setCurrentBundle(bundleInfo)
                                        setPurchaseCount(purchaseCountInfo)
                                        onActionBtnClick('purchase')
                                    }}
                                />
                            ))}
                        </div>
                        </>: currentTabIndex == 2 ? 
                        <>
                        <Scrollbars
                            style={{ width: '100%', height: '100%' }}
                            autoHide={false}
                            renderThumbVertical={props => <div {...props} className="thumb-vertical"/>}
                        >
                            <div className='bundle-list'>
                                {buyList.map((bundle, index) => (
                                    <GemBundle
                                        key={index}
                                        bundle={bundle}
                                        cb_purchase={(bundleInfo, purchaseCountInfo) => {
                                            setCurrentBundle(bundleInfo)
                                            setPurchaseCount(purchaseCountInfo)
                                            onActionBtnClick('purchase')
                                        }}
                                    />
                                ))}
                            </div>
                        </Scrollbars>
                        </> :null)
                        }
                    </div>
                </div>
            </div>

            <ToastContainer 
                position="top-right"
                autoClose={1500}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
            />
            
            <props.ConfirmContext.ConfirmationDialog
                open={confirmModalOpen}
                onClose={onCloseConfirmModal}
            >
                <DialogTitle>
                {
                    confirmActionType == 'craft' ? currentInventory.name : 
                    confirmActionType == 'purchase' ? currentBundle.name : null
                }
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                    {confirmActionType == 'craft' ? <>{
                        slotNeed ? 'You should select the tools to be burnt' : 
                        <>
                        Do you want to try the craft? The craft could fail.<br/>
                        Probability of Success: {currentInventory.craft?.probability}%<br/>
                        Multiple crafting could take some time, max a few minutes.
                        </>
                    }</> : 
                    confirmActionType == 'purchase' ? <>
                        Do you want to purchase "{currentBundle.name}" x{purchaseCount} with {format(toFixed(currentBundle.price * purchaseCount, 4))} MATIC?<br/>
                        Totally, you will get x{currentBundle.quantity * purchaseCount} "{currentBundle.itemName}"
                    </> : null}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        if ( confirmActionType == 'craft' ) {
                            slotNeed ? onCloseConfirmModal() : onDoAction()
                        } else {
                            onDoAction()
                        }
                    }} autoFocus>
                        Sure
                    </Button>
                </DialogActions>
            </props.ConfirmContext.ConfirmationDialog>

            <props.ConfirmContext.ConfirmedDialog
                open={actionResModalOpen}
                onClose={onCloseActionResModal}
            >
                <DialogTitle>
                    {confirmActionType == 'craft' ? (actionRes?.data.success && actionRes?.data.data.done ? 'Success!' : 'Failed!') :
                    (actionRes?.data.success ? 'Success!' : 'Failed!')}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {!actionRes?.data.success ? actionRes?.data.error.errorMessage : <>
                            {actionRes?.data.data.message}
                        </>}
                        
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

export default GameGem // Component_Name_You_Want