import { useEffect } from 'react';

import useSound from 'use-sound';

const ASSETS_PATH = `${process.env.PUBLIC_URL}/assets-sounds`

const audioResource = {
    // common
    touch: `${ASSETS_PATH}/common/touch.mp3`,
    button: `${ASSETS_PATH}/common/button.mp3`,
    tab: `${ASSETS_PATH}/common/tab.mp3`,
    success: `${ASSETS_PATH}/common/success.mp3`,
    fail: `${ASSETS_PATH}/common/fail.mp3`,
    popup: `${ASSETS_PATH}/common/popup.mp3`,
    toast: `${ASSETS_PATH}/common/toast.mp3`,
    confirm: `${ASSETS_PATH}/common/confirm.mp3`,

    // menu
    menuClick: `${ASSETS_PATH}/menu/click.mp3`,
    mobileMenuOpen: `${ASSETS_PATH}/menu/mobile-open.mp3`,
    mobileMenuClose: `${ASSETS_PATH}/menu/mobile-close.mp3`,
    menuLogout: `${ASSETS_PATH}/menu/logout.mp3`,

    // maps -> city
    cityNature: `${ASSETS_PATH}/maps/city/nature.mp3`,
    citySlot: `${ASSETS_PATH}/maps/city/slot.mp3`,
    cityFlag: `${ASSETS_PATH}/maps/city/flag.mp3`,

    // maps -> city -> building
    townhall: `${ASSETS_PATH}/maps/city/building/townhall.mp3`,
    lumberjack: `${ASSETS_PATH}/maps/city/building/lumberjack.mp3`,
    stonemine: `${ASSETS_PATH}/maps/city/building/stonemine.mp3`,
    fisherman: `${ASSETS_PATH}/maps/city/building/fisherman.mp3`,
    buildingClaim: `${ASSETS_PATH}/maps/city/building/claim.mp3`,
    buildingUpgrade: `${ASSETS_PATH}/maps/city/building/upgrade.mp3`,

    // maps -> land
    landNature: `${ASSETS_PATH}/maps/land/nature.mp3`,

    // maps -> world
    worldNature: `${ASSETS_PATH}/maps/world/nature.mp3`,
    
    // components -> craft-inventory
    craft: `${ASSETS_PATH}/components/craft-inventory/craft.mp3`,
    repair: `${ASSETS_PATH}/components/craft-inventory/repair.mp3`,
    upgrade: `${ASSETS_PATH}/components/craft-inventory/upgrade.mp3`,
    send: `${ASSETS_PATH}/components/craft-inventory/send.mp3`,

    // components -> fish
    fish: `${ASSETS_PATH}/components/fish/fish.mp3`,

    // components -> settings
    sound: `${ASSETS_PATH}/components/settings/sound.mp3`,

    // components -> shop
    buy: `${ASSETS_PATH}/components/shop/buy.mp3`,

    // components -> marketplace
    sell: `${ASSETS_PATH}/components/marketplace/sell.mp3`,
    cancel: `${ASSETS_PATH}/components/marketplace/cancel.mp3`,

    // components -> storage
    mint: `${ASSETS_PATH}/components/storage/mint.mp3`
}

let soundVolume = 0.1
var soundUrl = ''
var soundPlay = false

function SoundEffect() {
    // common
    const [touch] = useSound(audioResource.touch, {
        volume: getVolumeSounds(true),
    })
    const [button] = useSound(audioResource.button, {
        volume: getVolumeSounds(true),
    })
    const [tab] = useSound(audioResource.tab, {
        volume: getVolumeSounds(true),
    })
    const [success] = useSound(audioResource.success, {
        volume: getVolumeSounds(true),
    })
    const [fail] = useSound(audioResource.fail, {
        volume: getVolumeSounds(true),
    })
    const [popup] = useSound(audioResource.popup, {
        volume: getVolumeSounds(true),
    })
    const [toast] = useSound(audioResource.toast, {
        volume: getVolumeSounds(true),
    })
    const [confirm] = useSound(audioResource.confirm, {
        volume: getVolumeSounds(true),
    })

    // menu
    const [menuClick] = useSound(audioResource.menuClick, {
        volume: getVolumeSounds(true),
    })
    const [mobileMenuOpen] = useSound(audioResource.mobileMenuOpen, {
        volume: getVolumeSounds(true),
    })
    const [mobileMenuClose] = useSound(audioResource.mobileMenuClose, {
        volume: getVolumeSounds(true),
    })
    const [menuLogout] = useSound(audioResource.menuLogout, {
        volume: getVolumeSounds(true),
    })

    // maps -> city
    const [cityNature, {stop: stopCityNature}] = useSound(audioResource.cityNature, {
        volume: Math.min(0.2, getVolumeSounds()),
    })
    const [citySlot] = useSound(audioResource.citySlot, {
        volume: getVolumeSounds(true),
    })
    const [cityFlag] = useSound(audioResource.cityFlag, {
        volume: getVolumeSounds(true),
    })

    // maps -> city -> building
    const [townhall] = useSound(audioResource.townhall, {
        volume: getVolumeSounds(true),
    })
    const [lumberjack] = useSound(audioResource.lumberjack, {
        volume: getVolumeSounds(true),
    })
    const [stonemine] = useSound(audioResource.stonemine, {
        volume: getVolumeSounds(true),
    })
    const [fisherman] = useSound(audioResource.fisherman, {
        volume: getVolumeSounds(true),
    })
    const [buildingClaim] = useSound(audioResource.buildingClaim, {
        volume: getVolumeSounds(true),
    })
    const [buildingUpgrade] = useSound(audioResource.buildingUpgrade, {
        volume: getVolumeSounds(true),
    })

    // maps -> land
    const [landNature, {stop: stopLandNature}] = useSound(audioResource.landNature, {
        volume: Math.min(0.2, getVolumeSounds()),
    })

    // maps -> world
    const [worldNature, {stop: stopWorldNature}] = useSound(audioResource.worldNature, {
        volume: Math.min(0.2, getVolumeSounds()),
    })

    // components -> craft-inventory
    const [craft] = useSound(audioResource.craft, {
        volume: getVolumeSounds(true),
    })
    const [repair] = useSound(audioResource.repair, {
        volume: getVolumeSounds(true),
    })
    const [upgrade] = useSound(audioResource.upgrade, {
        volume: getVolumeSounds(true),
    })
    const [send] = useSound(audioResource.send, {
        volume: getVolumeSounds(true),
    })

    // components -> fish
    const [fish] = useSound(audioResource.fish, {
        volume: getVolumeSounds(true),
    })

    // components -> settings
    const [sound] = useSound(audioResource.sound, {
        volume: getVolumeSounds(true),
    })

    // components -> shop
    const [buy] = useSound(audioResource.buy, {
        volume: getVolumeSounds(true),
    })

    // components -> marketplace
    const [sell] = useSound(audioResource.sell, {
        volume: getVolumeSounds(true),
    })
    const [cancel] = useSound(audioResource.cancel, {
        volume: getVolumeSounds(true),
    })

    // components -> storage
    const [mint] = useSound(audioResource.mint, {
        volume: getVolumeSounds(true),
    })

    useEffect(() => {
        if ( soundUrl == '' ) {
            stopCityNature()
            stopLandNature()
            stopWorldNature()
        }
        // common
         else if ( soundUrl == 'touch' ) {
            touch()
        } else if ( soundUrl == 'button' ) {
            button()
        } else if ( soundUrl == 'tab' ) {
            tab()
        } else if ( soundUrl == 'success' ) {
            success()
        } else if ( soundUrl == 'fail' ) {
            fail()
        } else if ( soundUrl == 'popup' ) {
            popup()
        } else if ( soundUrl == 'toast' ) {
            toast()
        } else if ( soundUrl == 'confirm' ) {
            confirm()
        }
        // menu
        else if ( soundUrl == 'menuClick' ) {
            menuClick()
        } else if ( soundUrl == 'mobileMenuOpen' ) {
            mobileMenuOpen()
        } else if ( soundUrl == 'mobileMenuClose' ) {
            mobileMenuClose()
        } else if ( soundUrl == 'menuLogout' ) {
            menuLogout()
        } 
        // maps -> city
        else if ( soundUrl == 'cityNature' ) {
            cityNature()
        } else if ( soundUrl == 'citySlot' ) {
            citySlot()
        } else if ( soundUrl == 'cityFlag' ) {
            cityFlag()
        }
        // maps -> city -> building
        else if ( soundUrl == 'townhall' ) {
            townhall()
        } else if ( soundUrl == 'lumberjack' ) {
            lumberjack()
        } else if ( soundUrl == 'stonemine' ) {
            stonemine()
        } else if ( soundUrl == 'fisherman' ) {
            fisherman()
        } else if ( soundUrl == 'buildingClaim' ) {
            buildingClaim()
        } else if ( soundUrl == 'buildingUpgrade' ) {
            buildingUpgrade()
        }
        // maps -> land
        else if ( soundUrl == 'landNature' ) {
            landNature()
        }
        // maps -> world
        else if ( soundUrl == 'worldNature' ) {
            worldNature()
        }
        // components -> craft-inventory
        else if ( soundUrl == 'craft' ) {
            craft()
        } else if ( soundUrl == 'repair' ) {
            repair()
        } else if ( soundUrl == 'upgrade' ) {
            upgrade()
        } else if ( soundUrl == 'send' ) {
            send()
        }
        // components -> fish
        else if ( soundUrl == 'fish' ) {
            fish()
        }
        // components -> settings
        else if ( soundUrl == 'sound' ) {
            console.log(soundUrl)
            sound()
        }
        // components -> shop
        else if ( soundUrl == 'buy' ) {
            buy()
        }
        // components -> marketplace
        else if ( soundUrl == 'sell' ) {
            sell()
        }
        else if ( soundUrl == 'cancel' ) {
            cancel()
        }
        // components -> storage
        else if ( soundUrl == 'mint' ) {
            mint()
        }
    }, [soundUrl, soundPlay])

    return (
        <></>
    )
}

export function playSound(soundName){
    if ( soundName == '' ) {
        soundPlay = !soundPlay
        soundUrl = soundName
    } else {
        if ( isMute() ) return false
    
        soundPlay = !soundPlay
        soundUrl = soundName
    }
    
}

export function getVolumeSounds(play = false){
    if(!localStorage.getItem('volumeSounds')) return !play ? soundVolume*100 : soundVolume 
    
    soundVolume = parseFloat(localStorage.getItem('volumeSounds').toString())/100
    return !play ? soundVolume*100 : soundVolume
}

function isMute(){
    if ( localStorage.getItem('isMute') == 'true' ) { return true }
    else return false
}

export default SoundEffect