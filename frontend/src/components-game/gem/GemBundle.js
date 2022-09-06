import './gem-bundle.scss';

import {
  useEffect,
  useState,
} from 'react';

import CheckIcon from '@mui/icons-material/Check';
import { Button } from '@mui/material';

import { serverConfig } from '../../config/serverConfig';
import {
  format,
  toFixed,
} from '../../utils/utils';

const MAX_QUANTITY = 10;

function GemBundle (props) {
    const [bundle, setBundle] = useState(props.bundle)
    useEffect(() => {
        setBundle(props.bundle)
    }, [props.bundle])

    const [purchaseCount, setPurchaseCount] = useState(1)

    const [hover, setHover] = useState(false)

    return (<>
        <div className='bundle' onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
            <div className='bundle-container'>
                <div className='bundle-img'>
                    <img src={bundle.image} alt='bundle' />
                </div>
                <div className='bundle-name'>
                    {bundle.name}
                </div>
                <div className='bundle-info'>
                    <div className='bundle-item'>
                        <img className='bundle-item-image' src={bundle.itemImage} />
                        <div className='bundle-item-name'>
                            {bundle.itemName}
                        </div>
                    </div>
                    <div className='bundle-num'>
                        <div className='bundle-quantity'>
                            x<a>{bundle.quantity * purchaseCount}</a>
                        </div>
                        <div className='bundle-price'>
                            {format(toFixed(bundle.price * purchaseCount, 4))} MATIC
                        </div>
                    </div>
                </div>
                <div className='purchase-panel'>
                    <input
                        className={'purchaseInput' + (hover ? "" : " notAllowed")}
                        step={1}
                        type='number'
                        value={purchaseCount}
                        onKeyPress={(e) => {
                            if (e.code === 'Minus') {
                                e.preventDefault();
                            } else if (e.code === 'NumpadSubtract') {
                                e.preventDefault();
                            } else if (e.code === 'Period') {
                                e.preventDefault();
                            } else if (e.code === 'NumpadDecimal') {
                                e.preventDefault();
                            } else if (e.code === 'Equal') {
                                e.preventDefault();
                            } else if (e.code === 'NumpadAdd') {
                                e.preventDefault();
                            } else if (e.code === 'Comma') {
                                e.preventDefault();
                            } else if (e.code === 'KeyE') {
                                e.preventDefault();
                            }
                        }}
                        onChange={(e) => {
                            if ( e.target.value == 0 ) {
                                setPurchaseCount('')
                            } else {
                                setPurchaseCount(Math.max(Math.min(serverConfig?.features.gem.maxPurchaseCount || MAX_QUANTITY, parseInt(e.target.value)), 1));
                            }
                        }}
                        />
                    <Button className={'purchaseBtn' + ((!hover || purchaseCount == '' || purchaseCount < 1) ? ' notAllowed' : '')} variant="contained" 
                    onClick={() => props.cb_purchase(bundle, purchaseCount)}>
                        <CheckIcon /> Pur
                    </Button>
                </div>
            </div>
        </div>
    </>)
}

export default GemBundle