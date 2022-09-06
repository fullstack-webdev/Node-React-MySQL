const logger = require("../logging/logger");
const Validator = require("../utils/validator");

class LandValidation{
    static getContractStatusValidation(req) {
        let address = req.locals.address;
        let idContract = req.body.idContract;

        if(!Validator.validateInput(address, idContract)){
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}, idContract: ${idContract}`);
            return {
                success: false,
                error: {
                    errorMessage: "Invalid input null or undefined"
                }
            }
        }

        if(!Validator.validateAddress(address)){
            logger.warn(`Warn in validateInput invalid, address: ${address}`);
            return {
                success: false,
                error: {
                    errorMessage: `Not a valid address`
                }
            }
        }

        if(!Validator.isPositiveInteger(idContract)){
            logger.warn(`Warn in validateInput invalid, idContract: ${idContract}`);
            return {
                success: false,
                error: {
                    errorMessage: `Not a valid idContract`
                }
            }
        }

        return {
            success: true
        }
    }
    static setLandNameValidation(req) {
        let address = req.locals.address;
        let idLandInstance = req.body.idLandInstance;
        let landName = req.body.landName;

        if(!Validator.validateInput(address, idLandInstance, landName)){
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}, idLandInstance: ${idLandInstance}, landName: ${landName}`);
            return {
                success: false,
                error: {
                    errorMessage: "Invalid input null or undefined"
                }
            }
        }

        if(!Validator.validateAddress(address)){
            logger.warn(`Warn in validateInput invalid, address: ${address}`);
            return {
                success: false,
                error: {
                    errorMessage: `Not a valid address`
                }
            }
        }

        if(!Validator.isPositiveInteger(idLandInstance)){
            logger.warn(`Warn in validateInput invalid, idLandInstance: ${idLandInstance}`);
            return {
                success: false,
                error: {
                    errorMessage: `Not a valid idLandInstance`
                }
            }
        }
        
        return {
            success: true
        }
    }
    static setIsVisitableValidation(req) {
        let address = req.locals.address;
        let idGuest = req.body.idGuest;
        let isVisitable = req.body.isVisitable;

        if(!Validator.validateInput(address, idGuest, isVisitable)){
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}, idGuest: ${idGuest}, isVistable: ${isVisitable}`);
            return {
                success: false,
                error: {
                    errorMessage: "Invalid input null or undefined"
                }
            }
        }

        if(!Validator.validateAddress(address)){
            logger.warn(`Warn in validateInput invalid, address: ${address}`);
            return {
                success: false,
                error: {
                    errorMessage: `Not a valid address`
                }
            }
        }

        if(!Validator.isPositiveInteger(idGuest)){
            logger.warn(`Warn in validateInput invalid, idGuest: ${idGuest}`);
            return {
                success: false,
                error: {
                    errorMessage: `Not a valid idGuest`
                }
            }
        }

        if(!Validator.isBool(isVisitable)){
            logger.warn(`Warn in validateInput invalid, isVisitable: ${isVisitable}`);
            return {
                success: false,
                error: {
                    errorMessage: `Not a valid isVisitable`
                }
            }
        }

        return {
            success: true
        }
    }
    static isStakeValidation(req) {
        let address = req.locals.address;
        let nftId = req.body.id;            //it works with "id" in payload, NOT "nftId"
        let newStatus = req.body.newStatus;

        if(!Validator.validateInput(address, nftId, newStatus)){
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}, nftId: ${nftId}, newStatus: ${newStatus}`);
            return {
                success: false,
                error: {
                    errorMessage: "Invalid input null or undefined"
                }
            }
        }

        if(!Validator.validateAddress(address)){
            logger.warn(`Warn in validateInput invalid, address: ${address}`);
            return {
                success: false,
                error: {
                    errorMessage: `Not a valid address`
                }
            }
        }

        if(!Validator.ValidateNftId(nftId)){
            return {
                success: false,
                error: {
                    errorMessage: `Not a valid id`
                }
            }
        }

        if(!Validator.ValidateStatus(newStatus)){
            return {
                success: false,
                error: {
                    errorMessage: `Not a valid status`
                }
            }
        }

        return {
            success: true
        }
    }
    static getAllLandsValidation(req){
        let address = req.locals.address;

        if(!Validator.validateInput(address)){
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}`);
            return {
                success: false,
                error: {
                    errorMessage: "address input null or undefined"
                }
            }
        }

        if(!Validator.validateAddress(address)){
            logger.warn(`Warn in validateInput invalid, address: ${address}`);
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
    static getHomeLandValidation(req) {
        let address = req.locals.address;

        if(!Validator.validateInput(address)){
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}`);
            return {
                success: false,
                error: {
                    errorMessage: "address input null or undefined"
                }
            }
        }

        if(!Validator.validateAddress(address)){
            logger.warn(`Warn in validateInput invalid, address: ${address}`);
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
    static getHomeWorldValidation(req) {
        let address = req.locals.address;

        if(!Validator.validateInput(address)){
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}`);
            return {
                success: false,
                error: {
                    errorMessage: "address input null or undefined"
                }
            }
        }

        if(!Validator.validateAddress(address)){
            logger.warn(`Warn in validateInput invalid, address: ${address}`);
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
    static getWorldValidation(req){
        let address = req.locals.address;
        let idWorld = req.body.idWorld;


        if(!Validator.validateInput(address, idWorld)){
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}, idWorld: ${idWorld}`);
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

        if(!Validator.isPositiveInteger(idWorld)){
            logger.warn(`Warn in validateInput unvalid, idWorld: ${idWorld}`);
            return {
                success: false,
                error: {
                    errorMessage: `Not a valid idWorld`
                }
            }
        }
        

        return {
            success: true
        }
    }

    static getLandOwnerValidation(req){
        let address = req.locals.address;
        let idLandInstance = req.body.idLandInstance;

        if(!Validator.validateInput(address, idLandInstance)){
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}, idLandInstance: ${idLandInstance}`);
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

        if(!Validator.isNaturalInteger(idLandInstance)){
            logger.warn(`Warn in validateInput unvalid, idLandInstance: ${idLandInstance}`);
            return {
                success: false,
                error: {
                    errorMessage: `Not a valid idLandInstance`
                }
            }
        }
        

        return {
            success: true
        }
    }

    static upgradeDoneValidation(req){
        let address = req.locals.address;
        let idLandInstance = req.body.idLandInstance;
        let idNotificationInstance = req.body.idNotificationInstance;

        if(!Validator.validateInput(address, idLandInstance,idNotificationInstance)){
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}, idLandInstance: ${idLandInstance}, idNotificationInstance: ${idNotificationInstance}`);
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

        if(!Validator.isNaturalInteger(idLandInstance)){
            logger.warn(`Warn in validateInput unvalid, idLandInstance: ${idLandInstance}`);
            return {
                success: false,
                error: {
                    errorMessage: `Not a valid idLandInstance`
                }
            }
        }

        if(!Validator.isPositiveInteger(idNotificationInstance)){
            logger.warn(`Warn in validateInput unvalid, idNotificationInstance: ${idNotificationInstance}`);
            return {
                success: false,
                error: {
                    errorMessage: `Not a valid idNotificationInstance`
                }
            }
        }
        

        return {
            success: true
        }
    }

    static getLandInfoOwnerValidation(req){
        let address = req.locals.address;
        let idLandInstance = req.body.idLandInstance;


        if(!Validator.validateInput(address, idLandInstance)){
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}, idLandInstance: ${idLandInstance}`);
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

        if(!Validator.isNaturalInteger(idLandInstance)){
            logger.warn(`Warn in validateInput unvalid, idWorld: ${idLandInstance}`);
            return {
                success: false,
                error: {
                    errorMessage: `Not a valid idLandInstance`
                }
            }
        }
        

        return {
            success: true
        }
    }

    static upgradeLandValidation(req){
        let address = req.locals.address;
        let idLandInstance = req.body.idLandInstance;

        let consumableIds = req.body.consumableIds;


        if(!Validator.validateInput(address, idLandInstance,)){
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}, idLandInstance: ${idLandInstance}, `);
            return {
                success: false,
                error: {
                    errorMessage: "address input null or undefined"
                }
            }
        }

        if( Validator.validateInput(consumableIds)){
            if(!Array.isArray(consumableIds)){
                return {
                    success: false,
                    error: {
                        errorMessage: `Not a valid array consumableIds`
                    }
                }
            }
            for(let i = 0; i < consumableIds.length; i++ ){
                if(!Validator.isPositiveInteger(consumableIds[i])){
                    return {
                        success: false,
                        error: {
                            errorMessage: `Not a valid consumableId`
                        }
                    }
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

        if(!Validator.isNaturalInteger(idLandInstance)){
            logger.warn(`Warn in validateInput unvalid, idWorld: ${idLandInstance}`);
            return {
                success: false,
                error: {
                    errorMessage: `Not a valid idLandInstance`
                }
            }
        }


        

        return {
            success: true
        }
    }

    static getTicketsOwnerValidation(req){
        let address = req.locals.address;
        let idLandInstance = req.body.idLandInstance;


        if(!Validator.validateInput(address, idLandInstance)){
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}, idLandInstance: ${idLandInstance}`);
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

        if(!Validator.isNaturalInteger(idLandInstance)){
            logger.warn(`Warn in validateInput unvalid, idWorld: ${idLandInstance}`);
            return {
                success: false,
                error: {
                    errorMessage: `Not a valid idLandInstance`
                }
            }
        }
        

        return {
            success: true
        }
    }

    static createTicketsValidation(req){
        let address = req.locals.address;
        let idLandInstance = req.body.idLandInstance;
        let idContract = req.body.idContract;
        let quantity = req.body.quantity;
        let type = req.body.type;




        if(!Validator.validateInput(address, idLandInstance,idContract,quantity,type)){
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}, idLandInstance: ${idLandInstance}, quantity ${quantity}, type:${type}, idContract : ${idContract}`);
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

        if(!Validator.isNaturalInteger(idLandInstance)){
            logger.warn(`Warn in validateInput unvalid, idLandInstance: ${idLandInstance}`);
            return {
                success: false,
                error: {
                    errorMessage: `Not a valid idLandInstance`
                }
            }
        }

        if(!Validator.isPositiveInteger(idContract)){
            logger.warn(`Warn in validateInput unvalid, idContract: ${idContract}`);
            return {
                success: false,
                error: {
                    errorMessage: `Not a valid idContract`
                }
            }
        }

        if(!Validator.isPositiveInteger(quantity)){
            logger.warn(`Warn in validateInput unvalid, quantity: ${quantity}`);
            return {
                success: false,
                error: {
                    errorMessage: `Not a valid quantity`
                }
            }
        }

        if(!Validator.ValidateTicketType(type)){
            logger.warn(`Warn in validateInput unvalid, type: ${type}`);
            return {
                success: false,
                error: {
                    errorMessage: `Not a valid type`
                }
            }
        }
        

        return {
            success: true
        }
    }

    static removeListingTicketValidation(req){
        let address = req.locals.address;
        let idTicket = req.body.idTicket;
        let idTicketMarketplace = req.body.idTicketMarketplace;


        if(!Validator.validateInput(address, idTicket, idTicketMarketplace)){
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}, idTicket: ${idTicket}, idTicketMarketplace: ${idTicketMarketplace}`);
            return {
                success: false,
                error: {
                    errorMessage: "address, idTicket or idTicketMarketplace input null or undefined"
                }
            }
        }

        if(!Validator.validateAddress(address)){
            logger.warn(`Warn in validateAddress unvalid, address: ${address}`);
            return {
                success: false,
                error: {
                    errorMessage: `Not a valid address`
                }
            }
        }

        if(!Validator.isPositiveInteger(idTicket)){
            logger.warn(`Warn in isPositiveInteger unvalid, idTicket: ${idTicket}`);
            return {
                success: false,
                error: {
                    errorMessage: `idTicket is not a positive Integer`
                }
            }
        }

        if(!Validator.isPositiveInteger(idTicketMarketplace)){
            logger.warn(`Warn in isPositiveInteger unvalid, idTicketMarketplace: ${idTicketMarketplace}`);
            return {
                success: false,
                error: {
                    errorMessage: `idTicketMarketplace is not a positive Integer`
                }
            }
        }
        
        return {
            success: true
        }
    }

    static createTicketListingValidation(req){
        let address = req.locals.address;
        let idTicket = req.body.idTicket;
        let price = req.body.price;




        if(!Validator.validateInput(address, idTicket, price)){
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}, idTicket: ${idTicket}, price:${price}`);
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

        if(!Validator.isPositiveInteger(idTicket)){
            logger.warn(`Warn in validateInput unvalid, idTicket: ${idTicket}`);
            return {
                success: false,
                error: {
                    errorMessage: `Not a valid idTicket`
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


        return {
            success: true
        }
    }

    static createContractValidation(req){
        let address = req.locals.address;
        let idLandInstance = req.body.idLandInstance;
        let duration = req.body.duration;
        let fee = req.body.fee;
        let isPrivate = req.body.isPrivate;

        if(!Validator.validateInput(address, idLandInstance,duration,fee)){
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}, idLandInstance: ${idLandInstance}, duration:${duration}, fee:${fee}`);
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

        if(!Validator.isNaturalInteger(idLandInstance)){
            logger.warn(`Warn in validateInput unvalid, idLandInstance: ${idLandInstance}`);
            return {
                success: false,
                error: {
                    errorMessage: `Not a valid idLandInstance`
                }
            }
        }

        if(!Validator.isPositiveInteger(duration) || duration < 3600  || duration > process.env.MAX_LISTING_TIME){
            logger.warn(`Warn in validateInput unvalid, duration: ${duration}`);
            return {
                success: false,
                error: {
                    errorMessage: `Not a valid duration`

                }
            }
        }

        if(!Validator.isNaturalInteger(fee) || fee > 100 ){
            logger.warn(`Warn in validateInput unvalid, fee: ${fee}`);
            return {
                success: false,
                error: {
                    errorMessage: `Not a valid fee`

                }
            }
        }

        if(!Validator.ValidateStatus(isPrivate)){
            logger.warn(`Warn in validateInput unvalid, isPrivate: ${isPrivate}`);
            return {
                success: false,
                error: {
                    errorMessage: `Not a valid isPrivate`
                }
            }
        }

        
        return {
            success: true
        }
    }

    static deleteContractValidation(req){
        let address = req.locals.address;
        let idLandInstance = req.body.idLandInstance;
        let idContract = req.body.idContract;




        if(!Validator.validateInput(address, idLandInstance,idContract)){
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}, idLandInstance: ${idLandInstance}, idContract:${idContract}`);
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

        if(!Validator.isNaturalInteger(idLandInstance)){
            logger.warn(`Warn in validateInput unvalid, idLandInstance: ${idLandInstance}`);
            return {
                success: false,
                error: {
                    errorMessage: `Not a valid idLandInstance`
                }
            }
        }

        if(!Validator.isPositiveInteger(idContract)){
            logger.warn(`Warn in validateInput unvalid, idContract: ${idContract}`);
            return {
                success: false,
                error: {
                    errorMessage: `Not a valid idContract`
                }
            }
        }

        
        return {
            success: true
        }
    }

    static buyTicketMarketplaceValidation(req){
        let address = req.locals.address;
        let idTicket = req.body.idTicket;

        if(!Validator.validateInput(address, idTicket)){
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}, idTicket: ${idTicket}`);
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

        if(!Validator.isPositiveInteger(idTicket)){
            logger.warn(`Warn in validateInput unvalid, idTicket: ${idTicket}`);
            return {
                success: false,
                error: {
                    errorMessage: `Not a valid idTicket`
                }
            }
        }

        return {
            success: true
        }
    }

    static getTicketMarketplaceValidation(req){
        let address = req.locals.address;
        let idLandInstance = req.body.idLandInstance;

        if(!Validator.validateInput(address, idLandInstance)){
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}, idLandInstance: ${idLandInstance}`);
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

        if(!Validator.isNaturalInteger(idLandInstance)){
            logger.warn(`Warn in validateInput unvalid, idLandInstance: ${idLandInstance}`);
            return {
                success: false,
                error: {
                    errorMessage: `Not a valid idLandInstance`
                }
            }
        }

        return {
            success: true
        }
    }

    static getLandGuestValidation(req){
        let address = req.locals.address;
        let idLandInstance = req.body.idLandInstance;

        if(!Validator.validateInput(address, idLandInstance)){
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}, idLandInstance: ${idLandInstance}`);
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

        if(!Validator.isNaturalInteger(idLandInstance)){
            logger.warn(`Warn in validateInput unvalid, idLandInstance: ${idLandInstance}`);
            return {
                success: false,
                error: {
                    errorMessage: `Not a valid idLandInstance`
                }
            }
        }

        return {
            success: true
        }
    }

    static guestCheckValidation(req){
        let address = req.locals.address;

        if(!Validator.validateInput(address)){
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}`);
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

        return {
            success: true
        }
    }

    static getInstanceTicketValidation(req){
        let address = req.locals.address;
        let idTicket = req.body.idTicket;

        if(!Validator.validateInput(address, idTicket)){
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}, idTicket: ${idTicket}`);
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

        if(!Validator.isPositiveInteger(idTicket)){
            logger.warn(`Warn in validateInput unvalid, idTicket: ${idTicket}`);
            return {
                success: false,
                error: {
                    errorMessage: `Not a valid idTicket`
                }
            }
        }

        return {
            success: true
        }
    }

    static subscribeTicketValidation(req){
        let address = req.locals.address;
        let idTicket = req.body.idTicket;
        let isVisitable = req.body.isVisitable;

        if(!Validator.validateInput(address, idTicket, isVisitable)){
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}, idTicket: ${idTicket}, isVisitable: ${isVisitable}`);
            return {
                success: false,
                error: {
                    errorMessage: "address, idTicket, isVisitable input null or undefined"
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

        if(!Validator.isPositiveInteger(idTicket)){
            logger.warn(`Warn in validateInput unvalid, idTicket: ${idTicket}`);
            return {
                success: false,
                error: {
                    errorMessage: `Not a valid idTicket`
                }
            }
        }

        if(!Validator.isBool(isVisitable)){
            logger.warn(`Warn in validateInput unvalid, isVisitable: ${isVisitable}`);
            return {
                success: false,
                error: {
                    errorMessage: `Not a valid isVisitable`
                }
            }
        }

        return {
            success: true
        }
    }

    static unsubscribeTicketValidation(req){
        let address = req.locals.address;
        let idTicket = req.body.idTicket;

        if(!Validator.validateInput(address, idTicket)){
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}, idTicket: ${idTicket}`);
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

        if(!Validator.isPositiveInteger(idTicket)){
            logger.warn(`Warn in validateInput unvalid, idTicket: ${idTicket}`);
            return {
                success: false,
                error: {
                    errorMessage: `Not a valid idTicket`
                }
            }
        }

        return {
            success: true
        }
    }

    static getContractOwnerValidation(req){
        let address = req.locals.address;
        let idLandInstance = req.body.idLandInstance;

        if(!Validator.validateInput(address, idLandInstance)){
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}, idLandInstance: ${idLandInstance}`);
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

        if(!Validator.isNaturalInteger(idLandInstance)){
            logger.warn(`Warn in validateInput unvalid, idLandInstance: ${idLandInstance}`);
            return {
                success: false,
                error: {
                    errorMessage: `Not a valid idLandInstance`
                }
            }
        }

        return {
            success: true
        }
    }

    static getAccountCityValidation(req){
        let address = req.locals.address;
        let idGuest = req.body.idGuest;

        if(!Validator.validateInput(address, idGuest)){
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}, idGuest: ${idGuest}`);
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

        if(!Validator.isPositiveInteger(idGuest)){
            logger.warn(`Warn in validateInput unvalid, idGuest: ${idGuest}`);
            return {
                success: false,
                error: {
                    errorMessage: `Not a valid idGuest`
                }
            }
        }

        return {
            success: true
        }
    }

    static sendTicketValidation(req){
        let addressSender =  req.locals.address;
        let addressReceiver = req.body.receiver;
        let idTicket = req.body.idTicket;

        if(!Validator.validateInput(addressSender, addressReceiver, idTicket)){
            logger.warn(`Warn in validateInput (Input null or undefined), addressSender: ${addressSender}, addressReceiver: ${addressReceiver}, idTicket: ${idTicket}`);
            return {
                success: false,
                error: {
                    errorMessage: "address input null or undefined"
                }
            }
        }

        if(!Validator.validateAddress(addressSender)){
            logger.warn(`Warn in validateInput unvalid, address: ${addressSender}`);

            return {
                success: false,
                error: {
                    errorMessage: `Not a valid addressSender`
                }
            }
        }

        if(!Validator.validateAddress(addressReceiver)){
            logger.warn(`Warn in validateInput unvalid, address: ${addressReceiver}`);

            return {
                success: false,
                error: {
                    errorMessage: `Not a valid addressReceiver`
                }
            }
        }

        if(!Validator.isPositiveInteger(idTicket)){
            logger.warn(`Warn in validateInput unvalid, idTicket: ${idTicket}`);
            return {
                success: false,
                error: {
                    errorMessage: `Not a valid idTicket`
                }
            }
        }

        return {
            success: true
        }
    }

    static deleteTicketValidation(req){
        let address =  req.locals.address;
        let idTicket = req.body.idTicket;

        if(!Validator.validateInput(address, idTicket)){
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}, idTicket: ${idTicket}`);
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

        if(!Validator.isPositiveInteger(idTicket)){
            logger.warn(`Warn in validateInput unvalid, idTicket: ${idTicket}`);
            return {
                success: false,
                error: {
                    errorMessage: `Not a valid idTicket`
                }
            }
        }

        return {
            success: true
        }
    }

    static revokeTicketValidation(req){
        let address =  req.locals.address;
        let idTicket = req.body.idTicket;

        if(!Validator.validateInput(address, idTicket)){
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}, idTicket: ${idTicket}`);
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

        if(!Validator.isPositiveInteger(idTicket)){
            logger.warn(`Warn in validateInput unvalid, idTicket: ${idTicket}`);
            return {
                success: false,
                error: {
                    errorMessage: `Not a valid idTicket`
                }
            }
        }

        return {
            success: true
        }
    }

    static claimStorageOwnerValidation(req){
        let address = req.locals.address;
        let idLandInstance = req.body.idLandInstance;

        if(!Validator.validateInput(address, idLandInstance)){
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}, idLandInstance: ${idLandInstance}`);
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

        if(!Validator.isNaturalInteger(idLandInstance)){
            logger.warn(`Warn in validateInput unvalid, idLandInstance: ${idLandInstance}`);
            return {
                success: false,
                error: {
                    errorMessage: `Not a valid idLandInstance`
                }
            }
        }

        return {
            success: true
        }
    }
}


module.exports = {LandValidation}