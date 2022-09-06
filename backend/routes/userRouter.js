const express = require('express');
const userController = require('../controllers/userController');
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
// router.use(authController.isLoggedMiddleware);

router.use(authController.checkAccountSigned);

router.post("/directTransfer", delegateMiddleware.isDelegatedTransfer);
router.post("/directTransfer", userController.directTransfer);

router.use(delegateMiddleware.isDelegated)

router.post("/getResources", userController.getInventory);
router.post("/getBuilders", userController.getBuilders);
router.post("/getAlerts", userController.getAlerts);

//FAKE ROUTER => LOG SUSPICIOUS CLICK
// router.post("/getResource", userController.suspectedClick); 



module.exports = router;