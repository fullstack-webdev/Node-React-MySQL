import './bonus-slot.scss';

import {
    useEffect,
    useState,
} from 'react';

function BonusSlot({ info, selectedBonus, cb_onSelectBonus }) {
    const [bonus, setBonus] = useState('bonus')
    useEffect(() => {
        setBonus(info)
    }, [info])

    const [selectedUid, setSelectedUid] = useState(selectedBonus.uid)
    useEffect(() => {
        setSelectedUid(selectedBonus.uid)
    }, [selectedBonus])

    return (<>
        <div
            className={'bonus-slot ' + (typeof bonus == 'string' ? ('empty ' + bonus) : bonus.type) + (info.uid == selectedUid ? ' selected' : '')}
            onClick={(e) => {
                if (typeof bonus != 'string') {
                    cb_onSelectBonus(info);
                }
            }}
        >
            {typeof bonus != 'string' ? <>
                <div className='bonus-name'>
                    {bonus.name}
                </div>
                <div className='bonus-tier'>
                    tier: <a>{bonus.tier}</a>
                </div>
                <div className='bonus-tier-mobile'>
                    <a>{bonus.tier}</a>
                </div>
            </> : <>
                <div className='bonus-type'>
                    {bonus}
                </div>
                <div className='bonus-tier'>
                    tier: <a>...</a>
                </div>
            </>}
        </div>
    </>)
}

export default BonusSlot