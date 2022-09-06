const express = require('express');
const marketInventoryController = require('../controllers/marketInventoryController');
const authController = require('../controllers/authController');
const delegateMiddleware = require('../middlewares/delegateMiddleware');

const router = express.Router();

//SE non funziona elimina questo pezzo e decommenta

if (!process.env.NODE_SVIL) {
    router.use(authController.isLoggedMiddleware);
} else {
    router.use((req, res, next) => {
        console.log(req.body)
        req.locals = {
            address: req.body.address
        }
        next();
    });
}

router.post("/getCheapestInventories", marketInventoryController.getCheapestInventories);
router.post("/getTotalListing", marketInventoryController.getTotalListing);


router.post("/getAllListing", delegateMiddleware.isDelegated);
router.post("/getAllListing", marketInventoryController.getAllListing);

router.post("/getAccountListing", delegateMiddleware.isDelegated);
router.post("/getAccountListing", marketInventoryController.getAccountListing);

router.post("/getPersonalHistory", delegateMiddleware.isDelegated);
router.post("/getPersonalHistory", marketInventoryController.getPersonalHistory);

router.use(delegateMiddleware.isDelegatedMarketplace)
router.post("/createAd", marketInventoryController.createAd);
router.post("/buy", marketInventoryController.buyAd);
router.post("/cancelAd", marketInventoryController.cancelAd);
router.post("/removeAd", marketInventoryController.removeAd);

router.post("/buyResourceAndInventory", marketInventoryController.buyResourceAndInventory);


module.exports = router;