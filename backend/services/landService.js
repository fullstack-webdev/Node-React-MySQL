const { add } = require('winston');
const logger = require('../logging/logger');
const {LandQueries} = require('../queries/landQueries');
const { NotificationQueries } = require('../queries/notificationsQueries');
const { Utils } = require("../utils/utils");
const {MAX_LEVELS} = require('../config/buildingLevel');
class LandService{
    static async buildOwnerResponse(landListRawData, owner){
        let landList = []
        let stakable = true;
        let tickets, response={}, stakedLand, contract, vouchers
        
        let unstakable={};

        for (let land of landListRawData) {
            if (land.stake == 1) {
                stakable = false;
                stakedLand = land.idLandInstance;
            }
            landList.push({
                id: land.idLandInstance,
                stake:land.stake,
                image: land.nftImage,
                name:land.name,
            })
        }

        //search the reason why a user can't unstake if there is one
        if(stakedLand!=null){
            logger.debug(`the staked land is : id ${stakedLand}`);
            try{
                contract = await LandQueries.getActiveContractGivenIdLandInstance(stakedLand)
            } catch ( error ) {
                logger.error(`Error in LandQueries.getActiveLandContractGivedIdLandInstance: ${Utils.printErrorLog(error)}`)
                throw error;
            }
            logger.debug(`contract response : ${JSON.stringify(contract)}`)
            try {
                tickets = await LandQueries.getTicketsNotOwned(stakedLand);
            } catch ( error ) {
                logger.error(`Error in LandQueries.getTicketsNotOwned: ${Utils.printErrorLog(error)}`)
                throw error;
            }
            logger.debug(`tickets response : ${JSON.stringify(tickets)}`)
            try {
                vouchers = await LandQueries.getCreatedContractVoucherCreation(owner);
            } catch ( error ) {
                logger.error(`Error in LandQueries.getCreatedContractVoucherCreation: ${Utils.printErrorLog(error)}`)
                throw error;
            }
            logger.debug(`vouchers response : ${JSON.stringify(vouchers)}`)
            if(vouchers.length != 0){
                unstakable.isUnstakable = false,
                unstakable.unstakableMessage = "There should be no contract voucher pending to unstake a Land, check in your contract section"
            }
            else if(contract.length == null || contract.length == 0){
                unstakable.isUnstakable = true,
                unstakable.unstake= stakedLand
            }else if(contract.length != 0){
                unstakable.isUnstakable = false,
                unstakable.unstakableMessage = "There should be no active contract to unstake a Land"
            }else if(tickets.length != 0){
                unstakable.isUnstakable = false,
                unstakable.unstakableMessage = "You should be the owner of all the tickets to delete an active contract so you can unstake a Land"
            }
            response.unstakable = unstakable; 
        }
        response.stakable = stakable
        response.landList = landList;

        return response;
    }

    
    static buildGuestsResponse(guestsRawData,address){
        let cities=[]

        for(let guest of guestsRawData){
            let home;
            if(guest.address == address) home= 1
            else home = 0
            cities.push({
                owner:guest.address,
                idGuest:guest.idGuest,
                name:guest.name,
                cityName:guest.cityName,
                cityImage:guest.image,
                imageEmblem:guest.imageEmblem,
                startingTime:guest.startingTime,
                isVisitable:guest.isVisitable,
                experience:guest.experience,
                position: guest.position,
                thLevel: guest.thLevel,
                home:home
            })
        }
        return cities;
    }
    static async buildGetLandOwnerResponse(guests,landInfo,owner){
        let response = {}, notificationInstance,  home = 0, notification = {}
        response.cities = guests;
        response.info = {};

        response.info.id = landInfo.idLandInstance
        response.info.mapImage = landInfo.image
        response.info.positions = JSON.parse(landInfo.positions)
        response.info.maxSpot = landInfo.maxSpot
        response.info.isPrivate = landInfo.isPrivate
        for(let guest of guests){
            if (guest.home) home=1    
        }
        response.info.home = home
        response.info.owned = owner
        
        if(owner){
            response.info.upgradeStatus = landInfo.upgradeStatus;
            response.info.upgradeEndingTime = landInfo.upgradeEndTime;

            // if(landInfo.idNotificationInstance != null ){
            //     try {
            //         notificationInstance = await NotificationQueries.getNotificationGivenIdNotificationInstance(landInfo.idNotificationInstance);
            //     } catch (error) {
            //         logger.error(`Error in NotificationQueries.getNotificationGivenIdNotificationInstance: ${Utils.printErrorLog(error)}`)
            //         throw error;
            //     }
            //     notificationInstance = notificationInstance[0];

            //     notification.idNotificationInstance = landInfo.idNotificationInstance
            //     notification.type = notificationInstance.type;
            //     notification.message = notificationInstance.message;
            //     response.info.notification = notification;
                
            // }
        }

        return response;
    }

    static async buildGetLandInfoOwnerResponse(landInfo,idLandInstance,address,owned){
        logger.debug(`service build response LandInfoOwner input : :landInfo:${JSON.stringify(landInfo)}, idLandInstance:${idLandInstance}, address:${address}, owned:${owned}`)
        let response = {},requirementsArray = [],upgradeInformation ={}
        let upgradeInfo = [], craftRequirements = []


        //city owner info 
        let ownerRaw 
        try {
            ownerRaw =  await LandQueries.getOwnerInfo(landInfo.address);
        } catch ( error ) {
            logger.error(`Error in LandQueries.getOwnerInfo: ${Utils.printErrorLog(error)}`)
            throw(error);
        }
    
        logger.debug(`getOwnerInfo response : ${JSON.stringify(ownerRaw)}`);

        if(ownerRaw.length!=1){
            throw('The owner of the land does not have an account')
        }

        ownerRaw = ownerRaw[0]

        let ownerInfo = {}
        ownerInfo.cityName = ownerRaw.cityName
        ownerInfo.cityImage = ownerRaw.image
        ownerInfo.imageEmblem = ownerRaw.imageEmblem
        ownerInfo.experience = ownerRaw.experience

        //get contract info
        let contractRaw 
        try {
            contractRaw =  await LandQueries.getActiveContractGivenIdLandInstance(idLandInstance);
        } catch ( error ) {
            logger.error(`Error in LandQueries.getActiveContractGivenIdLandInstance: ${Utils.printErrorLog(error)}`)
            throw(error);
        }
    
        logger.debug(`getActiveContractGivenIdLandInstance response : ${JSON.stringify(contractRaw)}`);
        let contractInfo = {}
        let ticketInfo = {}
        if(contractRaw.length!=0){
            contractRaw = contractRaw[0]
            contractInfo.fee = contractRaw.fee
            contractInfo.endingTime = contractRaw.endingTime
            contractInfo.creationTime = contractRaw.creationTime
            // get ticket info (ticket exist only if there is an active contract)

            let ticketRaw 
            try {
                ticketRaw =  await LandQueries.getAllTicketsOwner(contractRaw.idContract);
            } catch ( error ) {
                logger.error(`Error in LandQueries.getAllTicketsOwner: ${Utils.printErrorLog(error)}`)
                throw(error);
            }
            let ticketCounter = 0,ticketsFree = 0,ticketsPaid = 0

            for (let ticket of ticketRaw){
                ticketCounter++
                if(ticket.type == 'free') ticketsFree ++
                if(ticket.type == 'paid') ticketsPaid ++
            }

            ticketInfo.generatedTicketCount = ticketCounter
            ticketInfo.freeTicketCount = ticketsFree
            ticketInfo.paidTicketCount = ticketsPaid

        }




        if(owned){              
            try {
                upgradeInfo =  await LandQueries.getLandUpgradeInfo(idLandInstance,address);
            } catch ( error ) {
                logger.error(`Error in LandQueries.getLandGivenIdLandInstance: ${Utils.printErrorLog(error)}`)
                throw(error);
            }
        
            logger.debug(`getLandUpgradeInfo response : ${JSON.stringify(upgradeInfo)}`);
            
            for ( var i = 0 ; i < upgradeInfo.length ; ++ i ) {
                const row = upgradeInfo[i];
                craftRequirements.push(row);
            }
            logger.debug(`craftRequirements: ${JSON.stringify(craftRequirements)}`);
        }


        response.name = landInfo.name;
        response.landType = landInfo.type;
        response.rarity = landInfo.rarity;
        response.bonus = landInfo.bonus;
        response.maxSpot = landInfo.maxSpot;
        response.storage = landInfo.storage;
        response.isPrivate = landInfo.isPrivate;

        upgradeInformation.level = landInfo.level
        upgradeInformation.upgradeAllowed = (landInfo.level < MAX_LEVELS[landInfo.type])
        upgradeInformation.upgradeStatus = landInfo.upgradeStatus
        upgradeInformation.upgradeEndingTime = landInfo.upgradeEndTime

        if(owned){
            let isUpgradable = true

            for ( let requirement of craftRequirements ) {
                if ( requirement.idResourceRequirement != null ) {
                    if ( !(requirement.isAncienAllowed && requirement.isWoodAllowed && requirement.isStoneAllowed) ) {
                        isUpgradable = false
                    }
                    if ( requirement.requiredAncien != 0 ) {
                        requirementsArray.push({
                            name: 'ancien',
                            image: process.env.ANCIEN_IMAGE,
                            quantity: requirement.requiredAncien,
                            isAllowed: requirement.isAncienAllowed
                        })
                    }
                    if ( requirement.requiredWood != 0 ) {
                        requirementsArray.push({
                            name: 'wood',
                            image: process.env.WOOD_IMAGE,
                            quantity: requirement.requiredWood,
                            isAllowed: requirement.isWoodAllowed
                        })
                    }
                    if ( requirement.requiredStone != 0 ) {
                        requirementsArray.push({
                            name: 'stone',
                            image: process.env.STONE_IMAGE,
                            quantity: requirement.requiredStone,
                            isAllowed: requirement.isStoneAllowed
                        })
                    }else if ( requirement.idItemRequirement != null ) {
                        if ( !requirement.isItemAllowed ) {
                            isUpgradable = false
                        }
                        if ( requirement.requiredItemQuantity != 0 ) {
                            requirementsArray.push({
                                name: requirement.requiredItemName,
                                image: requirement.requiredItemImage,
                                quantity: requirement.requiredItemQuantity,
                                isAllowed: requirement.isItemAllowed
                            })
                        }
                    }
                }

                upgradeInformation.isUpgradable = isUpgradable;
                upgradeInformation.UpgradeCost = requirementsArray;
            }
        }

            response.upgradeInfo = upgradeInformation;
            response.contractInfo = contractInfo
            response.ticketInfo = ticketInfo
            response.ownerInfo = ownerInfo
            response.owned = owned
            

            return response;
        
    }
    static async allTicketsResponseBuilder(allTickets){
        let generatedTickets = [] 
        let sellingTickets = []
        let otherTickets = []
        let response = {};
        let saleInfo;
        for (let ticket of allTickets){
            logger.debug(`on ticket : ${JSON.stringify(ticket)}`);
            if(ticket.status == "generated"){
                generatedTickets.push({
                    idTicket:ticket.idTicket,
                    type:ticket.type,
                    status:ticket.status,
                    revoke: 0,
                    menu:{
                        view:ticket.view,
                        send:ticket.send,
                        sell:ticket.sell
                    }
                    
                })
            }else if(ticket.status == "onSale"){
                try {
                    saleInfo = await LandQueries.getTicketMarketplace(ticket.idTicket) 
                } catch (error) {
                  logger.error('error in LandQueries.getTicketMarketplace')  ;
                  throw(error);
                }
                if(saleInfo.length == 0){
                    throw new Error("The ticket is not really on sale into the marketplace")
                }
                logger.debug(`saleInfo : ${JSON.stringify(saleInfo)}`)
                saleInfo = saleInfo[0];
                sellingTickets.push({
                    idTicket:ticket.idTicket,
                    idTicketMarketplace:saleInfo.idTicketMarketplace,
                    type:ticket.type,
                    price:saleInfo.price,
                    endingTime:saleInfo.endingTime,
                    status:saleInfo.marketStatus,
                    revoke: 0,
                    menu:{
                        view:ticket.view,
                        send:ticket.send,
                        sell:ticket.sell
                    }
                })
            }else if(ticket.status == "sent" || ticket.status == "used" || ticket.status == "expired"){
                let rev = 0;

                if(ticket.status == "sent"){
                    let now = new Date().getTime();
                    let dbTime = new Date(ticket.statusTime).getTime();
                    let durationMilliSec = process.env.MIN_REVOKE_SEC * 1000;
                    let sum = dbTime + durationMilliSec;
                    
                    if(sum <= now){
                        rev = 1;
                    }
                }
                
                otherTickets.push({
                    idTicket:ticket.idTicket,
                    type:ticket.type,
                    status:ticket.status,
                    revoke: rev,
                    menu:{
                        view:ticket.view,
                        send:ticket.send,
                        sell:ticket.sell
                    }

                })
            }
        }
        logger.debug(`generated : ${JSON.stringify(generatedTickets)}, selling:${JSON.stringify(sellingTickets)}, other: ${JSON.stringify(otherTickets)}`)
        
        response.generatedTickets = generatedTickets;
        response.sellingTickets = sellingTickets;
        response.otherTickets = otherTickets;

        /* if(generatedTickets.length != 0)
            response.generatedTickets = generatedTickets;
        if(sellingTickets.length != 0)
            response.sellingTickets = sellingTickets;
        if(otherTickets.length != 0 )
            response.otherTickets = otherTickets; */

        return response;
    }

    static async checkUpgradeStatusLand(landInfo){
        logger.debug("checkUpgradeStatusLand start");
        
        if(landInfo.stake && landInfo.upgradeStatus){
            //Select on land_level table
            let awaitingLandLevel = LandQueries.getLandLevel(landInfo.idLand, landInfo.level + 1);

            let endingTime = new Date(landInfo.upgradeEndTime);
            let nowTime = new Date();

            let endingTimeSeconds = endingTime.getTime();
            let nowTimeSeconds = nowTime.getTime();

            //if upgrade is finished
            if(nowTimeSeconds >= endingTimeSeconds){
                
                //IF WE WANT TO ADD EXPERIENCE FROM THE LAND UPGRADE
                // let expUpgrade;
                
                // if(responseAccountData.type != 4 && startingTimeUpgrade > lastResetLeaderboard) {
                //     try{
                //         expUpgrade = await DropService.calculateExperienceAfterUpgrade(responseAccountData, responseUpgradeModel)
                //     }catch(error){
                //         logger.error(`Error in calculateExperienceAfterUpgrade:${Utils.printErrorLog(error)}`);
                //     }
                // }
                
                let landLevel;
                try {
                    landLevel = await awaitingLandLevel;
                } catch (error) {
                    logger.error(`Error in LandQueries getLandLevel:${Utils.printErrorLog(error)}`);
                }
                landLevel = landLevel[0];
                logger.debug(`LandQueries getLandLevel: ${JSON.stringify(landLevel)}`);

    
                // let createNotificationInstance;
                // try {
                //     createNotificationInstance = await LandQueries.createNotificationInstance(1, landInfo.address, false, "this is a description");
                // } catch (error) {
                //     logger.error(`Error in LandQueries setNotification:${Utils.printErrorLog(error)}`);
                // }
                //logger.debug(`LandQueries setNotification: ${JSON.stringify(createNotificationInstance)}`);


                // let getNotificationInstance;
                // try {
                //     getNotificationInstance = await LandQueries.getNotificationInstance(landInfo.address, false);
                // } catch (error) {
                //     logger.error(`Error in LandQueries getNotificationInstance:${Utils.printErrorLog(error)}`);
                // }
                // getNotificationInstance = getNotificationInstance[0];
                //logger.debug(`LandQueries getNotificationInstance: ${JSON.stringify(getNotificationInstance)}`);


                let resultUpdate;
                try {
                    resultUpdate = await LandQueries.updateLandFirstLogin(landInfo.idLandInstance, landLevel.idLandLevel);
                } catch (error) {
                    logger.error(`Error in updateFirstLogin:${Utils.printErrorLog(error)}`);
                }
                logger.debug(`LandQueries updateLandFirstLogin: ${JSON.stringify(resultUpdate)}`);

                landInfo.upgradeStatus = 0;
                landInfo.level = landLevel.level;
                landInfo.idLandLevel = landLevel.idLandLevel;
                landInfo.maxSpot = landLevel.maxSpot;
                landInfo.idUpgradeLand = landLevel.idUpgradeLand;
                landInfo.upgradeTime = landLevel.upgradeTime;
                
                //logger.debug(`landInfo Updated: ${JSON.stringify(landInfo)}`);
            }

        }
        logger.debug(`checkUpgradeStatusLand response: ${JSON.stringify(landInfo)}`);
        logger.debug("checkUpgradeStatusLand end");
        return landInfo;
    }

    static buildCreateListingResponse(listing){
        let response={}

        response.idTicket = listing.idTicket
        response.creationTime = listing.creationTime
        response.price = listing.price
        response.endingTime = listing.endingTime
        response.marketStatus = listing.marketStatus
        response.toShow = listing.toShow
        return response;
    }

    static async buildGetAllTicketsUserResponse(address,idWorld){
        let response=[]
        let allTickets

        try{
            allTickets = await LandQueries.getTicketsGivenAddress(address,idWorld);
        }catch(error){
            logger.error(`Error in LandQueries.getTicketsGivenAddress:${Utils.printErrorLog(error)}`);
            throw error
        }
    
        logger.debug(`response getTicketsGivenAddress : ${JSON.stringify(allTickets)} `);
        
        if(allTickets.length == 0){
            return response
        }
        for(let ticket of allTickets){
            if(ticket.contractStatus == undefined || ticket.contractStatus != 'active') continue
            response.push({
                id:ticket.idTicket,
                ticketType:ticket.ticketType,
                landType:ticket.landType,
                landName:ticket.name
            })
        }
        
        return response;
    }

    static buildGetTicketMarketplace(listings){
        let response = [];

        for(let i = 0; i < listings.length; i++){
            let listing = {};
            
            listing.idTicket = listings[i].idTicket
            listing.creationTime = listings[i].creationTime
            listing.price = listings[i].price
            listing.endingTime = listings[i].endingTime
            listing.marketStatus = listings[i].marketStatus
            listing.toShow = listings[i].toShow
            listing.isBuyable = listings[i].isBuyable
            response.push(listing)
        }
        return response;
    }

    static buildGetTicket(ownedTicket){
        let response = [];
        let ticket = {};
        let menu = {};
        let rev = 0;

        if(ownedTicket.status == "sent"){
            let now = new Date().getTime();
            let dbTime = new Date(ownedTicket.statusTime).getTime();
            let durationMilliSec = process.env.MIN_REVOKE_SEC * 1000;
            let sum = dbTime + durationMilliSec;
            
            if(sum <= now){
                rev = 1;
            }
        }
        ticket.idTicket = ownedTicket.idTicket;
        ticket.price = ownedTicket.price;
        ticket.endingTime = ownedTicket.endingTime;
        ticket.status = ownedTicket.status;
        ticket.revoke = rev;
        ticket.bonus = ownedTicket.bonus;
        ticket.fee = ownedTicket.fee;

        menu.view = ownedTicket.view;
        menu.send = ownedTicket.send;
        menu.sell = ownedTicket.sell;

        ticket.menu = menu;

        response.push(ticket);
        logger.debug(`ticket info : ${JSON.stringify(ticket)}`);

        return response;
    }

    static buildRevokeTicket(ownedTicket){
        let ticket = {};
        let menu = {};
        let rev = 0;

        if(ownedTicket.status == "sent"){
            let now = new Date().getTime();
            let dbTime = new Date(ownedTicket.statusTime).getTime();
            let durationMilliSec = process.env.MIN_REVOKE_SEC * 1000;
            let sum = dbTime + durationMilliSec;
            
            if(sum <= now){
                rev = 1;
            }
        }
        ticket.idTicket = ownedTicket.idTicket;
        ticket.type = ownedTicket.type;
        ticket.status = ownedTicket.status;
        ticket.revoke = rev;

        menu.view = ownedTicket.view;
        menu.send = ownedTicket.send;
        menu.sell = ownedTicket.sell;

        ticket.menu = menu;

        logger.debug(`ticket info : ${JSON.stringify(ticket)}`);

        return ticket;
    }

    static deleteContractTicketVerify(allTickets){
        for(let ticket of allTickets){
            if (ticket.status != 'generated' ){
                if(ticket.status != 'expired'){
                    return false
                }
            }
        }
        return true;
    }

    static async buildGetContractOwnerResponse(singleContract,address,idLandInstance){
        let response = {}
        let contract = {}

        response.deleteContract = true

        let landInfo
        try {
           landInfo = await LandQueries.getLandGivenIdLandInstance(idLandInstance) 
        } catch (error) {
            logger.error(`Error in getLandGivenIdLandInstance :${Utils.printErrorLog(error)}`)
            throw(error)
        }
        logger.debug(`landInfo:${JSON.stringify(landInfo)}`)

        landInfo= landInfo[0]



        if(singleContract.contractStatus == 'created' || singleContract.contractStatus == 'active'|| singleContract.contractStatus == 'pending'){
            response.created = true
        }else{
            response.created = false
        }
        if(singleContract.contractStatus=='active'||singleContract.contractStatus=='pending'){
            response.signed = true
        }else{//CASE created but not signed, must be returned the voucher to sign
            response.signed = false
            let voucher
            try {
                voucher = await LandQueries.getCreatedContractVoucherCreation(address);
            } catch (error) {
                logger.error(`Error in LandQueries getCreatedContractVoucherCreation:${Utils.printErrorLog(error)}`);
                return res
                .json({
                    success: false,
                    error: error
                });
            }
            logger.debug(`response getCreatedContractVoucherCreation: ${JSON.stringify(voucher)}`);

            if(voucher?.length > 0){
                voucher = voucher[0];

                response.voucherCreation = {
                    idContract: voucher.idContract,
                    owner: address,
                    blockNumber: voucher.blockNumber,
                    creation: voucher.creation,
                    expireTime: voucher.expireTime,
                    fee: voucher.fee,
                    signature: voucher.signature,
                    idLand: idLandInstance
                };

                response.deleteContract = false
                response.deleteMessage = 'You must sign the contract before deleting it'
            }

        }

        contract.id = singleContract.idContract
        contract.fee = singleContract.fee
        contract.isPrivate = singleContract.isPrivate
        contract.creationTime = singleContract.creationTime
        contract.endingTime = singleContract.endingTime
        contract.generatedTickets = singleContract.quantityGenerated
        contract.status = singleContract.contractStatus
        contract.maxTickets = landInfo.maxSpot

        if(contract.generatedTickets<landInfo.maxSpot){
            contract.createTickets = true
            contract.ticketsToGenerate = landInfo.maxSpot - contract.generatedTickets
        }else{
            contract.createTickets = false
            contract.ticketsToGenerate = 0
        }

        response.contract = contract

        let tickets
        try {
           tickets = await LandQueries.getAllTicketsOwner(singleContract.idContract) 
        } catch (error) {
            logger.error(`Error in LandQueries getAllTicketsOwner :${Utils.printErrorLog(error)}`)
            throw(error)
        }
        logger.debug(`getAllTicketsOwner response :${JSON.stringify(tickets)}`);
        if(tickets.length != 0 && tickets!= null){
            for (let ticket of tickets){
                if(ticket.status != 'generated' && ticket.status != 'expired'){
                    response.deleteContract = false
                    response.deleteMessage = 'You must own all the tickets'
                }
            }
        }

        let guests
        try {
            guests = await LandQueries.getLandGuests(landInfo.idLandInstance)
        } catch (error) {
            logger.error(`Error in LandQueries getLandGuests :${Utils.printErrorLog(error)}`)
            throw(error)
        }

        if(guests.length != 0){
            response.deleteContract = false
            response.deleteMessage = 'There must be no guests on your land'
        }

        



        return response




    }

    static cityResponseBuidler(guestCityRaw,guest,cityInfo,home){
        let response ={}
        let allbuildings=[]
        let info = {}

        for(let building of guestCityRaw){
            allbuildings.push({
                id:building.id,
                level:building.level,
                type:building.type,
                name:building.name,
                description:building.description,
                stake:building.stake,
                address:building.address,
                moreInfo:building.moreInfo,
                upgradeStatus:building.upgradeStatus,
                bundle:building.bundle,
                position:building.position,
                cursed:building.cursed,
                image:building.imageURL,
                imageSprite:building.imageSprite,
                upgradeImage:building.upgradeImage
            })
        }

        info.address = guest.address
        info.cityName = cityInfo.cityName
        info.cityImage  = cityInfo.cityImage
        info.imageEmblem = cityInfo.imageEmblem
        info.experience = cityInfo.experience
        info.startingTime=guest.startingTime
        info.position = guest.position
        info.isVisitable = guest.isVisitable
        info.home=home


        response.buildings = allbuildings
        response.info = info

        

        return response



    }
    static isPositionUsed(guests, position){
        for(let guest of guests){
            if(guest.position == position) return true;
        }
        return false;
    }
    

}


module.exports = {LandService}