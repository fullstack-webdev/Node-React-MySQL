const logger = require("../logging/logger");
const Validator = require("../utils/validator");

const MAX_LISTING_TIME = (3600 * 24 * 28 + 3600 * 23); // 28 days and 23 h

class MarketInventoryValidation{

    static getCheapestInventoriesValidation(req){
        let address = req.locals.address;

        if(!Validator.validateInput(address)){
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}`);
            return {
                success: false,
                error: {
                    errorMessage: "input null or undefined"
                }
            }
        }

        if(!Validator.validateAddress(address)){
            logger.warn(`Warn in validateInput unvalid, address: ${address}`);
            return {
                success: false,
                error: {
                    errorMessage: `Not a valid address`
                }
            }
        }

        return {
            success: true
        }
    }

    static buyResourceAndInventoryValidation(req){
        let address = req.locals.address;
        let buyIds = req.body.buyIds;
        let market = req.body.market;

        if(!Validator.validateInput(address, buyIds, market)){
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}, buyIds: ${JSON.stringify(buyIds)}, market: ${market}`);
            return {
                success: false,
                error: {
                    errorMessage: "input null or undefined"
                }
            }
        }

        if(!Validator.validateAddress(address)){
            logger.warn(`Warn in validateInput unvalid, address: ${address}`);
            return {
                success: false,
                error: {
                    errorMessage: `Not a valid address`
                }
            }
        }

        try {
            for(let i = 0; i < buyIds.length; i++) {
                if(!Validator.isPositiveInteger(buyIds[i])) {
                    logger.warn(`Warn in validateInput unvalid, buyId: ${buyIds[i]}`);
                    return {
                        success: false,
                        error: {
                            errorMessage: `Not a valid buyId`
                        }
                    }
                }
            }
        } catch ( error ) {
            return {
                success: false,
                error: {
                    errorMessage: `Not a array buyIds`
                }
            }
        }

        return {
            success: true
        }
    }

    static getTotalListingValidation(req){
        let address = req.locals.address;
        let type = req.body.type;
        let id = req.body.id;
        let level = req.body.level;

        if(!Validator.validateInput(type, id, level)){
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}, type: ${type}, id: ${id}, level: ${level}`);
            return {
                success: false,
                error: {
                    errorMessage: "input null or undefined"
                }
            }
        }

        if(!Validator.validateAddress(address)){
            logger.warn(`Warn in validateInput unvalid, address: ${address}`);
            return {
                success: false,
                error: {
                    errorMessage: `Not a valid address`
                }
            }
        }

        if(!Validator.ValidateInventoryType(type)){
            logger.warn(`Warn in validateInput unvalid, type: ${type}`);
            return {
                success: false,
                error: {
                    errorMessage: `Not a valid type`
                }
            }
        }

        if(!Validator.isPositiveInteger(id)){
            logger.warn(`Warn in validateInput unvalid, id: ${id}`);
            return {
                success: false,
                error: {
                    errorMessage: `Not a valid id`
                }
            }
        }

        if(!Validator.isNaturalInteger(level)){
            logger.warn(`Warn in validateInput unvalid, level: ${level}`);
            return {
                success: false,
                error: {
                    errorMessage: `Not a valid level`
                }
            }
        }

        return {
            success: true
        }
    }

    static getAllListingValidation(req){
        let address = req.locals.address;
        let status = req.body.status;
        let page = req.body.page;
        let name = req.body.name;
        let inventoryType = req.body.inventoryType;

        if(!Validator.validateInput(address, status, page)){
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}, status: ${status}, page: ${page}`);
            return {
                success: false,
                error: {
                    errorMessage: "address input null or undefined"
                }
            }
        }

        if(!Validator.validateAddress(address)){
            logger.warn(`Warn in validateInput unvalid, address: ${address}`);
            return {
                success: false,
                error: {
                    errorMessage: `Not a valid address`
                }
            }
        }

        if(!Validator.isPositiveInteger(page)){
            logger.warn(`Warn in validateInput unvalid, page: ${page}`);
            return {
                success: false,
                error: {
                    errorMessage: `Not a valid page`
                }
            }
        }
        
        if(Validator.validateInput(name)){
            if(!Validator.validateName(name)){
                logger.warn(`Warn in name, name: ${name}`);
        
                return {
                    success: false,
                    error: {
                        errorMessage: `Not a valid name`
                    }
                }
            }
        }

        if(Validator.validateInput(inventoryType)){
            if(!Validator.ValidateInventoryType(inventoryType)){
                logger.warn(`Warn in validateInput unvalid, inventoryType: ${inventoryType}`);
                return {
                    success: false,
                    error: {
                        errorMessage: `Not a valid inventoryType`
                    }
                }
            }
        }
        

        return {
            success: true
        }
    }

    static getAccountListingValidation(req) {
        let address = req.locals.address;
        let id = req.body.id;
        
        if(!Validator.validateInput(address)){
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}`);
            return {
                success: false,
                error: {
                    errorMessage: "input null or undefined"
                }
            }
        }

        if(!Validator.validateAddress(address)){
            logger.warn(`Warn in validateInput unvalid, address: ${address}`);
            return {
                success: false,
                error: {
                    errorMessage: `Not a valid address`
                }
            }
        }

        return {
            success: true
        }
    }

    static getPersonalHistoryValidation(req) {
        let address = req.locals.address;
        let page = req.body.page;
        let name = req.body.name;
        let inventoryType = req.body.inventoryType;

        if(!Validator.validateInput(address, page)){
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}, page: ${page}`);
            return {
                success: false,
                error: {
                    errorMessage: "address input null or undefined"
                }
            }
        }

        if(!Validator.validateAddress(address)){
            logger.warn(`Warn in validateInput unvalid, address: ${address}`);
            return {
                success: false,
                error: {
                    errorMessage: `Not a valid address`
                }
            }
        }

        if(!Validator.isPositiveInteger(page)){
            logger.warn(`Warn in validateInput unvalid, page: ${page}`);
            return {
                success: false,
                error: {
                    errorMessage: `Not a valid page`
                }
            }
        }

        if(Validator.validateInput(name)){
            if(!Validator.validateName(name)){
                logger.warn(`Warn in name, name: ${name}`);
        
                return {
                    success: false,
                    error: {
                        errorMessage: `Not a valid name`
                    }
                }
            }
        }

        if(Validator.validateInput(inventoryType)){
            if(!Validator.ValidateInventoryType(inventoryType)){
                logger.warn(`Warn in validateInput unvalid, inventoryType: ${inventoryType}`);
                return {
                    success: false,
                    error: {
                        errorMessage: `Not a valid inventoryType`
                    }
                }
            }
        }

        return {
            success: true
        }
    }

    static createAdValidation(req) {
        let address = req.locals.address;
        let inventoryType = req.body.inventoryType;
        let id = req.body.id;
        let price = req.body.price;
        let duration = req.body.duration;
        let quantity = req.body.quantity;

        if(!Validator.validateInput(address, inventoryType, id, price, duration, quantity)){
            logger.warn(`Warn in validateInput (Input null or undefined)`);
            return {
                success: false,
                error: {
                    errorMessage: "input null or undefined"
                }
            }
        }

        if(!Validator.validateAddress(address)){
            logger.warn(`Warn in validateInput unvalid, address: ${address}`);
            return {
                success: false,
                error: {
                    errorMessage: `Not a valid address`
                }
            }
        }


        if(!Validator.isPositiveFloatWithLessThanTwoDecimals(price)){
            logger.warn(`Warn in validateInput unvalid, price: ${price}`);
            return {
                success: false,
                error: {
                    errorMessage: `Not a valid price`
                }
            }
        }

        if(!Validator.isPositiveInteger(id)){
            logger.warn(`Warn in validateInput unvalid, id: ${id}`);
            return {
                success: false,
                error: {
                    errorMessage: `Not a valid id`
                }
            }
        }

        if(!Validator.isPositiveInteger(quantity) || quantity < 1){
            logger.warn(`Warn in validateInput unvalid, quantity: ${quantity}`);
            return {
                success: false,
                error: {
                    errorMessage: `Not a valid quantity`
                }
            }
        }

        if(!Validator.isPositiveInteger(duration) || duration < 3600  || duration > MAX_LISTING_TIME){
            logger.warn(`Warn in validateInput unvalid, duration: ${duration}`);
            return {
                success: false,
                error: {
                    errorMessage: `Not a valid duration`
                }
            }
        }

        if(!Validator.ValidateInventoryType(inventoryType)){
            logger.warn(`Warn in validateInput unvalid, inventoryType: ${inventoryType}`);
            return {
                success: false,
                error: {
                    errorMessage: `Not a valid inventoryType`
                }
            }
        }

        return {
            success: true
        }
    }

    static buyAdValidation(req) {
        let address = req.locals.address;
        let id = req.body.id;
        let filter = req.body.filter;
        let page = req.body.page;
        
        if(!Validator.validateInput(address, id)){
            logger.warn(`Warn in validateInput (Input null or undefined)`);
            return {
                success: false,
                error: {
                    errorMessage: "input null or undefined"
                }
            }
        }

        if(!Validator.validateAddress(address)){
            logger.warn(`Warn in validateInput unvalid, address: ${address}`);
            return {
                success: false,
                error: {
                    errorMessage: `Not a valid address`
                }
            }
        }

        if(!Validator.isPositiveInteger(id)){
            logger.warn(`Warn in validateInput unvalid, id: ${id}`);
            return {
                success: false,
                error: {
                    errorMessage: `Not a valid id`
                }
            }
        }

        if(!Validator.isPositiveInteger(page)){
            logger.warn(`Warn in validateInput unvalid, page: ${page}`);
            return {
                success: false,
                error: {
                    errorMessage: `Not a valid page`
                }
            }
        }

        if(Validator.validateInput(filter)){
            if(!Validator.validateName(filter)){
                logger.warn(`Warn in filter, filter: ${filter}`);

                return {
                    success: false,
                    error: {
                        errorMessage: `Not a valid filter`
                    }
                }
            }
        }

        return {
            success: true
        }
    }

    static removeAdValidation(req) {
        let address = req.locals.address;
        let id = req.body.id;
        
        if(!Validator.validateInput(address, id)){
            logger.warn(`Warn in validateInput (Input null or undefined)`);
            return {
                success: false,
                error: {
                    errorMessage: "input null or undefined"
                }
            }
        }

        if(!Validator.validateAddress(address)){
            logger.warn(`Warn in validateInput unvalid, address: ${address}`);
            return {
                success: false,
                error: {
                    errorMessage: `Not a valid address`
                }
            }
        }

        if(!Validator.isPositiveInteger(id)){
            logger.warn(`Warn in validateInput unvalid, id: ${id}`);
            return {
                success: false,
                error: {
                    errorMessage: `Not a valid id`
                }
            }
        }

        return {
            success: true
        }
    }

    static cancelAdValidation(req){
        let address = req.locals.address;
        let id = req.body.id;

        if(!Validator.validateInput(address,id)){
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address} , id: ${id}`);
            return {
                success: false,
                error: {
                    errorMessage: "address input null or undefined"
                }
            }
        }

        if(!Validator.validateAddress(address)){
            logger.warn(`Warn in validateInput unvalid, address: ${address}`);
            return {
                success: false,
                error: {
                    errorMessage: `Not a valid address`
                }
            }
        }

        if(!Validator.isNaturalInteger(id)){
            return {
                success: false,
                error: {
                    errorMessage: `id is not a natural integer`
                }
            }
        }

        return {
            success: true
        }

    }
}

module.exports = {MarketInventoryValidation}