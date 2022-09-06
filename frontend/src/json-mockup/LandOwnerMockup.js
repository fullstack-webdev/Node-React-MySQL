/* import mock from './mock';

let ownLandData = {
    crown: true,
	stakable: false,
    unstakable:{
		isUnstakable: false,
        unstakableMessage: "why he cannot unstake",
        unstake: {
            idLandInstance: 2
        }
    },
	landsOwned:[{
 		idLandInstance: 2,
		image: '',
		stake: false
	}]
}

mock.onPost('/api/m1/landMC/getOwnLandData').reply(config => {
    return [200, { success: true, data: ownLandData }]
})
 */
/* 
data :{
	cities:[
		{
		idGuest:idGuest
	    name:name
		cityName:cityName
		exp:exp
		cityImg:
		cityEmblem:
		visitable:bool
		startingTime:
		position
		}...
	]
	
	upgradeStatus:bool
		upgradeFirstLogin:bool
		upgradeEndingTime
		notification:{
			idNotificationInstance
			type,
			message
               }
}



mock.onPost('/api/m1/land/getLandOwner').reply(config => {
    return [200, { data: ownLandData }]
}) */