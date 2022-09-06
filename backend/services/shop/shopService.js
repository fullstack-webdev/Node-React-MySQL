const logger = require('../../logging/logger');
const {BuildingQueries} = require(`../../queries/buildingsQueries`);

class ShopService{
    static shopHistoryBuilder(lands, tickets, buildingtemp){
        let response = [];
        
        for(let land of lands){
            let newElem = {};
            newElem.name = land.name;
            newElem.image = land.image;
            newElem.saleTime = land.saleTime;

            response.push(newElem);
        } 

        for(let ticket of tickets){
            let newElem = {};
            newElem.name = ticket.name;
            switch (newElem.name) {
                case "Lottery Ticket Forest":
                    newElem.image = 'https://ancient-society.s3.eu-central-1.amazonaws.com/tickets/ticketForest.jpg';
                    break;
            
                case "Lottery Ticket Mountain":
                    newElem.image = 'https://ancient-society.s3.eu-central-1.amazonaws.com/tickets/ticketMountain.jpg';
                    break;
            }
            newElem.saleTime = ticket.saleTime;

            response.push(newElem);
        }

        for(let building of buildingtemp){
            let newElem = {};
            
            switch (building.type) {
                case 1:
                    newElem.name = "Town Hall";
                    newElem.image = 'https://ancient-society.s3.eu-central-1.amazonaws.com/buildings/townhall/TH.webp';
                    break;
            
                case 2:
                    newElem.name = "Lumberjack";
                    newElem.image = 'https://ancient-society.s3.eu-central-1.amazonaws.com/buildings/lumberjack/LJ.webp';
                    break;
                
                case 3:
                    newElem.name = "Stone Mine";
                    newElem.image = 'https://ancient-society.s3.eu-central-1.amazonaws.com/buildings/stonemine/SM.webp';
                    break;
            }

            newElem.saleTime = building.saleTime;

            response.push(newElem);
        }

        return response;
    }
}

module.exports = {ShopService};