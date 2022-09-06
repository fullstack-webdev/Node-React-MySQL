const express = require('express');
const leaderboardController = require('../controllers/leaderboardController');
const authController = require('../controllers/authController');

const router = express.Router();

router.post("/getLeaderboard", leaderboardController.getLeaderboard);
router.post("/getLeaderboardFisherman", leaderboardController.getLeaderboardFisherman);
router.post("/getLeaderboardCrafting", leaderboardController.getLeaderboardCrafting);


module.exports = router;