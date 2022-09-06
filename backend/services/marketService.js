const logger = require('../logging/logger');
const {MarketQueries} = require('../queries/marketQueries');


class MarketService{

    static buildFinalResponse(listing){
        let listingResponse = [];
        
        for(let i = 0; i < listing.length; i++){
            let ad = {};
            
            ad.id = listing[i].id;
            ad.type = listing[i].type;
            ad.quantity = listing[i].quantity;
            ad.price = listing[i].price;
            ad.totalPrice = listing[i].totalPrice;
            ad.endingTime = listing[i].endingTime;
            ad.saleTime = listing[i].saleTime;
            ad.status = listing[i].status;

            listingResponse.push(ad);
        }
        return listingResponse;
    }

}

module.exports = {MarketService};