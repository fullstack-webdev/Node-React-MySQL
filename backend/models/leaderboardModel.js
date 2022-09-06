const { model, models } = require('mongoose');
const mysql = require('../config/databaseConfig');
const logger= require('../logging/logger');


class LeaderboardModel {
    static  leaderboardBuilder(rawLeaderboard){
        let response = [];
        for (let i = 0; i < rawLeaderboard.length; i++){
            let newElem={};

            newElem.id = rawLeaderboard[i].id;
            newElem.experience = rawLeaderboard[i].experience;
            newElem.image = rawLeaderboard[i].image;
            if (rawLeaderboard[i].toShow) newElem.imageEmblem = rawLeaderboard[i].imageEmblem;
            newElem.cityName = rawLeaderboard[i].cityName;
            newElem.ranking = i + 1;
            response.push(newElem);
        }
        return response;
    }

    static  leaderboardFishermanBuilder(rawLeaderboard){
        let response = [];
        for (let i = 0; i < rawLeaderboard.length; i++){
            let newElem={};

            newElem.id = rawLeaderboard[i].id;
            newElem.experience = rawLeaderboard[i].experienceFisherman;
            newElem.image = rawLeaderboard[i].image;
            if (rawLeaderboard[i].toShow) newElem.imageEmblem = rawLeaderboard[i].imageEmblem;
            newElem.cityName = rawLeaderboard[i].cityName;
            newElem.ranking = i + 1;
            response.push(newElem);
        }
        return response;
    }

    static  leaderboardCraftingBuilder(rawLeaderboard){
        let response = [];
        for (let i = 0; i < rawLeaderboard.length; i++){
            let newElem={};

            newElem.id = rawLeaderboard[i].id;
            newElem.experience = rawLeaderboard[i].quantity;
            newElem.image = rawLeaderboard[i].image;
            if (rawLeaderboard[i].toShow) newElem.imageEmblem = rawLeaderboard[i].imageEmblem;
            newElem.cityName = rawLeaderboard[i].cityName;
            newElem.ranking = i + 1;
            response.push(newElem);
        }
        return response;
    }
}

module.exports = LeaderboardModel
