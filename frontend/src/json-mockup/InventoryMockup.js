inventory = [

    //Items (Collectibles, Item applicabili per up, Item necessari per Recipe, ...)
    {
        id: 10,
        type: 'item', 
        image: '',
        name: '', 
        description: '', 
        quantity: '', 
        menu : {
            view: true,
            send: true
        }
    }, 

    //Tools
    {
        id: 10,
        type: 'tool', 
        image: '',
        name: '', 
        description: '', 
        quantity: 1,
        menu: {
            view: true,
            send: true
        },
        isAvailable: { 
            repair: true,
            upgrade: true,
        },
        properties: {
            level: 1,
            rank: 1,
            durability: 100,
            durabilityTotal: 100
        },
        repair: {
            isAllowed: true,
            hasConsumables: true,
            probability: 100,
            requirements: [
                {
                    isAllowed: true,
                    image: 'url', 
                    name: '',
                    quantity: 10,
                },
                {
                    isAllowed: true,
                    image: 'url', 
                    name: '',
                    quantity: 5,
                },
            ],
            consumables: [
                {
                    id: 10,
                    image: 'url', 
                    name: '',
                    description: '',
                    quantity: 10,
                },
                {
                    id: 20,
                    image: 'url', 
                    name: '',
                    description: '',
                    quantity: 10,
                },
            ]
        },
        upgrade: {
            isAllowed: true,
            hasConsumables: true,
            image: '',
            probability: 95,
            requirements: [
                {
                    isAllowed: true,
                    image: 'url', 
                    name: '',
                    quantity: 10,
                },
                {
                    isAllowed: true,
                    image: 'url', 
                    name: '',
                    quantity: 5,
                },
            ],
            consumables: [
                {
                    id: 10,
                    image: 'url', 
                    name: '',
                    description: '',
                    quantity: 10,
                },
                {
                    id: 20,
                    image: 'url', 
                    name: '',
                    description: '',
                    quantity: 10,
                },
            ]
        }
    }, 

    //Recipes
    {
        id: 10,
        type: 'Recipe', 
        image: '',
        name: '', 
        description: '', 
        quantity: 10,
        menu: {
            view: true,
            send: true,
            craft: true
        },
        isAvailable: { 
            craft: true,
        },
        craft: {
            isAllowed: true,
            hasConsumables: true,
            probability: 100,
            requirements: [
                {
                    isAllowed: true,
                    image: 'url', 
                    name: '',
                    quantity: 10,
                },
                {
                    isAllowed: true,
                    image: 'url', 
                    name: '',
                    quantity: 5,
                },
            ],
            consumables: [
                {
                    id: 10,
                    image: 'url', 
                    name: '',
                    description: '',
                    quantity: 10,
                },
                {
                    id: 20,
                    image: 'url', 
                    name: '',
                    description: '',
                    quantity: 10,
                },
            ],
            product: {
                name: '',
                image: ''
            }
        }
    },
]