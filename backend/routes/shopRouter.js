const express = require('express');
const shopController = require('../controllers/shopController');
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

router.post("/buyShop", delegateMiddleware.isDelegatedShop)
router.post("/buyShop", shopController.buyShop);


router.use(delegateMiddleware.isDelegated)

router.post("/getShop", shopController.getShop);
router.post("/shopHistory", shopController.shopHistory);




module.exports = router;
