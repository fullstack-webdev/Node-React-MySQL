const express = require('express');
const contractsController = require('../controllers/contractsController');
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.post("/isWhitelisted", contractsController.isWhitelisted);
router.post("/createLandVoucher", contractsController.createLandVoucher);
// router.post("/testIsOpen", contractsController.testIsOpen);
// router.post("/test", contractsController.fixLeader);


//SE non funziona elimina questo pezzo e decommenta


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
// router.use(authMiddleware.isDelegatedMiddleware);




router.post("/createVoucher", contractsController.createVoucher);

router.post("/getVouchers", contractsController.getVouchers);


module.exports = router;