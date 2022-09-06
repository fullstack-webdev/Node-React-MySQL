const logger = require('../../logging/logger');

class ProfileInterface{
    constructor() {}

    static async getEmblemsBuildResponse(emblems, status){
        let response = [];
        let item = {};
        let responseFinal = [];

        // console.log('getEmblemsBuildResponse: ', emblems)
    
        emblems.map((emblem, i) => {
            // console.log('getEmblemsBuildResponse [MAP]: ', emblem, i)

            item = {
                idEmblem: emblem.idEmblem,
                name: emblem.name,
                imageEmblem: emblem.imageEmblem,
                description: emblem.description,
                status: status[i]
            }

            response.push(item)
        })
        
        // console.log('response: ', response)

        //SORTING
        response.filter(emblem => { if (emblem.status == 'equipped') responseFinal.push(emblem) })
        response.filter(emblem => { if (emblem.status == 'available') responseFinal.push(emblem) })
        response.filter(emblem => { if (emblem.status == 'locked') responseFinal.push(emblem) })
        
        return responseFinal
    }

    static async setProfileBuildResponse(imgUrl, idEmblem){
        let response = {};
    
        if (imgUrl) response.imageProfile = imgUrl;
        if (idEmblem) response.idEmblem = idEmblem;

        return response
    }
}

module.exports = {ProfileInterface}

