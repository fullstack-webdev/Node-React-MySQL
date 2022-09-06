import mock from './mock';

const market = {

    listings:
    [
        {
            id: 12,
            image: 'https://ancient-society.s3.eu-central-1.amazonaws.com/resources/wood.webp',
            market: "resource",
            name: "Wood",
            price: 1,
            quantity: 10,
            bought: 1,
            totalPrice: 10,
        },
        {
            id: 14,
            image: 'https://ancient-society.s3.eu-central-1.amazonaws.com/resources/wood.webp',
            market: "resource",
            name: "Wood",
            price: 1,
            quantity: 13,
            bought: 1,
            totalPrice: 15,
        },
        {
            id: 15,
            image: 'https://ancient-society.s3.eu-central-1.amazonaws.com/resources/wood.webp',
            market: "resource",
            name: "Wood",
            price: 1,
            quantity: 15,
            bought: 0,
            totalPrice: 20,
        },
    ],
    totalQuantity: 23,
    totalPrice: 25,
    ancien: 1000021
}

mock.onPost('/api/m1/marketplace/getBuyData').reply(config => {
    return [200, { data: market, success: true }]
})