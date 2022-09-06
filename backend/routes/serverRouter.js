const express = require('express');
const serverController = require('../controllers/serverController');
const authController = require('../controllers/authController');

const router = express.Router();

router.post("/getInfo", serverController.getInfo);

router.post("/getBrokenMarketplace", serverController.getBrokenMarketplace);


module.exports = router;