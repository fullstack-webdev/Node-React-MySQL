import mock from './mock';

const getContractOwnerRes = {
    created : false,
    signed: false,
    contract:{
        id: 1,
        fee: 5,
        generatedTickets: 5,
        ticketsToGenerate: 25,
        maxSpot: 30,
        createTickets: true,
        expired: true,
        endingTime: '2022-07-23 00:00:00'
    },
    deleteContract: true,
    deleteMessage: "why he cannot delete the contract"
}
mock.onPost('/api/m1/contractMC/getContractOwner').reply(config => {
    return [200, { success: true, data: getContractOwnerRes }]
})

const createContractRes = {
    created : true,
    signed: true,
    contract:{
        id: 1,
        fee: 5,
        generatedTickets: 5,
        ticketsToGenerate: 25,
        maxSpot: 30,
        createTickets: true,
        expired: true,
        endingTime: '2022-07-23 00:00:00'
    },
    deleteContract: false,
    deleteMessage: "why he cannot delete the contract"
}
mock.onPost('/api/m1/contractMC/createContract').reply(config => {
    return [200, { success: true, data: createContractRes }]
})

const deleteContractRes = {
    created : false,
    signed: false,
    contract:{
        id: 1,
        fee: 5,
        generatedTickets: 5,
        ticketsToGenerate: 25,
        maxSpot: 30,
        createTickets: true,
        expired: true,
        endingTime: '2022-07-23 00:00:00'
    },
    deleteContract: false,
    deleteMessage: "why he cannot delete the contract"
}
mock.onPost('/api/m1/contractMC/deleteContract').reply(config => {
    return [200, { success: true, data: deleteContractRes }]
})
