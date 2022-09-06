// base Route:
//  "/api/m1/delegation"
 
// routes: 
// "/setDelegate"
// "/getDelegates"
// "/deleteDelegate"
// "/getCitiesDelegated"

// API:
// "/setDelegate":
// INPUT:
// address,
// deputy(deputy's address),
// delegation(
// delegation.claim, 
// delegation.upgrade, 
// delegation.marketplace, 
// delegation.shop, 
// delegation.transfer, 
// delegation.profile
// )
// all booleans specifying what they want to delegate,
// city: 1-5 what colony/city wants delegate(not built for now)
// OUTPUT:(all people that have been delegated)
[
{
	id,
	deputy: row.deputy,
	delegation: {
		claim: row.claim,
		upgrade: row.upgrade,
		marketplace: row.marketplace,
		shop: row.shop,
		transfer: row.transfer,
		profile: row.profile
	}
}
]

// "/getDelegates":
// INPUT: address
// OUTPUT:
[
{
	id,
	deputy: row.deputy,
	delegation: {
		claim: row.claim,
		upgrade: row.upgrade,
		marketplace: row.marketplace,
		shop: row.shop,
		transfer: row.transfer,
		profile: row.profile
	}
}
]


// "/deleteDelegate":
// INPUT:
// address,
// idDelegate(id given by get)
// OUTPUT:
[
{
	id,
	deputy: row.deputy,
	delegation: {
		claim: row.claim,
		upgrade: row.upgrade,
		marketplace: row.marketplace,
		shop: row.shop,
		transfer: row.transfer,
		profile: row.profile
	}
}
]


// "/getCitiesDelegated":
// INPUT: address,
// OUTPUT:
[
	{
		id,
		owner,
		delegation: {
                    claim: row.claim,
                    upgrade: row.upgrade,
                    marketplace: row.marketplace,
                    shop: row.shop,
                    transfer: row.transfer,
                    profile: row.profile
                }
	}
]