import './game-setting.scss';

import {
  useEffect,
  useRef,
  useState,
} from 'react';

import axios from 'axios';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import VolumeDown from '@mui/icons-material/VolumeDown';
import VolumeUp from '@mui/icons-material/VolumeUp';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  CircularProgress,
  FormControlLabel,
  FormHelperText,
  IconButton,
  Slider,
  Switch,
  TextField,
  Tooltip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { tooltipClasses } from '@mui/material/Tooltip';

import iconBack from '../../assets-game/arrow_back.svg';
import iconForward from '../../assets-game/arrow_forward.svg';
import {
  addAncienToMetamask,
  addStoneToMetamask,
  addWoodToMetamask,
} from '../../utils/addTokensToMetamask';
import {
  getVolumeSounds,
  playSound,
} from '../../utils/sounds';
import availableImg from './assets/available.svg';
import equippedImg from './assets/equipped.svg';
import lockedImg from './assets/locked.svg';

const Input = styled('input')({
    display: 'none',
})
const musicList = [
  'Music 1', 'Music 2', 'Music 3'
]
const marks = {
  equipped: equippedImg,
  available: availableImg,
  locked: lockedImg
}

const HtmlTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} placement='top' classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: 'transparent',
    width: '100%',
    margin: '0rem 0rem -3rem 0rem',
    padding: '0.5rem 0rem 0rem 0rem'
  },
}));

function GameSetting ( props ) {
    const [idDelegate, setIdDelegate] = useState(props.idDelegate)
    useEffect(() => { setIdDelegate(props.idDelegate)}, [props.idDelegate])

    const [ onLoading, setOnLoading ] = useState(false)
    const [ avatarFile, setAvatarFile ] = useState(null)
    const [ avatarImage, setAvatarImage ] = useState(props.settingData.profileImage)
    const [ cityName, setCityName ] = useState(props.settingData.cityName)
    const [errorName, setErrorName] = useState("");
    const [errorImage, setErrorImage] = useState("");
    const [errorAPI, setErrorAPI] = useState("");
    const avatarFileInput = useRef()

    const onAvatarChange = (e) => { 
      var file = e.target.files[0]

      if (file.size > 2000000){
        setErrorImage('Max size 2 MB')
        return false
      }else{setErrorImage('')}

      setAvatarFile(file)
      var reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onloadend = function (e) {
        setAvatarImage(reader.result)
      }.bind(this)
    }
    const resetHandler = () => {
      playSound('button')
      avatarFileInput.current.value = ''
      setAvatarFile(null)
      setErrorImage('')
      setErrorAPI('')
      setAvatarImage(props.settingData.profileImage)
    }

    const [ mute, setMute ] = useState( JSON.parse(localStorage.getItem('isMute')) )
    // const [ musicVolume, setMusicVolume ] = useState( getVolumeMusic() )
    const [ effectVolume, setEffectVolume ] = useState( getVolumeSounds() )
    const [ currentMusic, setCurrentMusic ] = useState(null)
    const [ musicSelect, setMusicSelect ] = useState(false)
    const [ musicSelectAnchorEl, setMusicSelectAnchorEl ] = useState(null)
    
    
    const muteSetting = () => {
      localStorage.setItem('isMute', !mute)
      playSound(mute ? 'button' : '')
      setMute(!mute)
    }
    const musicVolumeSetting = (volume) => {
      localStorage.setItem('volumeMusic', volume)
      setMusicVolume(volume)
      setVolumeMusic(volume) //utils/sounds.js
    }
    const effectVolumeSetting = (volume) => {
      playSound('sound')
      localStorage.setItem('volumeSounds', volume)
      setEffectVolume(volume)
    }
    const onMusicSelect = (e) => {
      setMusicSelectAnchorEl(e.target)
      setMusicSelect(true)
    }
    const onCloseMusicSelect = () => {
      setMusicSelect(false)
    }
    const onMusicListClick = (music) => {
      setCurrentMusic(music)
      onCloseMusicSelect()
    }
    
    const onSave = () => {
      playSound('button')
      setOnLoading(true)
      const formData = new FormData();
      formData.append('avatarFile', avatarFile)
      formData.append('cityName', cityName)
      formData.append('idDelegate', idDelegate)
      formData.append('idEmblem', currentEmblem ? currentEmblem.idEmblem : -1)

      axios.post(`/api/m1/profile/setProfile?address=${props.metamask.walletAccount}&idDelegate=${idDelegate}`, formData)
      .then(response => { 
        console.warn('response: ', response)
        if(response.data.success){
          setOnLoading(false)
          // console.log(response.data.data)

          let callbackImage = false;
          avatarFile 
          ? callbackImage = response.data.data.imageProfile
          : callbackImage = false
          setAvatarFile(null)

          setDefaultEmblemId(response.data.data.idEmblem)
          
          props.callback_newProfile(callbackImage, cityName, response.data.data.idEmblem)
        }else{
          setErrorName(response.data.error.errorMessage);
          setOnLoading(false)
        }
      })
      .catch(error => {
        console.error('error: ', error)

        error.response.status == 500
        && props.callback_Logout()
  
        error.response.status == 401
        && props.callback_Logout()
      })
    }
    const addTokensToMetamask = () => {
      playSound('button')
      addAncienToMetamask()
      addWoodToMetamask()
      addStoneToMetamask()
    }
    const [defaultEmblemId, setDefaultEmblemId] = useState(-1)
    const [currentEmblem, setCurrentEmblem] = useState(null)
    const [emblems, setEmblems] = useState(null)
    const [emblemIndex, setEmblemIndex] = useState(0)
    useEffect(() => {
      if ( emblems == null ) {
        return
      }
      for ( var i = 0 ; i < emblems.length ; ++ i ) {
        if ( emblems[i].status == 'equipped' ) {
          setCurrentEmblem(emblems[i])
          break
        }
      }
    }, [emblems])
    useEffect(() => {
      axios.post('/api/m1/profile/getEmblems', {
        address: props.metamask.walletAccount,
        idDelegate: idDelegate
      })
      .then(response => {
        // console.log('/api/m1/profile/getEmblems: ', response)
        const emblems = response.data.data.emblems
        if ( emblems != null ) {
          for ( var i = 0 ; i < emblems.length ; ++ i ) {
            if ( emblems[i].status == 'equipped' ) {
              setDefaultEmblemId(emblems[i].idEmblem)
              break
            }
          }
        }
        setEmblems(emblems)
      })
      .catch(error => {
        error.response.status == 500
        && props.callback_Logout()
  
        error.response.status == 401
        && props.callback_Logout()
      })
    }, [])
    
    const onEmblemClick = (index) => {
      playSound('button')
      const emblem = emblems[index]
      if ( emblem.status == 'locked' || emblem.status == 'equipped' ) {
        return
      }
      var newEmblems = JSON.parse(JSON.stringify(emblems))
      for ( var i = 0 ; i < newEmblems?.length ; ++ i ) {
        if ( newEmblems[i].status == 'equipped' ) {
          newEmblems[i].status = 'available'
        }
        if ( newEmblems[i].idEmblem == emblem.idEmblem ) {
          newEmblems[i].status = 'equipped'
        }
      }
      setEmblems(newEmblems)
    }
    
    const [openedSettingPanel, setOpenedSettingPanel] = useState({emblem: false, music: false})
    const onSettingPanelChange = (panelName) => {
      playSound('touch')
      var newPanelSetting = JSON.parse(JSON.stringify(openedSettingPanel))
      newPanelSetting[panelName] = !newPanelSetting[panelName]
      setOpenedSettingPanel(newPanelSetting)
    }


    //AIRDROPS
    const [airdropStatus, setAirdropStatus] = useState('Check for Airdrops')
    const checkForAirdrop = () => {
      setOnLoading(true)
      setAirdropStatus(<CircularProgress size={20} sx={{color:"white"}}/>)
      axios.post('/api/m1/profile/checkForAirdrop', {
        address: props.metamask.walletAccount,
        idDelegate: idDelegate
      })
      .then(response => {
        if(response.data.success) setAirdropStatus('Success!')
        else setAirdropStatus('Nothing to Airdrop')
        setOnLoading(false)
      })
      .catch(error => {
        error.response.status == 500
        && props.callback_Logout()
  
        error.response.status == 401
        && props.callback_Logout()
      })
    }



    return ( <>
        <div className='game-component game-setting'>
            <div className='game-container'>
                <div className='header'>
                    <span className='title'>Settings</span>
                </div>
                <div className='content'>
                    <div className='scroll-content'>
                      <div className='avatarPanel'>
                        <div className='avatar'>
                          {(avatarImage && avatarImage !== '') ?
                            <img className='avatarImg' src={avatarImage} /> :
                            <div className='description'>
                              <span> Set your profile image.</span>
                            </div>
                          }
                          <label htmlFor="avatar-file-input" className='uploadBtn' onClick={(e) => { e.stopPropagation() }}>
                            <Input accept=".png,.jpg" id='avatar-file-input' ref={avatarFileInput} type="file" onChange={onAvatarChange} />
                            <IconButton color="primary" aria-label="upload picture" component="span">
                              <PhotoCamera />
                            </IconButton>
                          </label>
                        </div>
                        <div className='action'>
                          <Button 
                            variant="contained" 
                            color="secondary" 
                            onClick={resetHandler}
                          > 
                          Reset 
                          </Button>
                          <FormHelperText style={{color:'#d32f2f'}}>{errorImage}</FormHelperText>
                        </div>
                      </div>
                      <div className='cityName'>
                        <Input placeholder="username" />
                        <TextField 
                          onChange={(e) => {
                            const newValue = e.target.value;

                            if (newValue.match(/[A-Za-z0-9\-_\.]+$/) || newValue == '') {
                              setErrorName('');
                              setErrorAPI('');
                              setCityName(newValue)
                            } else {
                              setErrorName("Only characters and numbers");
                            }
                          }} 
                          inputProps={{ maxLength: 16 }}
                          helperText={errorName}
                          error={!!errorName}
                          value={cityName && cityName !== 'null' ? cityName : ''}
                          label="City Name" 
                          variant="filled" 
                          required
                        />
                      </div>
                      <div className='emblemPanel setting-panel'>
                        <Accordion
                          expanded={openedSettingPanel['emblem']}
                          onChange={() => onSettingPanelChange('emblem')}
                          >
                          <AccordionSummary className='summary' expandIcon={<ExpandMoreIcon />}>
                            <div className='setting-accordion-summary'>
                              <span>Choose your emblem here.</span>
                              <span>Emblems</span>
                            </div>
                          </AccordionSummary>
                          <AccordionDetails className='details'>
                            {(emblems == null || onLoading) ?
                            <CircularProgress size={50} sx={{color:"gold"}}/> :
                            <>
                            <img className={'moveBtn' + (emblemIndex == 0 ? ' disabled' : '')} src={iconBack}
                              onClick={() => {
                                playSound('tab')
                                setEmblemIndex(emblemIndex - 3)
                              }}
                              />
                            { emblemIndex < emblems?.length &&
                              <HtmlTooltip id='emblem-popup'
                                title={
                                  <>
                                    <div className='emblem-info'>
                                      <div className='emblem-title'>{emblems[emblemIndex].name}</div>
                                      <div className='emblem-desc'>{emblems[emblemIndex].desc}</div>
                                      <div className={'emblem-status ' + emblems[emblemIndex].status}>{emblems[emblemIndex].status}</div>
                                    </div>
                                  </>
                                }
                              >
                                <div className={'emblem ' + emblems[emblemIndex].status} onClick={() => {onEmblemClick(emblemIndex)}}>
                                  <img className='emblem-img' src={emblems[emblemIndex].imageEmblem} />
                                  <div className='emblem-status'>
                                    <img className='emblem-status-mark' src={marks[emblems[emblemIndex].status]} ></img>
                                  </div>
                                </div>
                              </HtmlTooltip>
                            }
                            { emblemIndex + 1 < emblems?.length &&
                              <HtmlTooltip id='emblem-popup'
                                title={
                                  <>
                                    <div className='emblem-info'>
                                      <div className='emblem-title'>{emblems[emblemIndex + 1].name}</div>
                                      <div className='emblem-desc'>{emblems[emblemIndex + 1].desc}</div>
                                      <div className={'emblem-status ' + emblems[emblemIndex + 1].status}>{emblems[emblemIndex + 1].status}</div>
                                    </div>
                                  </>
                                  }
                                >
                                <div className={'emblem ' + emblems[emblemIndex + 1].status} onClick={() => {onEmblemClick(emblemIndex + 1)}}>
                                  <img className='emblem-img' src={emblems[emblemIndex + 1].imageEmblem} />
                                  <div className='emblem-status'>
                                    <img className='emblem-status-mark' src={marks[emblems[emblemIndex + 1].status]} ></img>
                                  </div>
                                </div>
                              </HtmlTooltip>
                            }
                            { emblemIndex + 2 < emblems?.length &&
                              <HtmlTooltip id='emblem-popup'
                                title={
                                  <>
                                    <div className='emblem-info'>
                                      <div className='emblem-title'>{emblems[emblemIndex + 2].name}</div>
                                      <div className='emblem-desc'>{emblems[emblemIndex + 2].desc}</div>
                                      <div className={'emblem-status ' + emblems[emblemIndex + 2].status}>{emblems[emblemIndex + 2].status}</div>
                                    </div>
                                  </>
                                }
                                >
                                <div className={'emblem ' + emblems[emblemIndex + 2].status} onClick={() => {onEmblemClick(emblemIndex + 2)}}>
                                  <img className='emblem-img' src={emblems[emblemIndex + 2].imageEmblem} />
                                  <div className='emblem-status'>
                                    <img className='emblem-status-mark' src={marks[emblems[emblemIndex + 2].status]} ></img>
                                  </div>
                                </div>
                              </HtmlTooltip>
                            }
                            <img className={'moveBtn' + (emblemIndex >= emblems?.length - 3 ? ' disabled' : '')} src={iconForward}
                              onClick={() => {
                                playSound('tab')
                                setEmblemIndex(emblemIndex + 3)
                              }}
                              /></>}
                          </AccordionDetails>
                        </Accordion>
                      </div>
                      <div className='musicPanel setting-panel'>
                        <Accordion
                          expanded={openedSettingPanel['music']}
                          onChange={() => onSettingPanelChange('music')}
                          >
                          <AccordionSummary className='summary' expandIcon={<ExpandMoreIcon />}>
                            <div className='setting-accordion-summary'>
                              <span>Settings for mute on/off, sound volume.</span>
                              <span>Music</span>
                            </div>
                          </AccordionSummary>
                          <AccordionDetails className='details'>
                            {/* <div className='musicList'>
                              <div
                                  className='musicSelectBtn'
                                  onClick={(e) => {onMusicSelect(e)}}
                                  id='musicSelectBtn'
                                  aria-controls={musicSelect ? 'musicSelectList' : undefined}
                                  aria-haspopup="true"
                                  aria-expanded={musicSelect ? 'true' : undefined}
                              >
                                  <span>Select music you want</span>
                              </div>
                              <Menu
                                  id='musicSelectList'
                                  anchorEl={musicSelectAnchorEl}
                                  open={musicSelect}
                                  onClose={onCloseMusicSelect}
                                  MenuListProps={{
                                      'aria-labelledby': 'musicSelectBtn'
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
                                {musicList.map((music, index) => (
                                  <MenuItem key={index} onClick={() => onMusicListClick(music)}>
                                    <div className={music === currentMusic ? 'selected' : ''}>
                                      {music}
                                      {music === currentMusic && <sub style={{marginLeft: '1rem'}}>selected</sub>}
                                    </div>
                                  </MenuItem>
                                ))}
                              </Menu>
                            </div> */}
                            <div className='musicSetting'>
                              <div className='muteBtn'>
                                <FormControlLabel control={<Switch checked={!mute} onChange={muteSetting} />} label={!mute  ? "Sounds On" : "Mute On"} />
                              </div>
                              {/* <div className='musicVolume'>
                                <span className='desc'> Music</span>
                                <div className='inputs'>
                                  <VolumeDown />
                                  <Slider aria-label="Volume" value={musicVolume} disabled={!mute} onChange={(e) => musicVolumeSetting(e.target.value)} />
                                  <VolumeUp />
                                </div>
                              </div> */}
                              <div className='effectVolume'>
                                <span className='desc'> Effect</span>
                                <div className='inputs'>
                                  <VolumeDown />
                                  <Slider aria-label="Volume" value={effectVolume} disabled={mute} onChange={(e) => effectVolumeSetting(e.target.value)} />
                                  <VolumeUp />
                                </div>
                              </div>
                            </div>
                          </AccordionDetails>
                        </Accordion>
                        
                      </div>
                      
                      <div className='utilsPanel'>
                        {(cityName == props.settingData.cityName && avatarFile == null && (currentEmblem == null || currentEmblem.idEmblem == defaultEmblemId)) || cityName == ''
                          ? null
                          : <div className='actionPanel'>
                              <Button className='saveBtn'
                                variant='contained' 
                                color='success' 
                                onClick={onSave}
                              > 
                                {onLoading 
                                  ? <CircularProgress size={20} sx={{color:"white"}}/>
                                  : 'Save'
                                } 
                                
                              </Button>
                              <FormHelperText style={{color:'#d32f2f'}}>{errorAPI}</FormHelperText>
                          </div>
                        }
                        <Button className='airdropBtn'
                          variant='contained' 
                          onClick={() => !onLoading && checkForAirdrop()}
                        > 
                            {airdropStatus}
                        </Button>
                        <Button className='importBtn'
                          variant='contained' 
                          onClick={() => addTokensToMetamask()}
                        > 
                            Import Tokens
                        </Button>
                      </div>
                    </div>
                      
                </div>
            </div>
        </div>
    </>)
}

export default GameSetting