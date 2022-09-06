import mock from './mock';

const getUniverseRes = {
    worlds: [
        {id: 1, name: 'Yuragi', image: null, home: true},
        {id: 2, name: 'Volcano', image: null, home: false},
        {id: 3, name: 'Test', image: null, home: false},
        {id: 4, name: 'Dev', image: null, home: false}
    ]
};
mock.onPost('/api/m1/worldMC/getUniverse').reply(config => {
    return [200, { success: true, data: getUniverseRes }]
})

const getWorldRes = {
    lands: [
        {
            id: 1,
            name: 'my land 1',
            image: null,
            position: {
                x: -200,
                y: -200
            },
            isPrivate: true,
            ownerInfo: {
                cityName: "A",
                cityImage: null,
            },
            home: true
        },
        {
            id: 2,
            name: 'anonymous land',
            image: null,
            position: {
                x: 100,
                y: 300
            },
            isPrivate: false,
            ownerInfo: {
                cityName: "B",
                cityImage: null,
            },
            home: false
        }
    ],
    info: {
        id: 1,
        name: "World",
        image: null,
        home: true
    }
};
mock.onPost('/api/m1/worldMC/getWorld').reply(config => {
    return [200, { success: true, data: getWorldRes }]
})
mock.onPost('/api/m1/worldMC/getHomeWorld').reply(config => {
    return [200, { success: true, data: getWorldRes }]
});

const getLandRes = {
    cities: [
        {
            address: "12312312",
            cityName: "City",
            cityImage: null,
            imageEmblem: null,
            experience: 2000,
            startingTime: "2022-06-14",

            position: 0,
            isVisitable: true,
            home: true
        },
        {
            address: "12312312",
            cityName: "City",
            cityImage: null,
            imageEmblem: null,
            experience: 2000,
            startingTime: "2022-06-14",

            position: 1,
            isVisitable: true,
            home: false
        }
    ],
    info: {
        id: 1,
        name: "Land",
        image: null,
        mapImage: null,
        maxSpot: 10,
        home: true,
        owned: true,
        positions: [{"x":1060,"y":0},{"x":640,"y":250},{"x":850,"y":130},{"x":310,"y":480},{"x":800,"y":700},{"x":1535,"y":475},{"x":1200,"y":660},{"x":850,"y":515}],

        upgradeStatus: null,
        upgradeEndingTime: "2022-07-12",

    }
};
mock.onPost('/api/m1/worldMC/getLand').reply(config => {
    return [200, { success: true, data: getLandRes }]
});
mock.onPost('/api/m1/worldMC/getHomeLand').reply(config => {
    return [200, { success: true, data: getLandRes }]
});

const getCityRes = {
    buildings: [

    ], // Full NFT list
    home: false
}
mock.onPost('/api/m1/worldMC/getCity').reply(config => {
    return [200, { success: true, data: getCityRes }]
})
mock.onPost('/api/m1/worldMC/getHomeCity').reply(config => {
    return [200, { success: true, data: getCityRes }]
})