// const logger = require('../../logging/logger');

class MarketInventoryInterface {
    constructor() { }

    static buildFinalResponse(listing) {
        let listingResponse = [];

        for (let i = 0; i < listing.length; i++) {
            let ad = {};

            ad.id = listing[i].idMarketplaceInventory;

            if (listing[i].inventoryType == 'recipe') {

                ad.name = listing[i].recipeName;
                ad.image = listing[i].recipeImage;
            } else if (listing[i].inventoryType == 'item') {

                ad.name = listing[i].itemName;
                ad.image = listing[i].itemImage;
            } else if (listing[i].inventoryType == 'tool') {

                ad.name = listing[i].toolName + " + " + listing[i].toolLevel;
                ad.image = listing[i].toolImage;
                ad.level = listing[i].toolLevel;
            }

            ad.type = listing[i].type;
            ad.inventoryType = listing[i].inventoryType;
            ad.quantity = listing[i].quantity;
            ad.price = listing[i].price;
            ad.totalPrice = listing[i].totalPrice;
            ad.endingTime = listing[i].endingTime;
            ad.saleTime = listing[i].saleTime;
            ad.status = listing[i].status;
            ad.bought = 0;
            ad.market = "inventory";
            ad.idToolInstance = listing[i].idToolInstance;

            listingResponse.push(ad);
        }
        return listingResponse;
    }

    static buildFinalResourceResponse(listing) {
        let listingResponse = [];

        for (let i = 0; i < listing.length; i++) {
            let ad = {};

            ad.id = listing[i].id;

            if (listing[i].type == 2) {

                ad.name = 'Wood';
                ad.image = 'https://ancient-society.s3.eu-central-1.amazonaws.com/resources/wood.webp';
            } else if (listing[i].type == 3) {

                ad.name = 'Stone';
                ad.image = 'https://ancient-society.s3.eu-central-1.amazonaws.com/resources/stone.webp';
            }

            ad.type = listing[i].type;
            ad.quantity = listing[i].quantity;
            ad.price = listing[i].price;
            ad.totalPrice = listing[i].totalPrice;
            ad.endingTime = listing[i].endingTime;
            ad.saleTime = listing[i].saleTime;
            ad.status = listing[i].status;
            ad.bought = 0;
            ad.market = "resource";
            ad.idToolInstance = listing[i].idToolInstance;

            listingResponse.push(ad);
        }
        return listingResponse;
    }
}

module.exports = { MarketInventoryInterface }