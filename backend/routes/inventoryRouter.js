const express = require('express');
const InventoryController = require('../controllers/inventoryController');
const authController = require('../controllers/authController');
const { route } = require('./authRouter');
const Sanitizer = require('../utils/sanitizer');
let sanitizer = new Sanitizer();
const loggerTrap = require("../logging/loggerTrap");

const delegateMiddleware = require('../middlewares/delegateMiddleware');

const router = express.Router();

const messageToPirate = (req, res) => {
    
    let error = {};
    error.address = req.locals.address;
    error.ip = sanitizer.getIpAddress(req);
    error.timestamp = new Date().toISOString();
    error.warning = `We are happy that you are forcing the APIs, remember that we have bug bounties if you find something.
    But also remember that we are logging everything.
    Unauthorized access is illegal.`

    loggerTrap.error(`Hacking Attempt: ${Utils.printErrorLog(error)}`)

    return res
    .status(401)
    .json({
        success: false,
        error: error
    });
}
    
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

router.post("/getRecipeNPC", InventoryController.getRecipeNPC);
router.post("/getRecipeGem", InventoryController.getRecipeGem);
router.post("/getBundleGem", InventoryController.getBundleGem);

router.post("/getRecipeNPCInstance", delegateMiddleware.isDelegated);
router.post("/getRecipeNPCInstance", InventoryController.getRecipeNPCInstance);
router.post("/getRecipeGemInstance", delegateMiddleware.isDelegated);
router.post("/getRecipeGemInstance", InventoryController.getRecipeGemInstance);

router.post("/getInventoryList", delegateMiddleware.isDelegated);
router.post("/getInventoryList", InventoryController.getInventoryList);
router.post("/getInventoryInstanceData", delegateMiddleware.isDelegated);
router.post("/getInventoryInstanceData", InventoryController.getInventoryInstanceData);

// router.post("/sendRecipe", messageToPirate);
// router.post("/sendItem", messageToPirate);
// router.post("/sendTool", messageToPirate);

router.post("/sendRecipe", delegateMiddleware.isDelegatedTransfer);
router.post("/sendRecipe", InventoryController.sendRecipe);
router.post("/sendItem", delegateMiddleware.isDelegatedTransfer);
router.post("/sendItem", InventoryController.sendItem);
router.post("/sendTool", delegateMiddleware.isDelegatedTransfer);
router.post("/sendTool", InventoryController.sendTool);

router.use(delegateMiddleware.isDelegatedInventory);

router.post("/openChest", InventoryController.openChest);

router.post("/repairTool", InventoryController.repairTool);
router.post("/upgradeTool", InventoryController.upgradeTool);

router.post("/craft", InventoryController.craft);
router.post("/craftNPC", InventoryController.craftNPC);
router.post("/craftGem", InventoryController.craftGem);

module.exports = router;