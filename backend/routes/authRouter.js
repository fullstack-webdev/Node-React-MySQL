const express = require('express');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

const router = express.Router();

router.post("/isLogged", authController.isLogged);

router.post("/getKeyClear", authController.getKeyClear);

router.post("/sendKeyHash", authController.sendKeyHash);

router.post("/clearCookies", authController.clearCookies)

router.post("/isSigned", userController.isSigned);

router.post("/signUp", userController.signUp);





// router.post("/checkAccountSigned", authController.login);


module.exports = router;