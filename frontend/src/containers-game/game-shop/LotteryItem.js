import React, { useEffect, useState } from 'react';

import imgTicketForest from '../../assets-game/ticketForest.jpg';
import imgTicketMountain from '../../assets-game/ticketMountain.jpg';

import './lottery-item.scss'

function LotteryItem(props) {

    // const [ticketImage, setTicketImage] = useState(null);

    // //Set Ticket Infos
    // useEffect(() => { 
    //     //Set Image
    //     if (props.type == "forest") setTicketImage(props.image)
    //     if (props.type == "mountain") setTicketImage(props.image)
    // }, [props]);

    return (
        <div className={`lotteryTicket ${translateStatus(props.status)}`}>
            <h3>x{props.quantity} {props.type}</h3>
            <img src={props.image} />
            <h4 className={translateStatus(props.status)}>{translateStatus(props.status)}</h4>
        </div>
    )
}

function translateStatus(status){
    if (status == 0) return 'available'
    if (status == 1) return 'won'
    if (status == 2) return 'expired'
}

export default LotteryItem