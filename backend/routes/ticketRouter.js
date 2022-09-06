const express = require('express');
const ticketController = require('../controllers/ticketController');
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

router.use(delegateMiddleware.isDelegated)

router.post("/getTickets", ticketController.getTickets);



module.exports = router;
