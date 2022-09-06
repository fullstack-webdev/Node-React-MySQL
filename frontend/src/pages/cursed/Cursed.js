import {useState, useEffect} from 'react'
import axios from 'axios'

import SocialIcon from '../../components/social-icon/SocialIcon';
import {
  Button, 
  Input,
  Select,
  MenuItem,
  InputLabel
} from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';

import LogoTransparent from '../../assets-game/LogoOnerow.png';

import './cursed.scss'

const linkDiscord = "https://discord.gg/ancientsociety";
const linkTwitter = "https://twitter.com/_ancientsociety";
const linkWhitepaper = "https://ancientsociety.gitbook.io/";

function Cursed() {

  const [buildingType, setBuildingType] = useState(1)
  const [buildingID, setBuildingID] = useState(null)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  const checkBuilding = () => {
      axios.post('/api/m1/buildings/isCursed', {
        type: buildingType,
        id: buildingID
      })
      .then(response => {
        if (!response.data.cursed){
          setError("")
          setMessage("Building is NOT Cursed! You CAN use it to Mint another Building")
        }
        else{
          setMessage("")
          setError("Building is Cursed! You CAN'T use it to Mint another Building")
        } 
      })
      .catch(error => {
        console.log(error)
        setMessage("")
        setError('Error! Try again.')
      })
  }

  // useEffect(() => {
  //   console.log(buildingID)
  // }, [buildingID])
  // useEffect(() => {
  //   console.log(buildingType)
  // }, [buildingType])

  return (
    <>
      <div className='cursed-overlay'/>

      <div className='cursed'>

        <div className='head'>
          <img src={LogoTransparent} />
        </div>

        <div className='body'>
          
          <h2>Check Building ID</h2>
     
              <Select
                sx = {{color:"white", width:"200px"}}
                value={buildingType}
                onChange={event => setBuildingType(event.target.value)}
              >
                <MenuItem value={1}>Town Hall</MenuItem >
                <MenuItem value={2}>Lumberjack</MenuItem >
                <MenuItem value={3}>Stone Mine</MenuItem >
              </Select>

              <Input 
                className='buildingID'
                placeholder='213'
                type='number'
                sx = {{color:"white", width:"200px", marginTop:"15px"}}
                autoFocus
                onChange={event => setBuildingID(event.target.value)}
              >
              </Input>

              <Button 
                color='success'
                variant='contained'
                sx={{marginTop:"15px"}}
                onClick={()=>checkBuilding()}
              >
                Check
              </Button>
            
          
          {message 
          ? <p className='message'>{message}</p>
          : null
          }
          {error 
          ? <p className='messageError'>{error}</p>
          : null
          }

          <div className='socialIcons'>
                <SocialIcon 
                    type="gameInfo" 
                    onIconClick={()=>{window.open(linkWhitepaper)}}
                />
                <SocialIcon 
                    type="gameDiscord" 
                    onIconClick={()=>{window.open(linkDiscord)}}
                />
                <SocialIcon 
                    type="twitter" 
                    onIconClick={()=>{window.open(linkTwitter)}}
                />
            </div>
        </div>

      </div>
    </>
  )
}

export default Cursed