const logger = require('../logging/logger');

const Web3 = require('web3');
const ABI = require('../ABI/profile-emblems.json');

const web3Ethereum = new Web3(new Web3.providers.WebsocketProvider(process.env.INFURA_ETH_ENDPOINT));
const web3Polygon = new Web3(new Web3.providers.WebsocketProvider(process.env.CHAINSTACK_MAINNET_ENDPOINT));

class ProfileHelper{
    constructor(){}

    static async getBalanceStaking(network, stakingInfo, address, contract, balanceMin) {
        let myContract;
        let balanceOf;

        try{
            // console.log('[NETWORK]: ', network)
            if(network == 1) myContract = new web3Ethereum.eth.Contract(ABI, contract);
            if(network == 137) myContract = new web3Polygon.eth.Contract(ABI, contract);
            // console.log('[myContract]: ', myContract)
            balanceOf = await this.getBalanceStakingCustom(stakingInfo, address, myContract)
        }catch(error){
            logger.info(`Error in getBalanceStaking: ${error}`);
            return false;
        }

        // console.log('getBalanceStaking [balanceOf]: ', balanceOf)
        
        if (balanceOf >= balanceMin){ return true }
        else{ return false } 
    }

    static async getBalanceStakingCustom(stakingInfo, address, contract){
        let balanceOf;

        //Check STAKING INFO
        switch(stakingInfo){

            //For Loot And Glory [FLAG]: addressStakedBalance
            case 'flag':
                try{
                    // console.log('contract.options.address', contract.options.address)
                    balanceOf = await contract.methods.addressStakedBalance(address).call();
                    return parseInt( web3Polygon.utils.fromWei(balanceOf, 'ether') )
                }catch(error){
                    logger.info(`Error in getBalanceStakingCustom [flag]: ${error}`);
                    return false;
                }
        }
    }
}
module.exports = {ProfileHelper}