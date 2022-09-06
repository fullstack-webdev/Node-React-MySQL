land = {
    name: '',
    type: '',
    rarity: '',
    level: '',
    description: '',
    coordinates: '',
    
    image: '',
    positions: [ //the number of city spots can be different for each Land. (So the common has 10 spots, the rare has 15 spots). Also the image will change
        {x, y},
        {x, y},
        {x, y},
    ],

    cities: [
        {name: '', image: '', position},
        {name: '', image: '', position},
    ]
}