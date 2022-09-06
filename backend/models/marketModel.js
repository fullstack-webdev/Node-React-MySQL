const mysql = require('../config/databaseConfig');
const logger = require('../logging/logger');
const {Utils} = require("../utils/utils");

class MarketModel {
    constructor() {}

    buildFinalResponse(listing){
        let listingResponse = [];
        
        for(let i = 0; i < listing.length; i++){
            let ad = {};
            
            ad.id = listing[i].id;
            ad.type = listing[i].type;
            if(listing[i].type == 2){
                ad.name = 'Wood'
                ad.image = process.env.WOOD_IMAGE;
            }
            if(listing[i].type == 3){
                ad.name = 'Stone'
                ad.image = process.env.STONE_IMAGE;
            }
            ad.quantity = listing[i].quantity;
            ad.price = listing[i].price;
            ad.totalPrice = listing[i].totalPrice;
            ad.endingTime = listing[i].endingTime;
            ad.saleTime = listing[i].saleTime;
            ad.status = listing[i].status;
            ad.market = 'storage';


            listingResponse.push(ad);
        }
        return listingResponse;
    }
}

class MarketService {
    constructor() {}

    async checkListingStatus(listing){
        let now = new Date().getTime();

        let idToUpdate = [];
        let responseUpdateStatus;

        // console.log("listing: ", listing);

        for(let i = 0; i < listing.length; i++){
            //new Date(null) => 1 january 1970
            let endingTimeMillisec = new Date(listing[i].endingTime).getTime();

            if( now >= endingTimeMillisec && listing[i].status == 1){
                if(listing[i].type == 2){
                    try{
                        responseUpdateStatus = await this.updateExpiredAdWood(listing[i].id, listing[i].owner, listing[i].quantity);
                        if(responseUpdateStatus[1].changedRows != 1){
                            logger.error(`EXPIRATION is failed, responseBalance: ${responseBalance}`);
                            throw {
                                success: false,
                                error: {
                                    errorCode: 189, 
                                    errorMessage: `We are happy that you are forcing the APIs, remember that we have bug bounties if you find something.
                                    But also remember that we are logging everything.
                                    Unauthorized access is illegal.`
                                }
                            };
                            
                        }
                        logger.debug(`responseUpdateStatus wood: ${JSON.stringify(responseUpdateStatus)}`);
                    }catch(error){
                        console.log("Errore in updateExpireAdWood", error)
                        logger.error(`Error in updateExpiredAdWood, error: ${Utils.printErrorLog(error)}`);
                        throw error;
                    }

                }else if(listing[i].type == 3){
                    try{
                        responseUpdateStatus = await this.updateExpiredAdStone(listing[i].id, listing[i].owner, listing[i].quantity);
                        if(responseUpdateStatus[1].changedRows != 1){
                            logger.error(`EXPIRATION is failed, responseBalance: ${responseBalance}`);
                            throw {
                                success: false,
                                error: {
                                    errorCode: 189, 
                                    errorMessage: `We are happy that you are forcing the APIs, remember that we have bug bounties if you find something.
                                    But also remember that we are logging everything.
                                    Unauthorized access is illegal.`
                                }
                            };
                        }
                        logger.debug(`responseUpdateStatus stone: ${JSON.stringify(responseUpdateStatus)}`);
                    }catch(error){
                        console.log("Errore in updateExpireAdStone", error)
                        logger.error(`Error in updateExpiredAdWood, error: ${Utils.printErrorLog(error)}`);
                        throw error;
                    }
                }
                listing[i].status = 0;
                //idToUpdate.push(i);
            }
        }

        // if(idToUpdate.length > 0){
        //     try{   
        //         responseUpdateStatus = await this.updateMultipleAdStatus(idToUpdate, 0);

        //     }catch(error){
        //         console.log("Error in updateMultipleAdStatus: ", error);
        //     }
        // }

        return listing;
    }

    async updateExpiredAdWood(id, owner, quantity){
        return new Promise((resolve, reject) => {
            let sql = `
            LOCK TABLES utente WRITE, marketplace WRITE;
            UPDATE utente 
            SET wood = wood + ? 
            WHERE address = ?
            AND (SELECT status FROM marketplace WHERE id = ?) = 1;

            UPDATE marketplace 
            SET status = 0 
            WHERE endingTime < current_timestamp 
            AND status = 1 
            AND id = ?;
            
            UNLOCK TABLES;`;

            mysql.query(sql, [quantity, owner, id, id], (err, rows, fields) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    console.log("null error in updateExpiredAdWood: ", id, owner, quantity);

                    return reject({
                        message: "undefined"
                    });
                }else{
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }

            });
        });
    }

    async updateExpiredAdStone(id, owner, quantity){
        return new Promise((resolve, reject) => {
            let sql = `
            LOCK TABLES utente WRITE, marketplace WRITE;
            UPDATE utente 
            SET stone = stone + ? 
            WHERE address = ?
            AND (SELECT status FROM marketplace WHERE id = ?) = 1;

            UPDATE marketplace 
            SET status = 0 
            WHERE endingTime < current_timestamp 
            AND status = 1 
            AND id = ?;
            UNLOCK TABLES;`;

            mysql.query(sql, [quantity, owner, id, id], (err, rows, fields) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    console.log("null error in updateExpiredAdStone: ", id, owner, quantity);

                    return reject({
                        message: "undefined"
                    });
                }else{
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }

            });
        });
    }

    changeStatusForOwner(listing, address){
        for(let i = 0; i < listing.length; i++){
            if(listing[i].owner == address){
                listing[i].status = 4;
            }
        }
        return listing;
    }

    async getAllListing(limit, offset, status){
        return new Promise((resolve, reject) => {
            /*let sql = `UPDATE marketplace SET status = 0 WHERE endingTime < current_timestamp AND status = 1;
            SELECT * 
            FROM marketplace 
            WHERE status = 1
            order by price asc 
            LIMIT ? OFFSET ?;
            SELECT count(*) as counter FROM marketplace WHERE status = 1`;
            */

            let orderBy = 'price asc';
            if (status == 2) orderBy = 'saleTime desc'

            //TODO rimuovere prima query inutile
            let sql = ` 
            SELECT * 
            FROM marketplace 
            WHERE status = ?
            AND endingTime > current_timestamp
            order by ${orderBy} 
            LIMIT ? OFFSET ?;
            SELECT count(*) as counter FROM marketplace WHERE status = 1`;

            mysql.query(sql, [status, limit, offset], (err, rows, fields) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    console.log("null error in getAllListing: ", address, limit, offset);

                    return reject({
                        message: "undefined"
                    });
                }else{
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }

            });
        });
    }

    async getAllListingGivenType(limit, offset, type, status){
        return new Promise((resolve, reject) => {
            // let sql = "SELECT * FROM marketplace WHERE endingTime > current_timestamp AND status = 1 AND type = ? order by price asc LIMIT ? OFFSET ?";  
            /*let sql = `UPDATE marketplace SET status = 0 WHERE endingTime < current_timestamp AND status = 1;
            SELECT * 
            FROM marketplace 
            WHERE status = 1 
            AND type = ? 
            order by price asc 
            LIMIT ? OFFSET ?;
            SELECT count(*) as counter FROM marketplace WHERE status = 1 AND type = ?`; 
            */ 

            let orderBy = 'price asc';
            if (status == 2) orderBy = 'saleTime desc'

            //TODO rimuovere prima query inutile
            let sql = `
            SELECT * 
            FROM marketplace 
            WHERE status = ?
            AND type = ? 
            AND endingTime > current_timestamp
            order by ${orderBy}  
            LIMIT ? OFFSET ?;
            SELECT count(*) as counter FROM marketplace WHERE status = 1 AND type = ?`; 

            mysql.query(sql, [status, type, limit, offset, type], (err, rows, fields) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    console.log("null error in getAllListing: ", address, limit, offset);

                    return reject({
                        message: "undefined"
                    });
                }else{
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }

            });
        });
    }


    async getAccountListing(address, minId){
        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM marketplace WHERE owner = ? AND toShow = 1 AND id > ? order by status = 1 desc";  //limit ?

            mysql.query(sql, [address, minId], (err, rows, fields) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    console.log("null error: ", address);

                    return reject({
                        message: "undefined"
                    });
                }else{
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }

            });
        });
    }

    async getAccountListingGivenStatus(address, status){
        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM marketplace WHERE owner = ? AND toShow = 1 AND status = ? order by id desc";  //limit ?

            mysql.query(sql, [address, status], (err, rows, fields) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    console.log("null error: ", address);

                    return reject({
                        message: "undefined"
                    });
                }else{
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }

            });
        });
    }

    async getSingleListing(id){
        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM marketplace WHERE id = ?";

            mysql.query(sql, id, (err, rows, fields) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    console.log("null error: ", id);

                    return reject({
                        message: "undefined"
                    });
                }else{
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }

            });
        });
    }

    async createAd(address, type, quantity, price, totalPrice, creationTime, endingTime){
        return new Promise((resolve, reject) => {
            let sql = "INSERT INTO marketplace (owner, type, quantity, price, totalPrice, status, creationTime, endingTime) VALUES (?, ?, ?, ?, ?, 1, ?, ?)";

            mysql.query(sql, [address, type, quantity, price, totalPrice, creationTime, endingTime], (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    console.log("null error: ", address);

                    return reject({
                        message: "undefined"
                    });
                }else{
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }

            });
        });
    }

    async updateMultipleAdStatus(ids, status){
        return new Promise((resolve, reject) => {
            let sql = "UPDATE marketplace SET status = ? WHERE id IN (?)";

            mysql.query(sql, [status, ids], (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    console.log("null error: ", address);

                    return reject({
                        message: "undefined"
                    });
                }else{
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    async cancelSingleAdStatus(id, deleteTime){
        return new Promise((resolve, reject) => {
            let sql = "UPDATE marketplace SET status = 3, deleteTime = ? WHERE id = ?";

            mysql.query(sql, [deleteTime, id], (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    console.log("null error: ", address);

                    return reject({
                        message: "undefined"
                    });
                }else{
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    async removeAd(id, owner){
        return new Promise((resolve, reject) => {
            let sql = "UPDATE marketplace SET toShow = CASE WHEN (owner = ?) AND (status <> 1) THEN 0 ELSE toShow END WHERE id = ?";

            mysql.query(sql, [owner, id], (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    console.log("null error: ", address);

                    return reject({
                        message: "undefined"
                    });
                }else{
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    async buyAd(id, buyer){
        // logger.info(`buyAd start`);
        return new Promise((resolve, reject) => {
            let sql = `
            UPDATE marketplace
            SET buyer = ?,
            status = 2,
            saleTime = CURRENT_TIMESTAMP()
            WHERE id = ?
            AND status = 1
            AND totalPrice <= (SELECT ancien FROM utente WHERE address = ?)
            AND endingTime > CURRENT_TIMESTAMP()
            AND owner <> ?;`;

            mysql.query(sql, [buyer, id, buyer, buyer], (err, rows) =>{
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    // logger.error(`query error: ${err}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    // logger.info(`buyAd end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }
}


module.exports = {
    MarketModel,
    MarketService
}