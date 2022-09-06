import mock from './mock';

const fisherman = {

    rods:
    [
        {
            name: 'Basic Rod',
            image: '',
            level: 0,
            rank: 0,
            durability: 40,
            status: 'available',
            isFishing: true
        },
        {
            name: 'Rod 2',
            level: 1,
            rank: 1,
            durability: 30,
            status: 'equipped',
            isFishing: false
        },
        {
            name: 'Rod 3',
            level: 1,
            rank: 3,
            durability: 10,
            status: 'available',
            isFishing: false
        },
        {
            name: 'Rod 4',
            level: 1,
            rank: 2,
            durability: 12,
            status: 'not-available',
            isFishing: false
        },
    ],
    seas:
    [
        {
            id: 1,
            title: 'Sea 1',
            description: 'Description 1',
            rankRequired: 1,
            drop: [
                {name: 'sand', rarity: 'common'},
                {name: 'recipe', rarity: 'rare'},
            ],
            isAllowed: true,
            messageNotAllowed: ""
        },
        {
            id: 2,
            title: 'Sea 2',
            description: 'Description 2',
            rankRequired: 2,
            drop: [
                {name: 'sand', rarity: 'common'},
                {name: 'recipe', rarity: 'rare'},
                {name: 'pearl', rarity: 'legendary'},
            ],
            isAllowed: false,
            messageNotAllowed: ""
        },
    ],
    fishermanEndingTime: '2022-06-05 06:32:04.000000',
    rodEndingTime: '2022-06-05 07:56:04.000000'

}

mock.onPost('/api/m1/fish/getFish').reply(config => {
    return [200, { data: fisherman }]
})