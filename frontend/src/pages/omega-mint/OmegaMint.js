import './omegamint.scss';
import 'react-toastify/dist/ReactToastify.css';

import React, { Component } from 'react';

import { serverConfig } from '../../config/serverConfig';

import axios from 'axios';
import { ethers } from 'ethers';
import {
  toast,
  ToastContainer,
} from 'react-toastify';

import { toFixed } from '../../utils/utils';
import WalletHandler from './WalletHandler';

import {
  Button,
  CircularProgress,
} from '@mui/material';

//ABIs
import ERC20ABI from '../../ABIs/ERC20ABI.json';
import OracleABI from '../../ABIs/OmegaMint.json';

//IMAGEs
import imgLogo from '../../assets-omega/mintOmega.webp';
import imgBack from '../../assets-mint/undo_white_24dp.svg';
import imgMinteazy from '../../assets-omega/poweredMinteazy.png';

//CONSTs
const POLYGON_NETWORK_ID = serverConfig?.blockchain?.network?.chainId;
const ORACLE_POLYGON_CONTRACT_ADDRESS = '0xD336af2de2832d0320C47C91C5F8bC46344941F5';
const ORACLE_ETHEREUM_CONTRACT_ADDRESS = '0x77C6DA1916F16488Ce1a22ef5FF3812a559BF3BA';
const MAX_QUANTITY = 20;

class OmegaMint extends Component {
  constructor(props) {
    super(props);

    this.state = {
      //Metamask
      walletProvider: null,
      walletAccount: null,
      walletSigner: null,
      walletNetwork: null,
      isConnected: false,

      //LISTINGS
      listings: null,
      listingsFetched: false,
      listingSelected: null,

      //Blockchain Actions
      networkID: POLYGON_NETWORK_ID,
      oracleAddress: null,
      currentNetworkID: null,

      //Mint Currency Value
      mintCurrency: null,
      mintPrice: null,
      mintContractAddress: null,
      mintIsNative: null,
      mintIsOracle: null,
      mintQuantity: 1,

      //Wallet Info
      balanceChecking: null,
      balanceCurrent: null,
      balanceApproved: null,

      //isLoading
      onApproval: false,
      onMinting: false,
      isLoading: false
    };

    //Functions Binding
    this.isConnected = this.isConnected.bind(this);
  }



  //DID MOUNT
  componentDidMount(){
    this.getListings()
    this.getNetworkID()
  }
  //DID MOUNT END



  //LISTINGS
  getListings(){
    axios.post('/api/m1/server/getBrokenMarketplace', {})
    .then(res => 
      this.setState({
        listings: res.data.data.brokenMarketplace,
        listingsFetched: true
      })
    )
  }
  showListing(listing){
    console.log(listing)
    this.setState({listingSelected: listing})
  }
  //LISTINGS END



  //HANDLERS: PRICEs & QUANTITY
  handlePriceChange(e){
    //Reset BalanceChecked Bool
    this.setState({balanceChecking: true}, () => {

      //Get the Currency Values
      let currencySelected = JSON.parse(e.target.value);
      console.log(currencySelected);

      //Set the Currency Values
      this.setState({
        mintCurrency: currencySelected.name,
        mintPrice: currencySelected.value,
        mintContractAddress: currencySelected.contractAddress,
        mintIsNative: currencySelected.isNative,
        mintIsOracle: currencySelected.isOracle,
      }, () => {

        //Check Balance and if Need Approval
        if(currencySelected.isNative) this.checkNativeBalance()

        if(!currencySelected.isNative){
          this.checkCurrencyBalance(currencySelected.contractAddress);
          this.checkCurrencyAllowance(currencySelected.contractAddress);
        }

        //BalanceChecked Bool is true
        this.setState({balanceChecking: false})
      })

    })

    
  }
  setQuantity = (how) => { 
    if(how && this.state.mintQuantity==MAX_QUANTITY) return false
    if(!how && this.state.mintQuantity==1) return false

    how //[+] onClick
    ? this.setState((prevState, { mintQuantity }) => ({
        mintQuantity: prevState.mintQuantity +1
      }))

    //[-] onClick
    : this.setState((prevState, { mintQuantity }) => ({
        mintQuantity: prevState.mintQuantity -1
      }))
  }
  //HANDLERS: PRICEs & QUANTITY END



  //BLOCKCHAIN STUFF
  async isConnected(metamask){
    this.setState({
      //Metamask
      walletProvider: metamask.walletProvider,
      walletAccount: metamask.walletAccount[0],
      walletSigner: metamask.walletSigner,
      walletNetwork: metamask.walletNetwork,
      isConnected: metamask.isConnected,
    }, () => {
      if (this.state.walletNetwork.chainId == 137) 
          this.setState({oracleAddress: ORACLE_POLYGON_CONTRACT_ADDRESS})

      if (this.state.walletNetwork.chainId == 1) 
        this.setState({oracleAddress: ORACLE_ETHEREUM_CONTRACT_ADDRESS})
    })
  } 

  getNetworkID = async () => {
    let provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    let network = await provider.getNetwork()
    this.setState({currentNetworkID: network.chainId})
    provider.on("network", (newNetwork) => {
      if(this.state.isConnected)
        this.setState({isConnected: false})

      this.setState({currentNetworkID: newNetwork.chainId}, () => {

        if (newNetwork.chainId == 137) 
          this.setState({oracleAddress: ORACLE_POLYGON_CONTRACT_ADDRESS})

        if (newNetwork.chainId == 1) 
          this.setState({oracleAddress: ORACLE_ETHEREUM_CONTRACT_ADDRESS})
      })
    });
  }

  async checkNativeBalance () {
    console.log('checkNativeBalance...')

    const balance = await this.state.walletProvider.getBalance(this.state.walletAccount);
    this.setState({balanceCurrent: parseFloat(ethers.utils.formatEther(balance))})

    console.log(balance)
    console.log(ethers.utils.formatEther(balance))
    console.log(parseFloat(ethers.utils.formatEther(balance)))

    return(parseFloat(ethers.utils.formatEther(balance)))
  }

  async checkCurrencyBalance(contractAddress){
    console.log('checkCurrencyBalance...')

    const tokenInst = new ethers.Contract(contractAddress, ERC20ABI, this.state.walletSigner);
    const balance = await tokenInst.balanceOf(this.state.walletAccount)

    this.setState({balanceCurrent: parseFloat(ethers.utils.formatEther(balance))})

    return(parseFloat(ethers.utils.formatEther(balance)))
  }

  async checkCurrencyAllowance(contractAddress){
    console.log('checkCurrencyAllowance...')

    //Vars Declaration
    let contract = null;
    let approve = null;
    let balanceApproved = null;
    let receipt = null;

    //Get the Oracle Address
    let approveWallet = this.state.oracleAddress;
 
    //Initialize the Contract Object
    contract = new ethers.Contract(contractAddress, ERC20ABI, this.state.walletSigner);
 
    //Check ETH usage
    try{
      balanceApproved = await contract.allowance(
        this.state.walletAccount,
        approveWallet)
    }catch(err){
      console.error('OmegaMint #00001: ', err);
      this.notify(err.message)
    }

    //Set the Balance Approved to transfer to the Contract
    console.log('balanceApproved: ', balanceApproved)
    this.setState({balanceApproved: parseFloat(balanceApproved)})
  }

  async approveCurrency(contractAddress){
    console.log('approveCurrency...')

    if(this.state.onApproval) return false

    //Vars Declaration
    let contract = null;
    let approve = null;
    let checkApprove = null;
    let receipt = null;

    //Get the Oracle Address
    let approveWallet = this.state.oracleAddress;
 
    //Initialize the Contract Object
    contract = new ethers.Contract(contractAddress, ERC20ABI, this.state.walletSigner);
 
    //Approve the Currency
    try{
      this.setState({onApproval: true})

      //Ask to Sign
      approve = await contract.approve(
        approveWallet, 
        ethers.utils.parseEther(toFixed(this.state.mintPrice*this.state.mintQuantity, 5).toString()))
        
      //If the User has signed
      if(approve){
        let toastLoading = this.loading('Approving... Almost done!')
        receipt = await approve.wait();

        this.setState({
          onApproval: false,
          balanceApproved: this.state.mintPrice*this.state.mintQuantity,
        })

        toast.update(toastLoading, { 
          render: "Done, you can mint now!", 
          type: "success", 
          isLoading: false,
          autoClose: 3000 });
      }

    //Error during the Approval
    }catch(err){
      console.error('OmegaMint #00003');
      this.notify(err.message);
      this.setState({onApproval: false})
    }
  }

  async mint(){
    if(this.state.onMinting) return false

    //Vars Declaration
    let contract = null;
    let mint = null;
    let receipt = null;
    let approved = null;
    let contractAddress = null;
    let ABI = null;

    //Initialize the Contract Object
    contract = new ethers.Contract(this.state.oracleAddress, OracleABI, this.state.walletSigner);

    //Mint per Native Currency
    if (this.state.mintIsNative){
      console.log('Native for Minting: ', 
        ethers.utils.parseEther(
          toFixed(
            this.state.mintPrice*this.state.mintQuantity, 5
          ).toString()
        ).toString(),
        


      )

      let ovverides = {
        value: ethers.utils.parseEther(toFixed(this.state.mintPrice*this.state.mintQuantity, 5).toString())
      }; //Because it's NATIVE CURRENCY

      try{
        this.setState({onMinting: true})

        mint = await contract.purchase(
          this.state.listingSelected.idBrokenMarketplace,
          this.state.mintQuantity, 
          ovverides
        );

      }catch(err){
        console.error('OmegaMint #00004');
        this.notify(err.message);
        this.setState({onMinting: false})
      }
    }
    
    //Mint per Other Currencies
    if(!this.state.mintIsNative){
      try{
        this.setState({onMinting: true})

        mint = await contract.purchaseCurrency(
          this.state.mintContractAddress,
          this.state.listingSelected.idBrokenMarketplace,
          this.state.mintQuantity 
        );
      }catch(err){
        console.error('OmegaMint #00005');
        this.notify(err.message);
        this.setState({onMinting: false})
      }
    }

    if(mint){
      let toastLoading = this.loading('Minting... Almost done!')

      receipt = await mint.wait();

      this.setState({onMinting: false})

      toast.update(toastLoading, { 
        render: "Done!", 
        type: "success", 
        isLoading: false,
        autoClose: 5000  });
    }else{
      console.error('OmegaMint #00006');
      this.notify('Error, try again!');
    }
  }
  //BLOCKCHAIN STUFF END


  //HTML FUNCTIONS
  getMintButton(){

    //Balance Checking
    if(this.state.balanceChecking)
      return <Button
        variant='contained'> 
          <CircularProgress size={25} sx={{color:"white"}}/>
      </Button>
      

    //Balance Is Not Enough
    if(!this.state.balanceChecking  
      && this.state.balanceCurrent < this.state.mintPrice*this.state.mintQuantity)
      return <Button
        variant='contained'> 
          Balance Is Not Enough
      </Button>
      
    

    //Balance Is Enough, Currency is NOT Native And Need Approval
    if(
      !this.state.balanceChecking  
      && this.state.balanceCurrent >= this.state.mintPrice*this.state.mintQuantity
      && !this.state.mintIsNative
      && this.state.balanceApproved < this.state.mintPrice*this.state.mintQuantity
    )
      return <Button
        variant='contained'
        onClick={() => this.approveCurrency(this.state.mintContractAddress)}> 
          Approve {this.state.mintCurrency}
      </Button>

    //Balance Is Enough 
    //Currency is Native (NO Need Approval)
    //OR Currency is Not Native and it's Approved 
    if(
      !this.state.balanceChecking  
      && this.state.balanceCurrent >= this.state.mintPrice*this.state.mintQuantity
      && (this.state.mintIsNative || (this.state.balanceApproved >= this.state.mintPrice*this.state.mintQuantity))
    )
      return <Button
        variant='contained'
        onClick={() => this.mint()}> 
          Mint
      </Button>
  }

  getPricesSelect(){
    //POLYGON CURRENCIEs
    if(this.state.networkID == POLYGON_NETWORK_ID)
    return <>
      <option default hidden>Select Currency</option>

      {this.state.listingSelected?.prices_polygon?.map(currency => (
        <option value={JSON.stringify(currency)}>
          {toFixed(currency.value * this.state.mintQuantity, 5)} {currency.name}
        </option>
      ))}
    </>

    //ETHEREUM CURRENCIEs
    if(this.state.networkID == 1)
    return <>
      <option default hidden>Select Currency</option>
      {this.state.listingSelected?.prices_ethereum?.map(currency => (
        <option value={JSON.stringify(currency)}>
          {toFixed(currency.value * this.state.mintQuantity, 5)} {currency.name}
        </option>
      ))}
    </>
  }
  //HTML FUNCTIONS END



  //TOASTs
  loading = (message) => toast.loading(message);
  notify = (error) => toast.error(error);
  //TOASTs END



  render(){
    return (
      <>
        <div className='mintComponent omega'>

          <div className='omega-header'>
            <a href='https://www.omega.ancientsociety.io/game' target='_blank'>
              <img src={imgLogo} className='mintLogo' />
            </a>
          </div>

          <div className='mintContainer'> 

            {!this.state.listingsFetched && <CircularProgress size={100} sx={{color:"gold", margin:"50px"}}/>}     

            {/* DISPLAY LISTINGS */}
            {(this.state.listingsFetched && !this.state.listingSelected) &&
              <div className='mintListings'>
              {!this.state.listingSelected &&
                this.state.listings?.map((listing, i) => (
                  <div className='mintListing' key={i} onClick={()=>this.showListing(listing)}>
                    <h2 className='listingName'>{listing.name}</h2>
                    <img className='listingImg' src={listing.image}></img>
                    {/* <p className='listingDesc'>{listing.description}</p> */}
                    <span className='listingInfo'>
                      <Button 
                      className='listingShowBtn'
                      variant='contained' 
                      onClick={()=>this.showListing(listing)}>
                        Mint
                      </Button>
                      <p className='listingPrice'>
                        {toFixed(listing.prices_polygon.filter(element => element.isNative == true)[0]?.value, 5)} MATIC
                        / {toFixed(listing.prices_ethereum.filter(element => element.isNative == true)[0]?.value, 5)} ETH
                      </p>
                    </span>
                  </div>
                ))}
              </div>}

            {/* LISTING SELECTED */}
            {this.state.listingSelected &&
              <div className='mintSelected'>

                {/* LISTING INFO */}
                <div className='mintSelectedContainer option_img'>
                  <div className='mintSelectedHeader'>
                    <div className='mintSelectedBack'
                      onClick={()=>this.setState({
                        listingSelected: null, mintQuantity: 1
                      })}>
                      <img src={imgBack}/>
                    </div>
                    <h2>{this.state.listingSelected.name}</h2>
                  </div>
                  <div className='mintSelectedHeadlineAndImg'>
                    <img src={this.state.listingSelected.image}/>
                  </div>  
                </div>

                {/* LISTING ACTIONS */}
                <div className='mintSelectedContainer'>

                  {/* LISTING DESC & DROPs */}
                  <div className='listingDesc'>
                    {this.state.listingSelected.description}
                    <p className='listingDrops'>
                      {this.state.listingSelected.products?.map((element, i) => (
                        <p className={element.nft ? 'isNFT listingDrop' : 'listingDrop'} key={i}>
                          - x{element.quantity} {element.nft ? 'NFT' : null} {element.name} {element.level >= 0 && `+${element.level}`} 
                        </p>
                      ))}
                    </p>
                  </div>
                  
                  {/* LISTING PRICEs */}
                  <div className='mintActions'>
                    {this.state.isConnected &&
                      <div className='mintPrice'>
                        <select 
                          name='Price' 
                          defaultValue='Select' 
                          onChange={(e) => this.handlePriceChange(e)}
                        > 
                            {this.getPricesSelect()}
                        </select>
                      </div>}

                    {/* WALLET CONNECT */}
                    {/* POLYGON */}
                    {(!this.state.isConnected && this.state.networkID==POLYGON_NETWORK_ID) && 
                      <div className='useWallet'>
                        <h3><span className='ancientGold'>[POLYGON]</span> Connect your Wallet</h3>
                        <WalletHandler 
                          currentNetworkID={this.state.currentNetworkID}
                          networkID={this.state.networkID} 
                          callback_isConnected={this.isConnected}/>
                        <p 
                        className='switchNetwork'
                        onClick={()=>this.setState({networkID: 1})}>
                          You want to mint on Ethereum Mainnet?
                        </p>
                      </div>}
                    {/* ETHEREUM  */}
                    {(!this.state.isConnected && this.state.networkID==1) && 
                    <div className='useWallet'>
                      <h3><span className='ancientGold'>[ETHEREUM]</span> Connect your Wallet</h3>
                      <WalletHandler 
                      currentNetworkID={this.state.currentNetworkID}
                      networkID={this.state.networkID} 
                      callback_isConnected={this.isConnected}/>
                      <p 
                      className='switchNetwork'
                      onClick={()=>this.setState({networkID: POLYGON_NETWORK_ID})}>
                        You want to mint on Polygon Mainnet?
                      </p>
                    </div>}

                    {/* CURRENCY SELECTED*/}
                    {(this.state.isConnected 
                    && this.state.mintCurrency) && 

                    <div className='useWallet'>
                      <div className='mintQuantity'>
                        <button className='btnQuantity'
                          onClick={()=>this.setQuantity(false)}>
                            -
                        </button>
                        <input type='quantity' value={this.state.mintQuantity} readOnly/>
                        <button className='btnQuantity'
                          onClick={()=>this.setQuantity(true)}>
                            +
                        </button>
                      </div>

                      {this.getMintButton()}

                      {this.state.networkID==POLYGON_NETWORK_ID &&
                      <p 
                        className='switchNetwork'
                        onClick={()=>this.setState({networkID: 1, isConnected: false})}>
                          You want to mint on Ethereum Mainnet?
                      </p>}

                      {this.state.networkID==1 &&
                      <p 
                        className='switchNetwork'
                        onClick={()=>this.setState({networkID: POLYGON_NETWORK_ID, isConnected: false})}>
                          You want to mint on Ethereum Mainnet?
                      </p>}

                    </div>}

                  </div>

                </div>
                
              </div>}
          </div> 

          <div className='omega-footer'>
            <a href='https://twitter.com/MinteazyDev' target='_blank'><img src={imgMinteazy}/></a>
          </div>

          <ToastContainer 
            position="top-right"
            autoClose={1500}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
          />
          

        </div>  
      </>
    )
  }
}

export default OmegaMint