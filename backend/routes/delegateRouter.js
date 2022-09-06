const express = require('express')
const authController = require('../controllers/authController')
const delegateController = require('../controllers/delegateController')

const router = express.Router()

if ( !process.env.NODE_SVIL ) {
    router.use(authController.isLoggedMiddleware)
} else {
    router.use((req, res, next) => {
        req.locals = {
            address: req.body.address
        }
        next()
    })
}

router.post("/addDelegate", delegateController.addDelegate)
router.post("/getDelegates", delegateController.getDelegates)
router.post("/deleteDelegate", delegateController.deleteDelegate)
router.post("/updateDelegate", delegateController.updateDelegate)
router.post("/getDelegatedCities", delegateController.getDelegatedCities)

// crossing over "delegated marketplace" to "delegated city"
router.post("/getDelegationData", delegateController.getDelegationData)

module.exports = router