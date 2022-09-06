const express = require('express');
const marketController = require('../controllers/marketController');
const authController = require('../controllers/authController');
const delegateMiddleware = require('../middlewares/delegateMiddleware');

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

router.use(authController.checkAccountSigned);

// router.use((req, res, next) => {
//     req.locals = {
//         address: req.body.address
//     }
//     next();
// });



//Marketplace listings

router.post("/getAccountListing", delegateMiddleware.isDelegated);
router.post("/getAccountListing", marketController.getAccountListing);

router.post("/getAllListing", delegateMiddleware.isDelegated);
router.post("/getAllListing", marketController.getAllListing);

router.post("/getPersonalHistory", delegateMiddleware.isDelegated);
router.post("/getPersonalHistory", marketController.getPersonalHistory);


router.use(delegateMiddleware.isDelegatedMarketplace)

router.post("/createAd", marketController.createAd);
router.post("/cancelAd", marketController.cancelAd);
router.post("/removeAd", marketController.removeAd);


router.post("/buy", marketController.buyAd);

// router.post("/multipleTest", marketController.multipleTest);

module.exports = router;
