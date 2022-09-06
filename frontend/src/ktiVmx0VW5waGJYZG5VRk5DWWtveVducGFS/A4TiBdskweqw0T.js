import {useEffect, useState} from 'react'
import axios from 'axios';

//[0: Disabled]...[4: Fortress]
const SECURITY_LEVEL_COORDS = 4;
const SECURITY_LEVEL_TRUST = 4;
const SECURITY_LEVEL_TIMESTAMP = 2;


function A4TiBdskweqw0T(props) {
    const [ clicks, setClicks ] = useState([])
    const [ lastClick, setLastClick ] = useState()

    const [ suspectedClicks, setSuspectedClicks ] = useState([])

    //NEW CLICK HANDLER
    useEffect(() => {
        setLastClick(props.lastClick)
    }, [props.lastClick])

    //NEW CLICK => CHECK FOR BOTS
    useEffect(() => {
        if(!lastClick) return

        //Check for Coords Duplicates
        checkCoords();

        //Check if there's a weird Timestamp Pattern
        checkTimestamp();

        //AFTER CHECK => ADD LAST CLICK TO THE ARRAY_CLICKS
        setClicks(prevClicks => [...prevClicks, {
            clientX: lastClick.clientX,
            clientY: lastClick.clientY,
            target: lastClick.target,
            isTrusted: lastClick.isTrusted,
            timeStamp: lastClick.timeStamp,
            detail: lastClick.detail
        }])

        //Check if it's a real click
        checkTrust();

        // Console Log all Clicks
        // printClicks();
    }, [lastClick])



    //NEW CLICK => CHECK TRUST
    const checkTrust = () => {
        let trustIssue = clicks
            ?.filter(click => !click.isTrusted) 
            ?.length 
        if(trustIssue >= getSecurityForFeature('checkTrust')) 
            setSuspectedClicks(prevClicks => [...prevClicks, {
                suspect: 'trust',
                clientX: lastClick.clientX,
                clientY: lastClick.clientY,
                target: lastClick.target,
                isTrusted: lastClick.isTrusted,
                timeStamp: lastClick.timeStamp,
                detail: lastClick.detail
            }])
    }



    //NEW CLICK => CHECK EQUAL COORDS
    const checkCoords = () => {
        //Check for same Coordinates
        let coordsDuplicate = clicks?.filter(click => 
            click?.clientX == lastClick?.clientX 
            && click?.clientY == lastClick?.clientY
            && click?.detail < 2) 
                ?.length 
        if(coordsDuplicate >= getSecurityForFeature('checkCoords')) 
            setSuspectedClicks(prevClicks => [...prevClicks, {
                suspect: 'coords',
                clientX: lastClick.clientX,
                clientY: lastClick.clientY,
                target: lastClick.target,
                isTrusted: lastClick.isTrusted,
                timeStamp: lastClick.timeStamp,
                detail: lastClick.detail
            }])
    }



    //NEW CLICK => CHECK TIMESTAMP PATTERNS ON THE SAME HTML TARGET
    const checkTimestamp = () => {
        //Avoid Doubleclicks
        if(lastClick?.detail > 1) return false

        //Check for same HTML Target and Not Doubleclick
        let sameTarget = clicks?.filter(click => click?.target == lastClick?.target && click?.detail < 2) 

        //Check if there are at least 2 other clicks on the same HTML Target
        if(sameTarget?.length < 2) return false

        //CHECK FOR A PATTERN
        let differences = []

        //Get Time Difference between lastClick and last saved click
        differences.push(lastClick?.timeStamp - [...sameTarget]?.pop().timeStamp)
        
        //Remove last saved click and get Time Difference with the previous click
        sameTarget?.map(click => {
            if(!click) return
            differences.push(sameTarget?.pop().timeStamp - [...sameTarget]?.pop().timeStamp)
        })

        //Compare all the differences
        let suspectThreshold = 1000; //Milliseconds
        let suspectedCounter = 0;
        differences?.map(difference => {
            if(!difference) return
            //Check if the differences are below the threshold
            if((differences?.pop() - [...differences]?.pop()) < suspectThreshold) suspectedCounter++
        })

        if(suspectedCounter >= getSecurityForFeature('checkTimestamp')) 
            setSuspectedClicks(prevClicks => [...prevClicks, {
                suspect: 'timestamp',
                clientX: lastClick.clientX,
                clientY: lastClick.clientY,
                target: lastClick.target,
                isTrusted: lastClick.isTrusted,
                timeStamp: lastClick.timeStamp,
                detail: lastClick.detail
            }])
    }



    //NEW SUSPECTED CLICK
    useEffect(() => {
        if(!suspectedClicks?.length) return
        
        let ancien = [...suspectedClicks].pop()
        ancien.target = ancien.target.className
        if(ancien.detail > 1) return

        // axios.post('/api/m1/user/getResource', {
        //     address: props.address, 
        //     idDelegate: props.idDelegate,
        //     ancien
        // })
    }, [suspectedClicks])


   //CONSOLE LOGS
    const printClicks = () => {
        console.log('lastClick: ', lastClick)
        console.log('clicks: ', clicks)
        console.log('clicks.last: ', [...clicks].pop())
    }
}

//SECURITY LEVEL SETTINGS
function getSecurityForFeature(caller){
    switch(caller){
        case 'checkCoords':
            return getSecurityForCheckCoords(SECURITY_LEVEL_COORDS)
        case 'checkTrust':
            return getSecurityForCheckTrust(SECURITY_LEVEL_TRUST)
        case 'checkTimestamp':
            return getSecurityForCheckTimestamp(SECURITY_LEVEL_TIMESTAMP)
    }
}
//Coords
function getSecurityForCheckCoords(securityLevel){
    switch(securityLevel){
        case 0: return 9999
        case 1: return 5
        case 2: return 3
        case 3: return 2
        case 4: return 1
    }
}
//Trust
function getSecurityForCheckTrust(securityLevel){
    switch(securityLevel){
        case 0: return 9999
        case 1: return 5
        case 2: return 3
        case 3: return 2
        case 4: return 1
    }
}
//Timestamp
function getSecurityForCheckTimestamp(securityLevel){
    switch(securityLevel){
        case 0: return 9999
        case 1: return 5
        case 2: return 3
        case 3: return 2
        case 4: return 1
    }
}


export default A4TiBdskweqw0T