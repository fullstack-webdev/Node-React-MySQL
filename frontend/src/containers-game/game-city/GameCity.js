import React, { Component } from 'react'

import { NFT } from '../../components-game/';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import './game-city.scss'

class GameCity extends Component {

  constructor(props) {
    super(props);

    this.state = {
      stakingChecked: false,

      townhallIsStakable: true,  
      lumberjackIsStakable: true,  
      stonemineIsStakable: true,  

      onPopup: false
    };

    //Staking Contract & ABIs
    this.ERCStaking = props.ERCStaking,

    //721 Contract & ABIs
    this.ERC721 = props.ERC721,

    this.onPopup = this.onPopup.bind(this);
  }

  componentDidUpdate() {
    // console.log('GameCity Update... NFTs: ', this.props.nfts);

    (this.props.nfts.length && !this.state.stakingChecked)
    && this.checkStaking()
  }

  onPopup(popupStatus){
    this.setState({onPopup: popupStatus})
  }

  checkStaking = () => {
    let townhallIsStakable = true;
    let lumberjackIsStakable = true;
    let stonemineIsStakable = true;

      this.props.nfts.map((item, i) => (
        
        item.stake ? 

          item.type == 1 ? 
            townhallIsStakable = false
          : item.type == 2 ? 
            lumberjackIsStakable = false
          : item.type == 3 ? 
            stonemineIsStakable = false
          : null //console.log('Type error')

          : null //console.log('No staking for: ', item.id)

      ))

      this.setState({
        stakingChecked: true,
        townhallIsStakable: townhallIsStakable,
        lumberjackIsStakable: lumberjackIsStakable,
        stonemineIsStakable: stonemineIsStakable
      })

  }

  isStakable = (type) => {
    // console.log('isStakable: type ', type)
    // console.log('thIsStakable ', this.state.townhallIsStakable)

    let isStakableReturn = null;

    type == 1 
      ? this.state.townhallIsStakable 
        ? isStakableReturn = 1
        : isStakableReturn = 0
    : type == 2 
      ? this.state.lumberjackIsStakable 
        ? isStakableReturn = 1
        : isStakableReturn = 0
    : type == 3
      ? this.state.stonemineIsStakable 
        ? isStakableReturn = 1
        : isStakableReturn = 0
    : null //console.log('isStakable: Unknown type')

    return isStakableReturn
  }

  newStaking = (type, builders) => {
    // console.log('newStaking: type ', type)

    this.props.gameCallback_newBuilders(builders);

    type == 1 
      ? this.setState({townhallIsStakable: !this.state.townhallIsStakable})
      : type == 2
        ? this.setState({lumberjackIsStakable: !this.state.lumberjackIsStakable})
        : type == 3
          ? this.setState({stonemineIsStakable: !this.state.stonemineIsStakable})
          : null //console.log('newStaking: Unknown type')
   }

  render(){
    return (

        <div className={this.props.isVisible ? 'game-city' : 'game-city notVisible'}>
          
          {
            this.props.nfts.length > 0 
            
            ? this.props.nfts.map((item, i) => (
                    <NFT 
                      key={i}

                      metamask={this.props.metamask}
                      ERCStaking={this.ERCStaking}
                      ERC721={this.ERC721}

                      nft = {item}

                      builders = {this.props.builders}

                      onPopup = {this.state.onPopup}
                      gameCallback_onPopup = {this.onPopup}

                      inventory = {this.props.inventory}
                      parentCallback_newInventory = {this.props.gameCallback_newInventory}
                      
                      isStakable = {this.isStakable(item.type)}
                      parentCallback_newStaking = {this.newStaking}

                      parentCallback_newBuilders = {this.props.gameCallback_newBuilders}

                      callback_Logout = {() => this.props.callback_Logout()}

                      callback_ToastLoading = {(message) => toast.loading(message)}
                      callback_ToastError= {(error) => toast.error(error)}
                    />
              ))

            : <div className='game-nft'>
                <div className='error'>
                  <p>You don't have any Building in your wallet!</p>
                  <p>Learn how to get one: <a href="https://ancientsociety.gitbook.io/" target="_blank">Whitepaper</a></p>
                  <p>If you need assistance, you can open a ticket or DM a Moderator in <a href="https://discord.gg/ancientsociety" target="_blank">Discord</a></p>
                </div>
              </div>

          }

        <ToastContainer 
          position="top-right"
          autoClose={1500}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
        />

        </div> 

    )
  }
}

export default GameCity