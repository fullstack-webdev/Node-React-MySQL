import './game-craft-inventory.scss';

import {
  useEffect,
  useState,
} from 'react';

import axios from 'axios';

import InfoIcon from '@mui/icons-material/Info';
import {
  Button,
  CircularProgress,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
  TextField,
} from '@mui/material';

import iconBack from '../../assets-game/arrow_back.svg';
import iconForward from '../../assets-game/arrow_forward.svg';
import chestOpeningGif from '../../assets-game/chestOpening.gif';
import { TableInventory } from '../../components-game';
import BonusBar from '../../components-game/bonus/BonusBar';
import BonusView from '../../components-game/bonus/BonusView';
/* import craftingGif from '../../assets-game/crafting.gif';
import sellingGif from '../../assets-game/selling.gif';
import sendingGif from '../../assets-game/sending.gif';
import toolRepairingGif from '../../assets-game/toolRepairing.gif';
import toolUpgradingGif from '../../assets-game/toolUpgrading.gif'; */
import { playSound } from '../../utils/sounds';
import {
  isAddress,
  isENS,
  isFloat,
  isInputPriceBannedChar,
  isInputQuantityBannedChar,
  isNegative,
  resolveENS,
  toFixed,
} from '../../utils/utils';

const tabNames = ['Items', 'Tools', 'Recipes', 'Listings']
const tabTypes = ['item', 'tool', 'recipe', 'listing']

function GameCraftInventory(props) {
  const [rodViewInfo, setRodViewInfo] = useState(props.rodViewInfo)
  useEffect(() => { setRodViewInfo(props.rodViewInfo) }, [props.rodViewInfo])

  const [idDelegate, setIdDelegate] = useState(props.idDelegate)
  useEffect(() => { setIdDelegate(props.idDelegate) }, [props.idDelegate])
  const [delegationData, setDelegationData] = useState(props.delegationData)
  useEffect(() => { setDelegationData(props.delegationData) }, [props.delegationData])

  const [onLoading, setOnLoading] = useState(true)
  const [inventoryData, setInventoryData] = useState([])
  useEffect(() => {
    if (rodViewInfo != null) {
      setPage(1)
      setCurrentTabIndex(1)
    }

    setOnLoading(true)
    axios({
      method: 'post',
      url: '/api/m1/inventory/getInventoryList',
      data: {
        address: props.metamask.walletAccount,
        idDelegate: idDelegate
      }
    })
      .then(response => {
        try {
          if (response.data.success) {
            const res = response.data.data
            console.log(res)
            setInventoryData(res.inventoryList)
            if (rodViewInfo != null) {
              onMiniMenuClick('view', { id: rodViewInfo.id, type: 'tool' })
            } else {
              setOnLoading(false)
            }
          } else {
            this.props.callback_Logout() //Logout because the user forced the API
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

  const [pageSize, setPageSize] = useState(8)
  const [page, setPage] = useState(1)
  const goToPrevPage = () => {
    playSound('button')
    if (page > 1) {
      setPage(page - 1)
    }
  }
  const goToNextPage = () => {
    playSound('button')
    var inventoryCount = 0
    for (var i = 0; i < inventoryData.length; ++i) {
      if (inventoryData[i].type == tabTypes[currentTabIndex]) {
        ++inventoryCount
      }
    }
    if (page * pageSize < inventoryCount) {
      setPage(page + 1)
    }
  }
  const [currentTabIndex, setCurrentTabIndex] = useState(0)
  const tabChanged = (tabIndex) => {
    playSound('tab')
    setCurrentTabIndex(tabIndex)
  }

  const [showInventoryData, setShowInventoryData] = useState([])
  useEffect(() => {
    var list = []
    for (var i = 0; i < inventoryData.length; ++i) {
      if (inventoryData[i].type == tabTypes[currentTabIndex]) {
        list.push(inventoryData[i])
      }
    }
    setShowInventoryData(list)
    setPage(1)
  }, [inventoryData, currentTabIndex])

  const [apiLoading, setApiLoading] = useState(false)
  const [miniMenuAnchorEl, setMiniMenuAnchorEl] = useState(null)
  const [miniAction, setMiniAction] = useState('')
  const [visibleMiniMenuIndex, setVisibleMiniMenuIndex] = useState(-1)
  const onInventoryClick = (e, inventoryIndex) => {
    setMiniMenuAnchorEl(e.currentTarget)
    setVisibleMiniMenuIndex(inventoryIndex)
  }

  const [maxPossibleCraftCount, setMaxPossibleCraftCount] = useState(1)
  const onMiniMenuClick = (action, inventory) => {
    setMiniAction(action)
    onCloseMiniMenu()
    setConfirmActionType('load')
    setApiLoading(true)
    axios({
      method: 'post',
      url: '/api/m1/inventory/getInventoryInstanceData',
      data: {
        address: props.metamask.walletAccount,
        idDelegate: idDelegate,
        idInventoryInstance: inventory.id,
        inventoryType: inventory.type
      }
    })
      .then(response => {
        try {
          if (response.data.success) {
            const res = response.data.data
            // console.log(res)
            console.log(res.inventoryInstanceData)
            setCurrentInventory(res.inventoryInstanceData)
            if (res.inventoryInstanceData.type == 'recipe') {
              setMaxPossibleCraftCount(res.inventoryInstanceData.maxPossibleCraftCount)
              setConsumableSlots(new Array(res.inventoryInstanceData.craft.requirements.length))
            }
            setApiLoading(false)
            setOnLoading(false)
            onResetConsumables()
            setSendQuantity(1)
            setSellQuantity(1)
            setSellUnitCost(0.1)
            setSellDay(1)
            setSellHour(1)
            setOpenChestCount(1)
            setCraftRecipeCount(1)
            setDetailVisible(true)
          } else {
            this.props.callback_Logout() //Logout because the user forced the API
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
  }
  const onCloseMiniMenu = () => {
    setVisibleMiniMenuIndex(-1)
  }

  const [detailVisible, setDetailVisible] = useState(false)
  const [currentInventory, setCurrentInventory] = useState({})

  const [consumableOpen, setConsumableOpen] = useState('')
  const [consumableAnchorEl, setConsumableAnchorEL] = useState(null)
  const [repairConsumables, setRepairConsumables] = useState([{}, {}])
  const [upgradeConsumables, setUpgradeConsumables] = useState([{}, {}])
  const [craftConsumables, setCraftConsumables] = useState([{}, {}])

  const [toolList, setToolList] = useState([])
  const [consumableSlots, setConsumableSlots] = useState([])
  useEffect(() => {
    var newToolList = []
    for (var i = 0; i < inventoryData.length; ++i) {
      if (inventoryData[i].type == 'tool') {
        newToolList.push(inventoryData[i])
      }
    }
    setToolList(newToolList)
  }, [inventoryData])
  useEffect(() => {
    // console.log(currentInventory)
    if (currentInventory.type == 'recipe') {
      setConsumableSlots(new Array(currentInventory.craft.requirements.length))
    }
  }, [currentInventory])
  const onConsumableSlotClick = (tool, index) => {
    var newConsumableSlots = JSON.parse(JSON.stringify(consumableSlots))
    newConsumableSlots[index] = { id: tool.id, image: tool.image }
    setConsumableSlots(newConsumableSlots)
    onCloseConsumable()
  }

  const onCloseDetailView = (e) => {
    setDetailVisible(false)
  }

  const onConsumableBtnClick = (e, type) => {
    setConsumableAnchorEL(e.currentTarget)
    setConsumableOpen(type)
  }
  const onCloseConsumable = () => {
    setConsumableOpen('')
  }



  //SEND
  const [sendQuantity, setSendQuantity] = useState('')
  const [sendAddress, setSendAddress] = useState('')
  const [sendResolvedAddress, setSendResolvedAddress] = useState('')
  useEffect(() => {
    async function resolve() { setSendResolvedAddress(await resolveENS(sendAddress)) }
    resolve();
  }, [sendAddress])
  const [sendAddressErrorName, setSendAddressErrorName] = useState('')
  const [sendQuantityErrorName, setSendQuantityErrorName] = useState('')


  //CONSUMABLES
  const onConsumableClick = (consumType, pconsumable) => {
    onCloseConsumable()
    if (consumType == 'repair1') {
      setRepairConsumables(repairConsumables.map((consumable, index) => (index == 0 ? pconsumable : consumable)))
    } else if (consumType == 'repair2') {
      setRepairConsumables(repairConsumables.map((consumable, index) => (index == 1 ? pconsumable : consumable)))
    } else if (consumType == 'upgrade1') {
      setUpgradeConsumables(upgradeConsumables.map((consumable, index) => (index == 0 ? pconsumable : consumable)))
    } else if (consumType == 'upgrade2') {
      setUpgradeConsumables(upgradeConsumables.map((consumable, index) => (index == 1 ? pconsumable : consumable)))
    } else if (consumType == 'craft1') {
      setCraftConsumables(craftConsumables.map((consumable, index) => (index == 0 ? pconsumable : consumable)))
    } else if (consumType == 'craft2') {
      setCraftConsumables(craftConsumables.map((consumable, index) => (index == 1 ? pconsumable : consumable)))
    }
  }
  const onResetConsumables = (consumType = '') => {
    if (consumType == '') {
      setRepairConsumables([{}, {}])
      setUpgradeConsumables([{}, {}])
      setCraftConsumables([{}, {}])
    } else if (consumType == 'repair') {
      setRepairConsumables([{}, {}])
    } else if (consumType == 'upgrade') {
      setUpgradeConsumables([{}, {}])
    } else if (consumType == 'craft') {
      setCraftConsumables([{}, {}])
    }
  }



  //SELL
  const [sellQuantity, setSellQuantity] = useState('')
  const [sellUnitCost, setSellUnitCost] = useState('')
  const [sellDay, setSellDay] = useState('')
  const [sellHour, setSellHour] = useState('')



  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [confirmActionType, setConfirmActionType] = useState(null)
  const [burnToolList, setBurnToolList] = useState([])
  const [slotNeed, setSlotNeed] = useState(true)
  const onActionBtnClick = (actionType) => {
    playSound('button')
    if (actionType == 'craft') {
      var newBurnToolList = []
      var requirements = currentInventory.craft.requirements, i
      for (i = 0; i < requirements.length; ++i) {
        if (requirements[i].burn) {
          if (consumableSlots[i] == undefined) {
            break
          }
          newBurnToolList.push(consumableSlots[i].id)
        }
      }
      if (i == requirements.length) {
        setBurnToolList(newBurnToolList)
        setSlotNeed(false)
      } else {
        setSlotNeed(true)
      }
    }
    playSound('confirm')
    setActionRes(null)
    setConfirmActionType(actionType)
    setConfirmModalOpen(true)
  }
  const onCloseConfirmModal = () => {
    setConfirmModalOpen(false)
  }
  const onDoAction = () => {
    onCloseConfirmModal()
    setApiLoading(true)

    // call api with {confirmActionType, currentInventory}
    var actionType = confirmActionType
    if (actionType == 'send' && currentInventory.type == 'item') actionType = `sendItem`
    if (actionType == 'send' && currentInventory.type == 'tool') actionType = `sendTool`
    if (actionType == 'send' && currentInventory.type == 'recipe') actionType = `sendRecipe`


    switch (actionType) {
      case 'sendItem':
        axios.post('/api/m1/inventory/sendItem', {
          address: props.metamask.walletAccount,
          idDelegate: idDelegate,
          receiver: sendResolvedAddress,
          idItemInstance: currentInventory.id,
          quantity: sendQuantity
        })
          .then(response => onDidAction(response))
          .catch(error => console.log(error))
        break
      case 'sendTool':
        axios.post('/api/m1/inventory/sendTool', {
          address: props.metamask.walletAccount,
          idDelegate: idDelegate,
          receiver: sendResolvedAddress,
          idToolInstance: currentInventory.id,
          quantity: 1
        })
          .then(response => onDidAction(response))
          .catch(error => console.log(error))
        break
      case 'sendRecipe':
        axios.post('/api/m1/inventory/sendRecipe', {
          address: props.metamask.walletAccount,
          idDelegate: idDelegate,
          receiver: sendResolvedAddress,
          idRecipeInstance: currentInventory.id,
          quantity: sendQuantity
        })
          .then(response => onDidAction(response))
          .catch(error => console.log(error))
        break
      case 'repair':
        axios.post('/api/m1/inventory/repairTool', {
          address: props.metamask.walletAccount,
          idDelegate: idDelegate,
          idToolInstance: currentInventory.id,
          consumableIds: [repairConsumables[0].id, repairConsumables[1].id]
        })
          .then(response => onDidAction(response))
          .catch(error => console.log(error))
        break
      case 'upgrade':
        axios.post('/api/m1/inventory/upgradeTool', {
          address: props.metamask.walletAccount,
          idDelegate: idDelegate,
          idToolInstance: currentInventory.id,
          consumableIds: [upgradeConsumables[0].id, upgradeConsumables[1].id]
        })
          .then(response => onDidAction(response))
          .catch(error => console.log(error))
        break
      case 'craft':
        axios.post('/api/m1/inventory/craft', {
          address: props.metamask.walletAccount,
          idDelegate: idDelegate,
          idRecipeInstance: currentInventory.id,
          burnToolIds: burnToolList,
          consumableIds: [craftConsumables[0].id, craftConsumables[1].id],
          craftCount: craftRecipeCount
        })
          .then(response => onDidAction(response))
          .catch(error => console.log(error))
        break;
      case 'chest':
        axios.post('/api/m1/inventory/openChest', {
          address: props.metamask.walletAccount,
          idDelegate: idDelegate,
          idItemInstance: currentInventory.id,
          openCount: openChestCount
        })
          .then(response => onDidAction(response))
          .catch(error => console.log(error))
        break;
      case 'sell':
        axios.post('/api/m1/marketplaceInventory/createAd', {
          address: props.metamask.walletAccount,
          idDelegate: idDelegate,
          id: currentInventory.id,
          inventoryType: currentInventory.type,
          quantity: sellQuantity,
          price: sellUnitCost,
          duration: (sellDay * 24 * 3600 + sellHour * 3600)
        })
          .then(response => onDidAction(response))
          .catch(error => console.log(error))
        break
      default:
        break
    }
  }

  const [actionResModalOpen, setActionResModalOpen] = useState(false)
  const [actionRes, setActionRes] = useState(null)
  const [resActionType, setResActionType] = useState('')
  const onDidAction = (response) => {
    console.log(response)
    playSound(confirmActionType)

    setOpenChestCount(1)
    setCraftRecipeCount(1)
    onResetConsumables()
    if (response.data.success) {
      props.callback_setInventory(response.data.data.storage)
      updateInventoryData(response)
    }
    setResActionType(confirmActionType)
    setActionRes(response)
    setApiLoading(false)
    setActionResModalOpen(true)
  }
  const onCloseActionResModal = () => {
    setActionResModalOpen(false)
    // setResActionType('')
  }
  const updateInventoryData = (response) => {
    if (response.data.success && response.data.data.inventory != undefined) {
      var orgInventoryData = JSON.parse(JSON.stringify(inventoryData))
      var orgCurrentInventory = JSON.parse(JSON.stringify(currentInventory))
      const inventory = response.data.data.inventory
      for (var i = 0; i < inventory.length; ++i) {
        const elements = inventory[i].elements
        for (var j = 0; j < elements.length; ++j) {
          const action = inventory[i].action, element = elements[j]
          if (action == 'edit') {
            editInventory(element, orgInventoryData, orgCurrentInventory)
          } else if (action == 'add') {
            addInventory(element, orgInventoryData)
          } else if (action == 'remove') {
            removeInventory(element, orgInventoryData)
          }
        }
      }
      var isCurrentInventoryEmpty = true
      for (var x in currentInventory) {
        if (x != undefined && x != null) {
          isCurrentInventoryEmpty = false
          break
        }
      }
      if (!isCurrentInventoryEmpty) {
        setCurrentInventory(orgCurrentInventory)
      }

      var newInventoryData = []
      for (var i = 0; i < orgInventoryData.length; ++i) {
        if (orgInventoryData[i].remove) {
          continue
        }
        newInventoryData.push(orgInventoryData[i])
      }
      setInventoryData(JSON.parse(JSON.stringify(newInventoryData)))
    }
  }
  const editInventory = (inventory, orgInventoryData, orgCurrentInventory) => {
    if (inventory.id == orgCurrentInventory.id && inventory.type == orgCurrentInventory.type) {
      for (var x in inventory) {
        orgCurrentInventory[x] = inventory[x]
        orgCurrentInventory[x] = inventory[x]
      }
      setMaxPossibleCraftCount(orgCurrentInventory.maxPossibleCraftCount)
    }
    for (var i = 0; i < orgInventoryData.length; ++i) {
      if (orgInventoryData[i].id == inventory.id && orgInventoryData[i].type == inventory.type) {
        for (var x in orgInventoryData[i]) {
          orgInventoryData[i][x] = inventory[x] != undefined ? inventory[x] : orgInventoryData[i][x]
        }
      }
    }
  }
  const addInventory = (inventory, orgInventoryData) => {
    orgInventoryData.push(inventory)
  }
  const removeInventory = (inventory, orgInventoryData) => {
    for (var i = 0; i < orgInventoryData.length; ++i) {
      if (orgInventoryData[i].id == inventory.id && orgInventoryData[i].type == inventory.type) {
        orgInventoryData[i].remove = true
      }
    }
    if (inventory.id == currentInventory.id && inventory.type == currentInventory.type) {
      setCurrentInventory({})
      setDetailVisible(false)
    }
  }

  const [chestLoots, setChestLoots] = useState([])
  const onChestInfoBtnClick = (loots) => {
    setChestLoots(loots)
    setOpenChestModal(true)
  }
  const [openChestModal, setOpenChestModal] = useState(false)
  const onCloseChestModal = () => {
    setOpenChestModal(false)
  }

  const [openChestCount, setOpenChestCount] = useState(1)
  const [craftRecipeCount, setCraftRecipeCount] = useState(1)

  return (<>
    <div className='game-component game-craft-inventory'>
      <div className='game-container'>
        <div className='header'>
          <span className='title'>Inventory</span>
        </div>
        <div className='content'>
          {apiLoading &&
            <div className='api-loading'>
              {/* {confirmActionType != 'chest' && <CircularProgress size={30} sx={{color:"gold"}} />} */}
              {confirmActionType == 'chest' ? <>
                <img className='apiCallingGif' src={chestOpeningGif} />
              </> /* : confirmActionType == 'repair' ? <>
                            <img className='apiCallingGif' src={toolRepairingGif} />
                        </> : confirmActionType == 'upgrade' ? <>
                            <img className='apiCallingGif' src={toolUpgradingGif} />
                        </> : confirmActionType == 'craft' ? <>
                            <img className='apiCallingGif' src={craftingGif} />
                        </> : confirmActionType == 'send' ? <>
                            <img className='apiCallingGif' src={sendingGif} />
                        </> : confirmActionType == 'sell' ? <>
                            <img className='apiCallingGif' src={sellingGif} />
                        </> */ : <span className='apiCallLoading'></span>}
              <span className={'loader ' + confirmActionType + '-loader'}></span>
            </div>}
          {!detailVisible &&
            <div className='tab-navs'>
              {tabNames.map((tabName, index) => ((idDelegate == null || index < 3 || delegationData.marketplace == 1) &&
                <div key={index} className={'tab-nav ' + (currentTabIndex == index ? 'active' : '')} onClick={() => !onLoading && tabChanged(index)}>{tabName}</div>
              ))}
            </div>}
          <div className='scroll-content'>
            {(!apiLoading && onLoading) ? <CircularProgress className='data-loading' size={50} sx={{ color: "gold" }} /> : currentTabIndex !== 3 ?
              <>
                {!detailVisible &&
                  <div className='craft-items'>
                    {showInventoryData.map((inventory, index) => (
                      index >= pageSize * (page - 1) && index < pageSize * page &&
                      <div key={index} className='craft-item-wrapper'>
                        <div
                          className='craft-item'
                          onClick={(e) => {
                            // if (inventory.type != 'tool' || e.target.className === 'bonus-view') {
                            onInventoryClick(e, index)
                            // }
                          }}
                          id={'inventory' + index}
                          aria-controls={visibleMiniMenuIndex == index ? 'mini-menu' + index : undefined}
                          aria-haspopup="true"
                          aria-expanded={visibleMiniMenuIndex == index ? 'true' : undefined}
                        >
                          <div className={'craft-item-container' + (inventory.isChest ? ' chest' : '')}>
                            {inventory.type == 'tool' && <>
                              <BonusBar info={inventory.bonuses} />
                              {/* <BonusView icon={true} info={inventory.bonuses} /> */}
                            </>}
                            <div className='craft-item-name'>
                              <span>{inventory.name}{inventory.type == 'tool' ? ' + ' + (inventory.level ? inventory.level : 0) : ''}</span>
                            </div>
                            <img className='craft-item-img' src={inventory.image ? inventory.image : '..'}></img>
                            <span className='craft-item-quantity'>{inventory.quantity ? (inventory.type != 'tool' ? inventory.quantity : '') : '..'}</span>
                          </div>
                        </div>
                        <Menu
                          id={'mini-menu' + index}
                          anchorEl={miniMenuAnchorEl}
                          open={visibleMiniMenuIndex == index}
                          onClose={onCloseMiniMenu}
                          MenuListProps={{
                            'aria-labelledby': 'inventory' + index,
                          }}
                          anchorOrigin={{
                            vertical: 'center',
                            horizontal: 'center',
                          }}
                          transformOrigin={{
                            vertical: 'top',
                            horizontal: 'center',
                          }}
                        >
                          {inventory.menu.view == 1 && <MenuItem onClick={() => onMiniMenuClick('view', inventory)}>View</MenuItem>}
                          {inventory.menu.send == 1 && (idDelegate == null || delegationData.transfer) && <MenuItem onClick={() => onMiniMenuClick('send', inventory)}>Send</MenuItem>}
                          {inventory.menu.craft == 1 && (idDelegate == null || delegationData.inventory) && <MenuItem onClick={() => onMiniMenuClick('craft', inventory)}>Craft</MenuItem>}
                          {inventory.menu.sell == 1 && (idDelegate == null || delegationData.marketplace) && <MenuItem onClick={() => onMiniMenuClick('sell', inventory)}>Sell</MenuItem>}
                        </Menu>
                      </div>
                    ))}
                  </div>}
                {detailVisible &&
                  <div className={'detailView'}>
                    <div className='container'>
                      <div className='left-side'>
                        <div className='backBtn' onClick={onCloseDetailView}>
                          <img className='backImg' src={iconBack} />
                          <span className='backText'>Back</span>
                        </div>
                        <div className='inventory-image'>
                          {currentInventory.type == 'tool' && <>
                            <BonusBar info={currentInventory.bonuses} />
                            <BonusView icon={true} info={currentInventory.bonuses} />
                          </>}
                          <img src={currentInventory.image} />
                        </div>
                        <span className='inventory-name'>
                          {currentInventory.name}
                          {(currentInventory.type == 'tool' && currentInventory.level >= 0)
                            ? ` + ${currentInventory.level ? currentInventory.level : 0}`
                            : null}
                        </span>
                        {(currentInventory.type != 'item' || currentInventory.isChest == 1) && (idDelegate == null || delegationData.inventory) && <span className='inventory-description'>{currentInventory.description}</span>}
                      </div>
                      {miniAction !== 'send' && miniAction !== 'sell' &&
                        <div className='right-side'>
                          {(currentInventory.type == 'item' && (idDelegate != null || currentInventory.isChest == 0)) &&
                            <div className='item-description'>
                              {currentInventory.description}
                            </div>}
                          {currentInventory.type == 'tool' &&
                            <div className='durability'>
                              <div className='durability-label'>
                                <span>
                                  Durability {currentInventory.durability == -1 ? ' ∞' : null}
                                </span>
                              </div>
                              {currentInventory.durability != -1
                                ? <div className='durability-show'>
                                  <div className='durabilityBar' style={{ background: `linear-gradient(to right, rgb(255 152 34) ${currentInventory.durability / currentInventory.durabilityTotal * 100}%, transparent 0), linear-gradient(to bottom, #9c9c9c 0%, #e2e5e9 100%) bottom` }}>
                                    {/* <div className='durabilityBar' style={{background: `linear-gradient(to right, rgb(255, 160, 50) ${currentInventory.durability / currentInventory.durabilityTotal * 100}%, transparent 0px),linear-gradient(to bottom, #9c9c9c 0%, #e2e5e9 100%) bottom`}}> */}
                                    <span className='durability-value'>
                                      {currentInventory.durability != -1
                                        ? <>
                                          <b>{currentInventory.durability}</b>
                                          / {currentInventory.durabilityTotal}
                                        </>
                                        : null
                                      }
                                    </span>
                                  </div>
                                  <span className='durability-text'>
                                    {parseInt(currentInventory.durability / currentInventory.durabilityTotal * 100)}%
                                  </span>
                                </div>
                                : null
                              }
                            </div>}
                          {(idDelegate == null || delegationData.inventory) ? <>
                            {currentInventory.chest && <>
                              <div className='action-panel loot-panel'>
                                <div className='lootDesc'>
                                  What can you get by opening this Chest?<br />
                                  You could get MIN <b>{currentInventory.chest.minDrops}</b> - MAX <b>{currentInventory.chest.maxDrops}</b> different items/recipes.
                                </div>
                                <IconButton className='iconBtn infoIcon' onClick={() => onChestInfoBtnClick(currentInventory.chest.loots)} aria-label="info">
                                  <InfoIcon />
                                </IconButton>
                              </div>
                              <div className='action-panel open-panel'>
                                <div className='actions'>
                                  <div className='multiple-description'>
                                    You can open max 10 chests at a time.
                                  </div>
                                  <input
                                    className='multipleInput'
                                    step={1}
                                    type='number'
                                    value={openChestCount}
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
                                      if (e.target.value == 0) {
                                        setOpenChestCount('')
                                      } else {
                                        setOpenChestCount(Math.max(Math.min(currentInventory.quantity, parseInt(e.target.value), 10), 1));
                                      }
                                    }}
                                  />
                                  <div className={'actionBtn openBtn' + ((!currentInventory.chest.isAllowed || openChestCount == '' || openChestCount < 1) ? ' notAllowed' : '')}>
                                    <Button variant="contained" onClick={() => onActionBtnClick('chest')}>
                                      Open
                                    </Button>
                                  </div>
                                </div>
                                <div className='cost-list'>
                                  {currentInventory.chest.requirements.length == 0 &&
                                    <div className='noRequirementsText'>No requirements</div>}
                                  {currentInventory.chest.requirements.map((requirement, index) => (
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
                            </>
                            }
                            {currentInventory.isAvailable && (currentInventory.isAvailable.repair == true || currentInventory.isAvailable.repair == false) &&
                              <div className='action-panel repair-panel'>
                                {currentInventory.isAvailable.repair ?
                                  <>
                                    <div className='actions'>
                                      <div className={'actionBtn repairBtn' + (currentInventory.repair.isAllowed ? '' : ' notAllowed')}>
                                        <Button variant="contained" onClick={() => onActionBtnClick('repair')}>
                                          Repair
                                        </Button>
                                      </div>
                                      <div className='consumables'>
                                        {currentInventory.repair.hasConsumables ?
                                          <>
                                            <span className='desc'>Consumable</span>
                                            <div className='consumable-panel'>
                                              <div
                                                className={'consumableBtn' + (currentInventory.repair.isAllowed ? '' : ' notAllowed')}
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
                                                {currentInventory.repair.consumables.map((consumable, index) => (
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
                                                className={'consumableBtn' + (currentInventory.repair.isAllowed ? '' : ' notAllowed')}
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
                                                {currentInventory.repair.consumables.map((consumable, index) => (
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
                                      {currentInventory.repair.requirements.length == 0 &&
                                        <div className='noRequirementsText'>No requirements</div>}
                                      {currentInventory.repair.requirements.map((requirement, index) => (
                                        <div key={index} className={'cost' + (requirement.isAllowed ? '' : ' notAllowed')}>
                                          <div className='costDesc'>
                                            <span className='costQuantity'>x {requirement.quantity}</span>
                                            <span className='costName'>{requirement.name}</span>
                                          </div>
                                          <img className='costImg' src={requirement.image} />
                                        </div>
                                      ))}
                                    </div></>
                                  :
                                  <span className='availableText'>Not repairable</span>}
                              </div>}
                            {currentInventory.isAvailable && (currentInventory.isAvailable.upgrade == true || currentInventory.isAvailable.upgrade == false) &&
                              <div className='action-panel upgrade-panel'>
                                {currentInventory.isAvailable.upgrade ?
                                  <>
                                    <div className='actions'>
                                      <div className={'actionBtn upgradeBtn' + (currentInventory.upgrade.isAllowed ? '' : ' notAllowed')}>
                                        <Button variant="contained" onClick={() => onActionBtnClick('upgrade')}>
                                          Upgrade
                                        </Button>
                                      </div>
                                      <div className='consumables'>
                                        {currentInventory.upgrade.hasConsumables ?
                                          <><span className='desc'>Consumable</span>
                                            <div className='consumable-panel'>
                                              <div
                                                className={'consumableBtn' + (currentInventory.upgrade.isAllowed ? '' : ' notAllowed')}
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
                                                {currentInventory.upgrade.consumables.map((consumable, index) => (
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
                                                className={'consumableBtn' + (currentInventory.upgrade.isAllowed ? '' : ' notAllowed')}
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
                                                {currentInventory.upgrade.consumables.map((consumable, index) => (
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
                                      {currentInventory.upgrade.requirements.length == 0 &&
                                        <div className='noRequirementsText'>No requirements</div>}
                                      {currentInventory.upgrade.requirements.map((requirement, index) => (
                                        <div key={index} className={'cost' + (requirement.isAllowed ? '' : ' notAllowed')}>
                                          <div className='costDesc'>
                                            <span className='costQuantity'>x {requirement.quantity}</span>
                                            <span className='costName'>{requirement.name}</span>
                                          </div>
                                          <img className='costImg' src={requirement.image} />
                                        </div>
                                      ))}
                                    </div></>
                                  :
                                  <span className='availableText'>Not upgradable</span>}
                              </div>}
                            {currentInventory.isAvailable && (currentInventory.isAvailable.craft == true || currentInventory.isAvailable.craft == false) &&
                              <div className='action-panel craft-panel'>
                                <div className='awards'>
                                  <div className='award-desc'>You will receive: </div>
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
                                          if (e.target.value == 0) {
                                            setCraftRecipeCount('')
                                          } else {
                                            setCraftRecipeCount(Math.max(Math.min(maxPossibleCraftCount, currentInventory.quantity, parseInt(e.target.value), (currentInventory.craft.hasToolBurn ? 1 : 100)), 1));
                                          }
                                        }}
                                      />
                                      <div className={'actionBtn craftBtn' + ((!currentInventory.craft.isAllowed || craftRecipeCount == '' || craftRecipeCount < 1) ? ' notAllowed' : '')}>
                                        <Button variant="contained" onClick={() => onActionBtnClick('craft')}>
                                          Craft
                                        </Button>
                                      </div>
                                      <div className='consumables'>
                                        {currentInventory.craft.hasConsumables ?
                                          <><span className='desc'>Consumable</span>
                                            <div className='consumable-panel'>
                                              <div
                                                className={'consumableBtn' + (currentInventory.craft.isAllowed ? '' : ' notAllowed')}
                                                onClick={(e) => { onConsumableBtnClick(e, 'craft1') }}
                                                id='craftConsumableBtn1'
                                                aria-controls={consumableOpen == 'craft' ? 'craftConsumableMenu1' : undefined}
                                                aria-haspopup="true"
                                                aria-expanded={consumableOpen == 'craft' ? 'true' : undefined}
                                              >
                                                {craftConsumables[0].id != undefined && <img className='consumable-image' src={craftConsumables[0].image}></img>}
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
                                                onClick={(e) => { onConsumableBtnClick(e, 'craft2') }}
                                                id='craftConsumableBtn2'
                                                aria-controls={consumableOpen == 'craft' ? 'craftConsumableMenu2' : undefined}
                                                aria-haspopup="true"
                                                aria-expanded={consumableOpen == 'craft' ? 'true' : undefined}
                                              >
                                                {craftConsumables[1].id != undefined && <img className='consumable-image' src={craftConsumables[1].image}></img>}
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
                                              <Button variant="contained" onClick={() => onResetConsumables('craft')}>
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
                                          {requirement.burn != 1 && <img className='costImg' src={requirement.image} />}
                                          {requirement.burn == 1 &&
                                            <>
                                              <div
                                                className={'consumableBtn'}
                                                onClick={(e) => { onConsumableBtnClick(e, 'consumableSlot' + index) }}
                                                id={'consumableSlot' + index}
                                                aria-controls={consumableOpen == 'consumableSlot' + index ? 'consumableSlotMenu' + index : undefined}
                                                aria-haspopup="true"
                                                aria-expanded={consumableOpen == 'consumableSlot' + index ? 'true' : undefined}
                                              >
                                                {consumableSlots[index] != undefined && <img className='consumable-image' src={consumableSlots[index].image}></img>}
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
                                                  (consumableSlots[index] == undefined || consumableSlots[index].id != tool.id) && tool.level == requirement.level && tool.idToolLevel == requirement.idToolLevel &&
                                                  <MenuItem key={tIndex} onClick={() => onConsumableSlotClick(tool, index)}>
                                                    <img className='consumableImage' src={tool.image}></img>
                                                    <div className='consumableDesc'>
                                                      <BonusBar info={tool.bonuses} />
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
                              </div>}</> :
                            currentInventory.type != 'item' && <div className='item-description' style={{ marginTop: "1rem" }}>
                              {currentInventory.description}
                            </div>}
                        </div>
                      }
                      {miniAction == 'send' &&
                        <div className='right-side'>
                          <div className='send-panel'>
                            <TextField
                              onChange={(e) => {
                                var str = e.target.value
                                if (typeof str !== 'string' && typeof str !== 'number') {
                                  setSendQuantityErrorName('Only positive integer.')
                                  setSendQuantity(str)
                                } else {
                                  setSendQuantityErrorName('')
                                  setSendQuantity(Number(str))
                                }
                              }}
                              value={sendQuantity}
                              placeholder={'1'}
                              label="Quantity"
                              variant="filled"
                              disabled={currentInventory.type == 'tool'}
                              helperText={`Max ${currentInventory.quantity}`}
                              error={!!sendQuantityErrorName}
                              required
                            />
                            <TextField
                              onChange={(e) => {
                                var address = e.target.value
                                let regex = /^0x[a-fA-F0-9]{40}$/
                                if (regex.test(address) || isENS(address)) {
                                  setSendAddressErrorName('')
                                  setSendAddress(e.target.value)
                                } else {
                                  setSendAddressErrorName('Invalid format address')
                                  setSendAddress(e.target.value)
                                }
                              }}
                              value={sendAddress}
                              placeholder={'0x000000 / ens.eth'}
                              label="Address"
                              variant="filled"
                              helperText={sendAddressErrorName}
                              error={!!sendAddressErrorName}
                              required
                            />
                            <Button
                              variant="contained"
                              disabled={!!sendQuantityErrorName || !!sendAddressErrorName}
                              onClick={() => {
                                onActionBtnClick('send')
                              }}
                            >
                              {!!sendQuantityErrorName || !!sendAddressErrorName ? 'Send' : 'Send'}
                            </Button>
                          </div>
                        </div>}
                      {miniAction == 'sell' &&
                        <div className='right-side'>
                          <div className='sell-panel'>
                            <TextField
                              onKeyPress={(e) =>
                                isInputQuantityBannedChar(e.code)
                                  ? e.preventDefault()
                                  : null
                              }
                              onChange={(e) => {
                                let quantity;

                                quantity = (
                                  e.target.value == ''
                                  || isNaN(e.target.value)
                                  || isNegative(e.target.value)
                                  || isFloat(sellQuantity)
                                )
                                  ? ''
                                  : e.target.value.replace(/[^0-9]/g, '');

                                setSellQuantity(quantity)
                              }}
                              type='number'
                              step='1'
                              maxLength='12'
                              value={sellQuantity}
                              placeholder={'1'}
                              helperText={`Max ${currentInventory.quantity}`}
                              label="Quantity"
                              variant="filled"
                              disabled={currentInventory.type == 'tool'}
                            />
                            <TextField
                              onKeyPress={(e) =>
                                isInputPriceBannedChar(e.code)
                                  ? e.preventDefault()
                                  : null
                              }
                              onChange={(e) => {
                                if (
                                  (e.target.value.toString().split('.').length > 1
                                    && e.target.value.toString().split('.')[1].length > 2)
                                  || isNaN(e.target.value)
                                  || isNegative(e.target.value)
                                  || sellUnitCost == '00'
                                ) setSellUnitCost('')
                                else setSellUnitCost(e.target.value)
                              }}
                              type='number'
                              step='0.01'
                              maxLength='12'
                              value={sellUnitCost}
                              placeholder={'0.01'}
                              label={`Price per Unit`}
                              helperText={`Total Price: ${toFixed(sellQuantity * sellUnitCost)} Ancien`}
                              variant="filled"
                            />
                            <TextField
                              onKeyPress={(e) =>
                                isInputQuantityBannedChar(e.code)
                                  ? e.preventDefault()
                                  : null
                              }
                              onChange={(e) => {
                                if (
                                  isNaN(e.target.value)
                                  || isNegative(e.target.value)
                                  || sellDay == '0'
                                  || parseInt(e.target.value) > 28
                                ) setSellDay('')
                                else setSellDay(e.target.value)
                              }}
                              type='number'
                              maxLength='2'
                              value={sellDay}
                              placeholder={'28'}
                              label="Day"
                              variant="filled"
                            />
                            <TextField
                              onKeyPress={(e) =>
                                isInputQuantityBannedChar(e.code)
                                  ? e.preventDefault()
                                  : null
                              }
                              onChange={(e) => {
                                if (
                                  isNaN(e.target.value)
                                  || isNegative(e.target.value)
                                  || sellHour == '0'
                                  || parseInt(e.target.value) > 23
                                ) setSellHour('')
                                else setSellHour(e.target.value)
                              }}
                              type='number'
                              maxLength='2'
                              value={sellHour}
                              placeholder={'23'}
                              label={'Hour'}
                              variant="filled"
                            />
                            <Button
                              variant="contained"
                              onClick={() => onActionBtnClick('sell')}
                              disabled={sellQuantity == 0 || sellUnitCost == 0 || (sellDay == 0 && sellHour == 0) || parseInt(sellQuantity) > parseInt(currentInventory.quantity)}
                            >
                              {sellQuantity == 0 || sellUnitCost == 0 || (sellDay == 0 && sellHour == 0) ? 'Sell' : 'Sell'}
                            </Button>
                          </div>
                        </div>}

                    </div>
                  </div>
                }
                {!detailVisible &&
                  <div className='paginationPanel'>
                    <img className='actionBtn' src={iconBack} onClick={goToPrevPage} />
                    <img className='actionBtn' src={iconForward} onClick={goToNextPage} />
                  </div>}
              </> :
              <TableInventory
                metamask={props.metamask}
                inventory={props.inventory}
                callback_Logout={() => props.callback_Logout()}

                idDelegate={idDelegate}
              />}
          </div>
        </div>
      </div>
      <props.ConfirmContext.ConfirmationDialog
        open={openChestModal}
        onClose={onCloseChestModal}
      >
        <DialogTitle>
          You could get
        </DialogTitle>
        <DialogContent>
          <div className="chestLootList">
            {chestLoots.map((loot, index) => (
              <div key={index} className="chestLoot">
                <div className='loot'>
                  <div className='loot-desc'>
                    <span className={'loot-desc-name-' + loot.rarity}>{loot.name}</span>
                    {/* <br/>
                                    <span className='loot-desc-quantity'>MAX x{loot.maxQuantity}</span> */}
                  </div>
                  <img className='loot-image' src={loot.image} />
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </props.ConfirmContext.ConfirmationDialog>
      <props.ConfirmContext.ConfirmationDialog
        open={confirmModalOpen}
        onClose={onCloseConfirmModal}
      >
        <DialogTitle>
          {
            currentInventory.type == 'tool' ?
              `${currentInventory.name} + ${currentInventory.level}` + (confirmActionType == 'upgrade' ? ` -> + ${currentInventory.level + 1}` : '') :
              currentInventory.name
          }
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {
              confirmActionType == 'repair' ? <>Are you sure you want to repair?<br />Durability will be {currentInventory.durabilityTotal}.</> :
                confirmActionType == 'chest' ? <>Are you sure you want to open {openChestCount} chests?</> :
                  confirmActionType == 'upgrade' ? <>
                    Are you sure you want to upgrade?<br />
                    {upgradeConsumables[0].id == 1 || upgradeConsumables[1].id == 1 ? 'The upgrade can fail but the tool will never downgrade.' : 'The upgrade can fail and the tool could be downgraded.'}
                    <br />
                    Probability of Success: {Math.min((upgradeConsumables[0].id == 2 || upgradeConsumables[1].id == 2 ? 10 : 0) + (upgradeConsumables[0].id == 6 || upgradeConsumables[1].id == 6 ? 5 : 0) + (upgradeConsumables[0].id == 7 || upgradeConsumables[1].id == 7 ? 15 : 0) + currentInventory.upgrade?.probability, 100)}%
                  </> :

                    confirmActionType == 'craft' ? (slotNeed ? 'You should select the tools to be burnt' : <>
                      Do you want to craft {craftRecipeCount} recipes? Crafting recipe could fail.<br />
                      Probability of Success: {currentInventory.craft?.probability}%<br />
                      Multiple crafting could take some time, max a few minutes.
                      {/* {craftRecipeCount >= 20 ? `Crafting ${craftRecipeCount} recipes could take some time, max a few minutes.` : null} */}</>) :
                      confirmActionType == 'sell' ? <>Do you want to sell {sellQuantity} {currentInventory.name} for {toFixed(sellQuantity * sellUnitCost)} Ancien?</> :
                        confirmActionType == 'send' ? <>Do you want to send {sendQuantity} {currentInventory.name}  to {
                          isENS(sendAddress)
                            ? !isAddress(sendResolvedAddress) ? <CircularProgress size={20} sx={{ color: "white" }} /> : sendResolvedAddress
                            : sendAddress
                        }
                          ?</>
                          : ''
            }
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            disabled={confirmActionType == 'send' && isENS(sendAddress) && !isAddress(sendResolvedAddress)}
            onClick={() =>
              confirmActionType == 'craft' && slotNeed ? onCloseConfirmModal()
                : onDoAction()} autoFocus>
            Sure
          </Button>
        </DialogActions>
      </props.ConfirmContext.ConfirmationDialog>

      <props.ConfirmContext.ConfirmedDialog
        open={actionResModalOpen}
        onClose={onCloseActionResModal}
      >
        <DialogTitle>
          {actionRes?.data.success && actionRes?.data.data.done ? 'Success!' : 'Failed!'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {!actionRes?.data.success ? actionRes?.data.error.errorMessage : <>
              {resActionType == 'repair' &&
                <>
                  {actionRes?.data.data.message} <br /> {actionRes?.data.data.done ? `Now the durability is ${actionRes?.data.data.durability}.` : null}
                </>
              }
              {resActionType == 'upgrade' &&
                <>
                  {actionRes?.data.data.message} <br /> {actionRes?.data.data.done ? `Your tool has reached level ${actionRes?.data.data.level}.` : null}
                </>
              }
              {resActionType == 'craft' &&
                <>
                  {actionRes?.data.data.message}
                </>
              }
              {resActionType == 'chest' &&
                <>
                  {!(actionRes?.data.success && actionRes?.data.data.done) ? actionRes?.data.data.message : ''}
                </>
              }
              {resActionType == 'send' &&
                <>
                  {actionRes?.data.data.quantity} {currentInventory.name} has been sent to {sendAddress}.
                </>
              }
              {resActionType == 'sell' &&
                <>
                  Listed successfully.
                </>
              }
            </>}
          </DialogContentText>
          {resActionType == 'chest' &&
            <>
              {actionRes?.data.success && actionRes?.data.data.done && <>
                <div className="open-chest-desc">
                  {actionRes?.data.data.message}
                </div>
                <div id="chestDropView">
                  {actionRes?.data.data.drop.map((drop, index) => (
                    <div className='drop' key={index}>
                      <img className='drop-image' src={drop.image} />
                      <div className={'drop-name drop-rarity-' + drop.rarity}>{drop.name}</div>
                      <div className={'drop-desc drop-rarity-' + drop.rarity}>x {drop.quantity}</div>
                    </div>
                  ))}
                </div>
              </>
              }
            </>
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

export default GameCraftInventory