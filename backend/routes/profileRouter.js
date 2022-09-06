const express = require('express');
const profileController = require('../controllers/profileController');
const authController = require('../controllers/authController');
const profileMiddleware = require('../middlewares/profileMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');
const delegateMiddleware = require('../middlewares/delegateMiddleware');

const router = express.Router();

// router.use((req, res, next) => {
//     req.locals = {
//         address: "123" //req.cookies.address
//     }
//     next();
// });

if(!process.env.NODE_SVIL){
    router.post("/setProfile", authMiddleware.isLoggedProfileMiddleware);
}else{
    router.use((req, res, next) => {
        req.locals = {
            address: req.query.address
        }
        next();
    });
}

router.post("/setProfile", delegateMiddleware.isDelegatedProfile)

router.post("/setProfile", profileMiddleware.uploadImageMiddleware);

router.post("/setProfile", profileController.setProfile);



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

// router.use((req, res, next) => {
//     req.locals = {
//         address: req.body.address
//     }
//     next();
// });
router.use(delegateMiddleware.isDelegated)

router.post("/getProfile", profileController.getProfile);
router.post("/getEmblems", profileController.getEmblems);

router.post("/checkForAirdrop", profileController.checkForAirdrop);

router.post("/getBlessing", profileController.getBlessing);
router.post("/askForBlessing", profileController.askForBlessing);
router.post("/claimBlessing", profileController.claimBlessing);

module.exports = router;