import 'react-toastify/dist/ReactToastify.css';
import './voucher.scss';

import React, { Component } from 'react';

import { ethers } from 'ethers';
import { toast } from 'react-toastify';

import { Button } from '../../components';
import { playSound } from '../../utils/sounds';

class Voucher extends Component {

    constructor(props) {
        super(props);

        //Contracts & ABI
        this.ERC20 = props.ERC20,

        //Metamask
        this.metamask = props.metamask
    }

    async voucherMint(){

      //Inside Vars
      let arrayIndex = this.props.arrayIndex;
      let type = this.props.type;
      let id = this.props.id;
      let quantity = this.props.quantity;
      let blockNumber = this.props.blockNumber;
      let signature = this.props.signature;

      //Ether Vars
      let contractAddress = null;
      let contract = null;
      let mint = null;
      let receipt = null;
      let toastLoading = null;

      //Get the Contract Address
      if (type == 1) {contractAddress =  this.ERC20.contractAncien}
      else if (type == 2) {contractAddress =  this.ERC20.contractWood}
      else if (type == 3) {contractAddress =  this.ERC20.contractStone}
      else return false

      // console.log('Voucher Type: ', this.props.type)

      //Initialize the Contract Object
      contract = new ethers.Contract(contractAddress, this.ERC20.ABI, this.metamask.walletSigner);

      try{

        mint = await contract.mint( 
          id, 
          this.metamask.walletAccount,
          quantity,
          blockNumber,
          signature
        )
        // console.log('Mint Result... ', mint)
          
        if(mint){
          toastLoading = this.loading('Minting... Almost done!')
  
          receipt = await mint.wait();
          // console.log('Receipt ', receipt)

          if(receipt){
            
            toast.update(toastLoading, { 
              render: "Done!", 
              type: "success", 
              isLoading: false,
              autoClose: 2000  
            });

            // let wait = 1;
            // await new Promise(wait => setTimeout(wait, 2000));

            playSound('shop');
            this.props.callback_getBalance()
            this.props.callback_removeVoucher(this.props.arrayIndex);
          }
        }

      }catch(err){

        if(toastLoading){
          toast.update(toastLoading, { 
            render: err.message, 
            type: "error", 
            isLoading: false,
            autoClose: 2000  
          });
        }else{
          this.notify(err.message)
        }
      }

    }

    // async addTokenInMetamask(tokenAddress, type, tokenDecimals = 18, tokenImage = null){

    //   let tokenSymbol = null;

    //   type == 1 
    //     ? tokenSymbol = 'ANCIEN'
    //     : type == 2 
    //       ? tokenSymbol ='ANCIENWOOD'
    //       : type == 3
    //       ? tokenSymbol = 'ANCIENSTONE'
    //         : false

    //   let tokenAdd = await ethereum.request({
    //     method: 'wallet_watchAsset',
    //     params: {
    //       type: 'ERC20', 
    //       options: {
    //         address: tokenAddress, 
    //         symbol: tokenSymbol, 
    //         decimals: tokenDecimals, 
    //         image: tokenImage, 
    //       },
    //     },
    //   });
    // }

    async voucherDestroy(){ //Change Toast to Callback

      // let contractAddress = null;
      // let contract = null;
      // let destroy = null;
      // let receipt = null;

      // //Get the Contract Address
      // if (this.props.type == 1) {contractAddress =  this.ERC20.contractAncien}
      // else if (this.props.type == 2) {contractAddress =  this.ERC20.contractWood}
      // else if (this.props.type == 3) {contractAddress =  this.ERC20.contractStone}
      // else return false

      // //Initialize the Contract Object
      // contract = new ethers.Contract(contractAddress, this.ERC20.ABI, this.metamask.walletSigner);

      // try{
      //   destroy = await contract.destroyVoucher( //??? ethers.utils.parseEther(this.state.mintPrice.toString()
      //     this.props.id, 
      //     this.metamask.walletAccount,
      //     this.props.quantity,
      //     this.props.blockNumber,
      //     this.props.signature
      //   )
      //   console.log('Destroy Result... ', destroy)
          
      //   if(destroy){
      //     let toastLoading = this.loading('Adding... Almost done!')
  
      //     receipt = await destroy.wait();
      //     console.log('Receipt ', receipt)
  
      //     if(receipt){
      //       setTimeout(() => {
      //         toast.update(toastLoading, { 
      //           render: "Done, it will soon be available in your In-game wallet!", 
      //           type: "success", 
      //           isLoading: false,
      //           autoClose: 3000  });
      //       }, 0);

      //       let wait = 1;
      //       await new Promise(wait => setTimeout(wait, 3000));

      //       this.props.callback_removeVoucher(
      //         this.props.arrayIndex, 
      //         this.props.type,
      //         this.props.quantity
      //       );
      //     }
      //   }

      // }catch(err){
      //   this.notify(err.message)
      // }

    }

    
    loading = (message) => this.props.callback_ToastLoading(message)

    notify = (error) => this.props.callback_ToastError(error)
    
    render(){

      return (
        <div className='voucher'>

          <img src={this.props.resourceImage}/>
          <p>{format(this.props.quantity)}</p>

          <Button
            text='Claim'
            style='voucher-claim'
            onButtonClick = {() => this.voucherMint()}
          />
          {/* <Button
            text='X'
            style='voucher-delete'
            onButtonClick = {() => this.voucherDestroy()}
          /> */}
        </div>
      )
      
    }
}

function format(x) {
  let newValue = x;
  
  newValue 
  && (newValue =  x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","))

  return newValue
}

export default Voucher