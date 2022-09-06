import React, { Component } from 'react';
import { ethers, utils } from "ethers";

import {
    Button,
    CircularProgress,
} from '@mui/material';
  
const linkOpensea = "https://linktr.ee/ancientsociety";
const linkDiscord = "https://discord.gg/ancientsociety";
const linkTwitter = "https://twitter.com/_ancientsociety";

class WalletHandler extends Component {
    
    constructor(props) {
        super(props);
    
        this.state = {
            walletProvider: null,
            walletAccount: null,
            walletSigner: null,
            walletNetwork: null,
            onConnect: false,

            //NETWORK PROPS
            networkID: props.networkID,
            currentNetworkID: props.currentNetworkID,
        }
    }

    componentDidUpdate(){
        if(this.state.networkID != this.props.networkID) 
            this.setState({networkID: this.props.networkID})

        if(this.state.currentNetworkID != this.props.currentNetworkID) 
            this.setState({currentNetworkID: this.props.currentNetworkID})

        if(this.state.onConnect && (this.state.networkID == this.state.currentNetworkID))
            this.setState({onConnect: false})
    }

    walletInit = async () => {
        this.setState({onConnect: true})

        // Get Provider
        const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
        console.log('provider: ', provider)

        //Get Network Info
        const network = await provider.getNetwork()

        //Set States (Provider, Network)
        this.setState({walletProvider: provider, walletNetwork: network}, ()=> {
            network.chainId == this.state.networkID
            ?   this.walletAccountConnection() 
            :   this.chainSwitch()
        });
    }

    chainSwitch = async() => {
        const networkMap = {
            137: {
                chainId: utils.hexValue(137),
                chainName: "Matic(Polygon) Mainnet", 
                nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
                rpcUrls: ["https://polygon-rpc.com"],
                blockExplorerUrls: ["https://www.polygonscan.com/"],
            },
            80001: {
                chainId: utils.hexValue(80001), 
                chainName: "Matic(Polygon) Mumbai", 
                nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
                rpcUrls: ["https://matic-mumbai.chainstacklabs.com"],
                blockExplorerUrls: ["https://polygonscan.com/"],
            },
        };

        try {
        // check if the chain to connect to is installed
        await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{chainId: utils.hexValue(this.state.networkID)}], 
        });
        } catch (error) {
        // This error code indicates that the chain has not been added to MetaMask
        // if it is not, then install it into the user MetaMask
        if (error.code === 4902) {
            try {
            await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [networkMap[this.state.networkID]],
            });
            } catch (addError) {
                this.setState({onConnect: false})
            }
        }else{this.setState({onConnect: false})}
            this.setState({onConnect: false})
        }
    }

    walletAccountConnection = async() => {
        const provider = this.state.walletProvider;

        //Request Accounts    
        try{
            const requestAccounts = await provider.send("eth_requestAccounts", []);
            this.setState({walletAccount: requestAccounts})

            // Set Event for Account Changed
            window.ethereum.on("accountsChanged", (accounts) => {
                this.accountChanged(accounts); 
            });

            //Get Signer
            const signer = await provider.getSigner();

            signer && this.setState({
                onConnect: false,
                walletSigner: signer
            }, () => { 
                this.props.callback_isConnected(
                    {
                        walletProvider: this.state.walletProvider,
                        walletAccount: this.state.walletAccount,
                        walletSigner: this.state.walletSigner,
                        walletNetwork: this.state.walletNetwork,
                        isConnected: true
                    }
                ) 
            })
        
        } catch(err) {
            this.setState({onConnect: false})
            err.code === 4001 
            ? console.log('User rejected the request')
            : console.log('Error: ', err)
        }
    }

    accountChanged(accounts){
        console.log('accountChanged')

        this.props.callback_isConnected(
            {
                walletProvider: this.state.walletProvider,
                walletAccount: this.state.walletAccount,
                walletSigner: this.state.walletSigner,
                walletNetwork: this.state.walletNetwork,
                isConnected: false
            }
        )
    }

  render(){ return (
    <Button variant='contained' onClick={() => this.walletInit()}>
        {this.state.onConnect &&
        <CircularProgress size={25} sx={{color:"white"}}/>}
        {!this.state.onConnect && (this.state.currentNetworkID == this.state.networkID)
        ? 'Connect Wallet'
        : !this.state.onConnect && (this.state.currentNetworkID != this.state.networkID)
            ? 'Switch Network'
            : null}
    </Button>
    )}

}

export default WalletHandler