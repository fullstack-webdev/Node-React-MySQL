import mock from './mock';

const getTicketsOwnerRes = {
	generatedTickets: [
		{
			idTicket: 1,
			price: 2,
			endingTime: '2022-07-21 14:18:37.000000',
			status: 'generated',
			menu:{
				view: 1,
				send: 1,
				sell: 1
			}
		},
		{
			idTicket: 2,
			price: 2,
			endingTime: '2022-07-21 14:18:37.000000',
			status: 'generated',
			menu:{
				view: 1,
				send: 1,
				sell: 1
			}
		}
	],
	sellingTickets: [
		{idTicket: 3,
		price: 2,
		endingTime: '2022-07-21 14:18:37.000000',
		status: 'onSale',
		menu:{
			view: 1,
			send: 1,
			sell: 0
		}},
		{idTicket: 4,
		price: 2,
		endingTime: '2022-07-21 14:18:37.000000',
		status: 'onSale',
		menu:{
			view: 1,
			send: 1,
			sell: 0
		}}
	],
	otherTickets: [
		{idTicket: 5,
		price: 2,
		endingTime: '2022-07-21 14:18:37.000000',
		status: 'sent',
		menu:{
			view: 1,
			send: 1,
			sell: 0
		}},
		{idTicket: 6,
		price: 2,
		endingTime: '2022-07-21 14:18:37.000000',
		status: 'used',
		menu:{
			view: 1,
			send: 1,
			sell: 0
		}},
		{idTicket: 6,
		price: 2,
		endingTime: '2022-07-21 14:18:37.000000',
		status: 'expired',
		menu:{
			view: 1,
			send: 1,
			sell: 0
		}}
	]
}
mock.onPost('/api/m1/ticketMC/getTicketsOwner').reply(config => {
    return [200, { success: true, data: getTicketsOwnerRes }]
})

const getAllTicketsRes = {
	tickets: [
		{idTicket: 3,
		price: 2,
		endingTime: '2022-07-21 14:18:37.000000',
		status: 'onSale',
		menu:{
			view: 1,
			send: 1,
			sell: 0
		}},
		{idTicket: 4,
		price: 2,
		endingTime: '2022-07-21 14:18:37.000000',
		status: 'onSale',
		menu:{
			view: 1,
			send: 1,
			sell: 0
		}}
	]
}
mock.onPost('/api/m1/ticketMC/getAllTickets').reply(config => {
    return [200, { success: true, data: getAllTicketsRes }]
})

const createTicketsRes = {
	generatedTickets: 10,
	ticketsToGenerate: 20,
	createTickets: true,
}
mock.onPost('/api/m1/ticketMC/createTickets').reply(config => {
    return [200, { success: true, data: createTicketsRes }]
})

/* removeListingTicket
API to invoke when a landowner wants to remove a ticket that is currently on sale into the marketplace
We have to make sure he is the landOwner of the land that the ticket refers to 
Then we have to return it into the landOwner Ticket interface

input:address,idTicket



output:{
success:bool
	inventoryTickets:{
		action:’add’
		ticket:{
	idTicket
	price
	endingTime
	status
	menu:{
		view
		send
		sell
}
}
}
 */
const removeListingTicketRes = {
	inventoryTickets: {
		action: 'add',
		ticket: {
			idTicket: 3,
			price: 2,
			endingTime: '2022-07-21 14:18:37.000000',
			status: 'expired',
			menu:{
				view: 1,
				send: 1,
				sell: 0
			}
		}
	}
}
mock.onPost('/api/m1/ticketMC/removeListingTicket').reply(config => {
    return [200, { success: true, data: removeListingTicketRes }]
})

/* createListingTicket
API to invoke when a landowner wants to sell a ticket that  currently holds. (only the landowner is able to sell tickets)
The tickets can be sold one at a time
We have to make sure he is the landOwner of the land that the ticket refers to 
Then we have to remove it from the landOwner ticket inventory

input:address,idTicket



output:{
success:bool
    "data": {
        "idTicket":,
        "creationTime": "
        "price": ,
        "endingTime": ",
        "markeStatus": "",
        "toShow": 
    }

 */

const createListingTicketRes = {
    idTicket: 1,
    creationTime: '2022-07-17',
    price: 1.0,
    endingTime: '2022-07-18',
    marketStatus: 'onSale',
    toShow: true
}
mock.onPost('/api/m1/ticketMC/creatingListTicket').reply(config => {
    return [200, { success: true, data: createListingTicketRes }]
})