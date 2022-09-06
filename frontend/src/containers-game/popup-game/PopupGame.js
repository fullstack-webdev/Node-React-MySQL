import './popupgame.scss';

import React, { Component } from 'react';

import axios from 'axios';

import iconClose from '../../assets/close_white_24dp.svg';
import {
  PopupGameClaim,
  PopupGameInfo,
  PopupGameNotification,
  PopupGameStaking,
  PopupGameUpgrade,
} from '../../components-game';

class PopupGame extends Component {

    constructor(props) {
        super(props);

        this.state = {    
            metamask: props.metamask,

            //Loader
            onLoading: props.onLoading,

            //Type
            type: props.type,

            idDelegate: null,

            upgradeResources: {}
        };
    }
    componentDidUpdate(){ 
        if ( this.state.idDelegate != this.props.idDelegate ) {
          this.setState({idDelegate: this.props.idDelegate})
        }
        if ( JSON.stringify(this.state.upgradeResources) != JSON.stringify(this.props.upgradeResources) ) {
            this.setState({upgradeResources: this.props.upgradeResources})
        }
    }
    setShowMenu_Close = () => {
        {this.state.type == 'notification' && this.viewed()} 
 
        this.props.parentCallback_Close ( false );
    }

    staking = (newStatus = !this.props.data.stake) => {
        this.props.parentCallback_StakingApproved(
            this.props.data.id, 
            this.props.data.type,
            newStatus
        )
        
        // const builders = {buildersAvailable:5 , buildersTotal:5}

        // console.log('PopupGame - stake: ', newStatus)

        // this.setState({onLoading: true})

        // this.props.parentCallback_StakingApproved(response.data.data.builders),
        // this.setShowMenu_Close()

        // axios({
        //     method: 'post',
        //     url: '/api/m1/buildings/setStake',
        //     data: {
        //         address: this.state.metamask.walletAccount,
        //         nftId: this.props.data.id,
        //         type: this.props.data.type,
        //         stake: newStatus
        //         }
        //     })
        // .then(response => {
        //     response.data.success 
        //     ? [this.props.parentCallback_StakingApproved(response.data.data.builders), //response.data.data.builders
        //         this.setShowMenu_Close()]
        //         : null //console.log('staking not success...')
        // })
        // .catch(error => {
        //     // console.error('Error axios.staking: ', error);
        
        //     error.response.status == 401
        //     && this.props.callback_Logout()
        // })
    }

    claim = () => { 
        this.setState({onLoading: true})
        //check it's not zero (in child)

        axios({
            method: 'post',
            url: '/api/m1/buildings/claim',
            data: {
                address: this.state.metamask.walletAccount,
                idDelegate: this.state.idDelegate,
                nftId: this.props.data.id,
                type: this.props.data.type
                }
            })
        .then(response => {
            response.data.success 
            ? [this.props.parentCallback_ClaimApproved( response.data.data, this.props.data.type ),
                this.setShowMenu_Close()]
                : null //console.log('claim not success...')
        })
        .catch(error => {
            // console.error('Error axios.claim: ', error);
        
            error.response.status == 401
            && this.props.callback_Logout()
        })
    }

    upgrade = () => {
        this.setState({onLoading: true})
        //check res. availability (in child)
        // console.log('BE Interaction: upgrade (', this.props.data.id, this.props.data.type, ', address)')
        
        axios({
            method: 'post',
            url: '/api/m1/buildings/upgradeNFT',
            data: {
                address: this.state.metamask.walletAccount,
                idDelegate: this.state.idDelegate,
                nftId: this.props.data.id,
                type: this.props.data.type,
                consumableIds: []
                }
            })
        .then(response => {
            // console.log("response builders: ", response);
            response.data.success 
            ? [this.props.parentCallback_UpgradeApproved( response.data.data ),
                this.setShowMenu_Close()]
                : null //console.log('Not enough resources or builders...')
        })
        .catch(error => {
            // console.error('Error axios.upgrade: ', error);
        
            error.response.status == 401
            && this.props.callback_Logout()
        })
    }

    viewed = () => { //Notification is viewed
        this.props.parentCallback_Notified ( true );
        // console.log('(Client is online) BE Interaction: viewed (', this.props.data.id, this.props.data.type, ', address)')

        axios({
            method: 'post',
            url: '/api/m1/buildings/upgradeDone',
            data: {
                address: this.state.metamask.walletAccount,
                idDelegate: this.state.idDelegate,
                nftId: this.props.data.id,
                type: this.props.data.type
            }
            })
        // .then(response => {
        //     response.data.success 
        //     ? console.log('Yes: ', response)
        //     : console.log('No: ', response)
        // })
        .catch(error => {
            // console.error('Error axios.viewed: ', error);
        
            error.response.status == 401
            && this.props.callback_Logout()
        })
    }
    
    render(){

      return (
        <>
        <div className='overlay' onClick={() => this.setShowMenu_Close()}/>

        <div className='popup-game'>
            <div className='head'>
                <h2>
                    {
                        this.props.type == 'upgrade' ?
                            'Upgrade ' + this.props.data.name
                        : this.props.type == 'claim' ?
                            'Claim ' + this.props.data.name
                        : this.props.type == 'info'?
                            this.props.data.name + ' Level ' + this.props.data.level
                        : this.props.type == 'notification'?
                            this.props.data.name + ' Upgraded'
                        : this.props.type == 'stake' || 'unstake' ?
                            'Staking ' + this.props.data.name
                        :
                            'unknown type'
                    }
                </h2>
                <img src={iconClose} onClick={() => this.setShowMenu_Close()} className="menu-icon-close" />
            </div>
            <div className='body'>
                {
                this.props.type == 'upgrade' ?
                    < PopupGameUpgrade 

                        image={this.props.data.image}
                        upgradeImage={this.props.data.upgradeImage}

                        type={this.props.data.type}

                        ancien={this.props.inventory.ancien}
                        wood={this.props.inventory.wood}
                        stone={this.props.inventory.stone}

                        level={this.props.data.level}

                        dropQuantity={this.props.data.dropQuantity}
                        upgradeDropQuantity={this.props.data.upgradeDropQuantity}

                        dropInterval={this.props.data.dropInterval}

                        capacity={this.props.data.capacity}
                        upgradeCapacity={this.props.data.upgradeCapacity}

                        upgradeResources={this.state.upgradeResources}

                        upgradeTime={this.props.data.upgradeTime}

                        droppedTotal={this.props.droppedTotal}

                        onActionClick={this.upgrade}
                    />
                : this.props.type == 'info' ?
                    < PopupGameInfo 

                        image={this.props.data.image} //building

                        images={this.props.images} //icons

                        type={this.props.data.type}

                        builders={this.props.builders}

                        level={this.props.data.level}

                        dropQuantity={this.props.data.dropQuantity}
  
                        dropInterval={this.props.data.dropInterval}
                        
                        stored={this.props.data.stored}
                        capacity={this.props.data.capacity}

                        stake={this.props.data.stake}
                        upgradeStatus={this.props.data.upgradeStatus}

                        upgradeEndingTime={this.props.data.upgradeEndingTime}

                        upgradeTime={this.props.data.upgradeTime}
                        upgradeResources={this.state.upgradeResources}

                        droppedTotal={this.props.droppedTotal}
                    />
                : this.props.type == 'claim' ?
                    < PopupGameClaim 
                        image={this.props.data.image}
                        
                        ancien={this.props.inventory.ancien}
                        wood={this.props.inventory.wood}
                        stone={this.props.inventory.stone}

                        type={this.props.data.type}

                        stored={this.props.data.stored + this.props.droppedTotal}
                        capacity={this.props.data.capacity}
                        onActionClick={this.claim}
                    />
                : this.props.type == 'notification' ?
                    < PopupGameNotification 
                        image={this.props.data.image}
                    
                        type={this.props.data.type}

                        level={this.props.data.level}

                        dropQuantity={this.props.data.dropQuantity}
                        dropInterval={this.props.data.dropInterval}
                        capacity={this.props.data.capacity}

                        onActionClick={this.setShowMenu_Close}
                    />
                : this.props.type == 'stake' || 'unstake' ?
                    < PopupGameStaking 
                        
                        image={this.props.data.image}

                        ancien={this.props.inventory.ancien}
                        wood={this.props.inventory.wood}
                        stone={this.props.inventory.stone}

                        type={this.props.data.type}

                        dropQuantity={this.props.data.dropQuantity}
                        dropInterval={this.props.data.dropInterval}

                        stored={this.props.data.stored}

                        stake={this.props.data.stake}
                        upgradeStatus={this.props.data.upgradeStatus}

                        onActionClick={this.staking}
                    />    
                :
                    null //console.log('error')
                }


            </div> 
            <div className='footer'/>
        </div> 

        {this.state.onLoading ? 
            <div className='on-loading'>
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
        : null}
     </>
      )
      
    }
}

export default PopupGame