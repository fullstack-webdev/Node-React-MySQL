const mysql = require('../config/databaseConfig');
const TicketModel = require("../models/ticketModel");
// const ShopModello = require("../models/shopModel");
const UserModel = require("../models/userModel");

const Sanitizer = require('../utils/sanitizer');
const logger = require("../logging/logger");
const { Utils } = require("../utils/utils");


// let shopService = new ShopModello.ShopService();
let userInventory = new UserModel.InventoryService();

let sanitizer = new Sanitizer();


class TicketService{
    constructor(){}

    async getTicketsByAddress(address){
        logger.debug(`getTicketsByAddress start`);
        return new Promise((resolve, reject) => {
            let sql = `
            SELECT *, count(*) as quantity
            FROM tickets INNER JOIN draws ON draws.id = tickets.idDraw 
            WHERE address = ?
            GROUP BY type, status;`;

            mysql.query(sql, address, (err, rows, fields) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error("null error in getTicketsByAddress: ", address);

                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug(`getTicketsByAddress end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }

            });
        });
    }

    //should be called getNestEndingDraws
    async getNextDraws(){
        logger.debug(`getNextDraws start`);
        return new Promise((resolve, reject) => {
            // let sql = `
            // SELECT * 
            // FROM draws
            // WHERE endingTime in (
            //   SELECT min(endingTime)
            //   FROM draws
            //   WHERE current_timestamp <= endingTime
            //   GROUP BY type);`;
            let sql = `
            SELECT * 
            FROM draws
            WHERE endingTime in (
              SELECT min(endingTime)
              FROM draws
              WHERE startTime <= current_timestamp
              AND current_timestamp <= endingTime
              GROUP BY type);`;

            mysql.query(sql, (err, rows, fields) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error("null error in getNextDraws: ");

                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug(`getNextDraws end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }

            });
        });
    }

    async getNextEndingDrawsGivenType(type){
        logger.debug(`getNextEndingDrawsGivenType start`);
        return new Promise((resolve, reject) => {
            // let sql = `
            // SELECT * 
            // FROM draws
            // WHERE endingTime in (
            //   SELECT min(endingTime)
            //   FROM draws
            //   WHERE current_timestamp <= endingTime
            //   GROUP BY type);`;
            let sql = `
            SELECT * 
            FROM draws
            WHERE endingTime in (
              SELECT min(endingTime)
              FROM draws
              WHERE startTime <= current_timestamp
              AND current_timestamp <= endingTime
              GROUP BY type)
            AND type = ?;`;

            mysql.query(sql, type, (err, rows, fields) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error("null error in getNextEndingDrawsGivenType: ");

                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug(`getNextEndingDrawsGivenType end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }

            });
        });
    }

    async getNextStartingDraws(){
        logger.debug(`getNextDraws start`);
        return new Promise((resolve, reject) => {
            let sql = `
            SELECT * 
            FROM draws
            WHERE startTime in (
              SELECT min(startTime)
              FROM draws
              WHERE startTime >= current_timestamp
              GROUP BY type);`;

            mysql.query(sql, (err, rows, fields) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error("null error in getNextDraws: ");

                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug(`getNextDraws end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }

            });
        });
    }

    async getNextStartingDrawsGivenType(type){
        logger.debug(`getNextStartingDrawsGivenType start`);
        return new Promise((resolve, reject) => {
            let sql = `
            SELECT * 
            FROM draws
            WHERE startTime in (
              SELECT min(startTime)
              FROM draws
              WHERE startTime >= current_timestamp
              GROUP BY type)
            AND type = ?;`;

            mysql.query(sql, type, (err, rows, fields) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error("null error in getNextDraws: ");

                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug(`getNextStartingDrawsGivenType end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }

            });
        });
    }

    async getNextStartingOfNotRunningDraws(){
        logger.debug(`getNextStartingOfNotRunningDraws start`);
        return new Promise((resolve, reject) => {
            let sql = `
            SELECT * 
            FROM draws
            WHERE startTime in (
              SELECT min(startTime)
              FROM draws
              WHERE startTime >= current_timestamp
              GROUP BY type)
              
            AND type NOT IN (
                SELECT type 
                FROM draws
                WHERE startTime <= current_timestamp
                AND current_timestamp <= endingTime
                GROUP BY type);`;

            mysql.query(sql, (err, rows, fields) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error("null error in getNextDraws: ");

                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug(`getNextStartingOfNotRunningDraws end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }

            });
        });
    }

    ticketBuilder(rawTickets){
        let tickets =[];
        for(let ticket of rawTickets){
            let newElem = {};
            newElem.status=ticket.status;
            newElem.type=ticket.type;
            newElem.quantity=ticket.quantity;
            newElem.image=ticket.image;
            tickets.push(newElem);
        }
        return tickets;
    }

    drawsBuilder(rawDraws){
        let draws = [];
        for(let elem of rawDraws){
            let draw = {};
            draw.type = elem.type;
            draw.date = elem.endingTime;
            draws.push(draw)
        }
        
        return draws;
    }

    retrieveTicketTypeGivenIdCatalog(id){
        switch (id) {
            case 14:
                return "forest";
            
            case 1001:
                return "townhall";

            case 1002:
                return "lumberjack";
                
            case 1003:
                return "stonemine";
        
            default:
                return "";
        }
    }

    async getBoughtTicketsInCurrentDrawGivenType(type){
        logger.debug(`getNextDraws start`);
        return new Promise((resolve, reject) => {
            let sql = `
            SELECT count(*) as quantity 
            FROM tickets INNER JOIN draws ON tickets.idDraw = draws.id
            WHERE type = ? 
            AND startTime <= current_timestamp
            AND current_timestamp <= endingTime;`;
            
            mysql.query(sql, type, (err, rows, fields) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error("null error in getBoughtTicketsInCurrentDrawGivenType: ", idDraw);

                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug(`getNextDraws end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }

            });
        });
    }










}


module.exports = {
    TicketService
}