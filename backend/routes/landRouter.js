const express = require('express');
const authController = require('../controllers/authController');

const landsController = require('../controllers/landController');

const router = express.Router();

if(!process.env.NODE_SVIL){
    router.use(authController.isLoggedMiddleware);
}else{
    router.use((req, res, next) => {
        req.locals = {
            address: req.body.address
        }
        next();
    });
}

// API for stake state
router.post("/isStake", landsController.isStake);
router.post("/getContractStatus", landsController.getContractStatus);

// default check if the user has Land or Land-NFT
router.post("/guestCheck", landsController.guestCheck);

// Cross over the World/Land/City
router.post("/getUniverse", landsController.getUniverse);
router.post("/getWorld", landsController.getWorld);
router.post("/getHomeWorld", landsController.getHomeWorld);
router.post("/getLand", landsController.getLand);
router.post("/getHomeLand", landsController.getHomeLand);
router.post("/getCity", landsController.getCity);

// Crown
router.post("/getAllLands", landsController.getAllLands);

// General API for ticket
router.post("/getInstanceTicket", landsController.getInstanceTicket);

// TicketMarketplace for Land Guest
router.post("/getTicketMarketplace", landsController.getTicketMarketplace);
router.post("/buyTicketMarketplace", landsController.buyTicketMarketplace);
router.post("/subscribeTicket", landsController.subscribeTicket);
router.post("/unsubscribeTicket", landsController.unsubscribeTicket);

// Contract for Land Owner
router.post("/getContractOwner", landsController.getContractOwner);
router.post("/createContract", landsController.createContract);
router.post("/deleteContract", landsController.deleteContract);
router.post("/createTickets", landsController.createTickets);

// Ticket for Land Owner
router.post("/getTicketsOwner", landsController.getTicketsOwner);
router.post("/deleteTicket", landsController.deleteTicket);
router.post("/revokeTicket", landsController.revokeTicket);
router.post("/createListingTicket", landsController.createListingTicket);
router.post("/removeListingTicket", landsController.removeListingTicket);
router.post("/sendTicket", landsController.sendTicket);

// AllTicket for all Users in the world
router.post("/getAllTicketsUser", landsController.getAllTicketsUser);

// Land Info for all Users
router.post("/getLandInfo", landsController.getLandInfo);
router.post("/setLandName", landsController.setLandName);
router.post("/claimStorageOwner", landsController.claimStorageOwner);
router.post("/upgradeLand", landsController.upgradeLand);

// unused
router.post("/getLandGuest", landsController.getLandGuest);

router.post("/setIsVisitable", landsController.setIsVisitable);
router.post("/getBannerLand", landsController.getBannerLand);

module.exports = router;