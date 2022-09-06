const express = require('express');
const authController = require('../controllers/authController');

const bonusController = require('../controllers/bonusController');

const router = express.Router();

if (!process.env.NODE_SVIL) {
    router.use(authController.isLoggedMiddleware);
} else {
    router.use((req, res, next) => {
        req.locals = {
            address: req.body.address
        }
        next();
    });
}

router.use(authController.checkAccountSigned);

router.post("/getEnchantingTable", bonusController.getEnchantingTable);
router.post("/elevateBonus", bonusController.elevateBonus);
router.post("/enchantTool", bonusController.enchantTool);
router.post("/rerollBonus", bonusController.rerollBonus);

module.exports = router;