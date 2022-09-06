const AncienAddress = '0xDD1DB78a0Acf24e82e511454F8e00356AA2fDF0a';
const AncienSymbol = 'ANCIEN';
const AncienDecimals = 18;
const AncienImage = 'https://ancientsociety.herokuapp.com/static/media/ancien.ae5427d9564fe4485abf.webp';

const WoodAddress = '0x415817AA4c301799A696FB79df2947865532bA89';
const WoodSymbol = 'ANCIENWOOD';
const WoodDecimals = 18;
const WoodImage = 'https://ancientsociety.herokuapp.com/static/media/wood.574c6fb220a8c674312a.webp';

const StoneAddress = '0x8d7d040d87C392938318b1Abdc4CbEFA836FD1aa';
const StoneSymbol = 'ANCIENSTONE';
const StoneDecimals = 18;
const StoneImage = 'https://ancientsociety.herokuapp.com/static/media/stone.658bbaea6caf2bb3adc3.webp';

export const addAncienToMetamask = async () => {
    try {
        const wasAdded = await ethereum.request({
        method: 'wallet_watchAsset',
        params: {
        type: 'ERC20', 
        options: {
            address: AncienAddress, 
            symbol: AncienSymbol, 
            decimals: AncienDecimals, 
            image: AncienImage, 
        },
        },
    });

    // if (wasAdded) {
    //     console.log('Ancien Coin added');
    // } else {
    //     console.log('Ancien Coin has not been added');
    // }
    } catch (error) {
    console.log(error);
    }
}

export const addWoodToMetamask = async () => {
    try {
        const wasAdded = await ethereum.request({
        method: 'wallet_watchAsset',
        params: {
        type: 'ERC20', 
        options: {
            address: WoodAddress, 
            symbol: WoodSymbol, 
            decimals: WoodDecimals, 
            image: WoodImage, 
        },
        },
    });

    // if (wasAdded) {
    //     console.log('AncienWood Coin added');
    // } else {
    //     console.log('AncienWood Coin has not been added');
    // }
    } catch (error) {
    console.log(error);
    }
}

export const addStoneToMetamask = async () => {
    try {
        const wasAdded = await ethereum.request({
        method: 'wallet_watchAsset',
        params: {
        type: 'ERC20', 
        options: {
            address: StoneAddress, 
            symbol: StoneSymbol, 
            decimals: StoneDecimals, 
            image: StoneImage, 
        },
        },
    });

    // if (wasAdded) {
    //     console.log('AncienStone Coin added');
    // } else {
    //     console.log('AncienStone Coin has not been added');
    // }
    } catch (error) {
    console.log(error);
    }
}