const logger = require('../../logging/logger')
const { Utils } = require('../../utils/utils');

const {ServerHelper} = require('../../helpers/serverHelper');

const {httpMainnetWeb3} = require('../../config/web3Config')




class ServerInterface{
    constructor() {}

    static async buildMarketOfferModel(rows, specialCurrencies, anyCurrencies){
        let marketOfferList = [];
        let broken_marketplace = this.groupBy(rows, "idBrokenMarketplace");
        logger.debug("broken_marketplace: ", broken_marketplace)
        //UNCOMMENT WHE USING CRYPTO NON HANDLED BY ORACLES
        // let specialCurrencies = this.groupBy(rows, "idBrokenMarketplace");


        for(let propId in broken_marketplace){
            let marketOffer = {};
            let prop = broken_marketplace[propId][0];
            let elements = [];
            let prices_polygon = [];
            let prices_ethereum = [];

            marketOffer.idBrokenMarketplace = prop.idBrokenMarketplace
            marketOffer.name = prop.marketName
            marketOffer.description = prop.marketDescription
            marketOffer.image = prop.marketImage
            marketOffer.price = prop.price
            

            for(let row of broken_marketplace[propId]){
                switch(row.offerType){
                    case "item": 
                        elements.push({
                            name: row.itemName,
                            level: -1,
                            quantity: row.quantity
                        });

                        break;

                    case "recipe": 
                        elements.push({
                            name: row.recipeName,
                            level: -1,
                            quantity: row.quantity
                        });

                        break;

                    case "tool": 
                        elements.push({
                            name: row.toolName,
                            level: row.toolLevel,
                            quantity: row.quantity
                        });

                        break;

                    case "building": 
                        elements.push({
                            name: row.bldName,
                            level: row.bldLevel,
                            quantity: row.quantity,
                            nft: true
                        });

                        break;
                    default:
                        break;
                }
            }

            for(let currency of anyCurrencies){
                console.log("currency: ", currency)
                let weiPrice;
                if(currency.isOracle){ 
                    //CALLING SMART CONTRACT FUNCTION TO GET ACTUAL PRICE
                    try{
                        weiPrice = await ServerHelper.getOraclePrice(currency.oracleAddress, prop.price, currency.chainId);
                    }catch(error){
                        logger.error(`Error in ServerHelper.getOraclePrice: ${Utils.printErrorLog(error)}`);
                        throw error;
                    }

                } else {
                    //CALLING COINBASE APIS(NOT ACTIVE NOW)
                    console.log("Non Oracle currency")
                    continue;

                }

                let priceObject = {
                    name: currency.name,
                    contractAddress: currency.contractAddress,
                    value: httpMainnetWeb3.utils.fromWei(weiPrice),
                    isOracle: currency.isOracle,
                    isNative: currency.isNative
                };

                if(currency.chainId == 1){
                    prices_ethereum.push(priceObject)
                } else if (currency.chainId == 137){
                    prices_polygon.push(priceObject)
                }


            }
            



            marketOffer.products = elements;
            marketOffer.prices_ethereum = prices_ethereum;
            marketOffer.prices_polygon = prices_polygon;

            marketOfferList.push(marketOffer);
        }
        
        return marketOfferList
    }

    static groupBy(collection, key){
        const groupedResult =  collection.reduce((previous,current)=>{
     
        if(!previous[current[key]]){
          previous[current[key]] = [];
         }
     
        previous[current[key]].push(current);
               return previous;
        }, {}); // tried to figure this out, help!!!!!
          return groupedResult
      }
}

module.exports = { ServerInterface }
