const express = require('express');
const marketInventoryController = require('../controllers/marketInventoryController');
const authController = require('../controllers/authController');

const Sanitizer = require('../utils/sanitizer');
let sanitizer = new Sanitizer();

const loggerTrap = require("../logging/loggerTrap");

const router = express.Router();

//SE non funziona elimina questo pezzo e decommenta

const messageToPirate = (req, res) => {
    
    let error = {};
    error.address = req.locals.address;
    error.ip = sanitizer.getIpAddress(req);
    error.timestamp = new Date().toISOString();
    error.warning = `We are happy that you are forcing the APIs, remember that we have bug bounties if you find something.
    But also remember that we are logging everything.
    Unauthorized access is illegal.`

    loggerTrap.error(`Hacking Attempt: ${Utils.printErrorLog(error)}`)

    return res
    .status(401)
    .json({
        success: false,
        error: error
    });
}

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

router.post("/getAllListing", messageToPirate);
router.post("/getPersonalHistory", messageToPirate);
router.post("/createAd", messageToPirate);
router.post("/buy", messageToPirate);
router.post("/cancelAd", messageToPirate);
router.post("/removeAd", messageToPirate);
router.post("/getAccountListing", messageToPirate);

module.exports = router;