import './bonus-item.scss';

import {
  useEffect,
  useState,
} from 'react';

function BonusItem ({info, selectedBonus, cb_onSelectBonus, ps}) {
    const [bonus, setBonus] = useState('bonus')
    useEffect(() => {
        setBonus(info)
    }, [info])

    const [selectedUid, setSelectedUid] = useState(selectedBonus.uid)
    useEffect(() => {
        setSelectedUid(selectedBonus.uid)
    }, [selectedBonus])

    const [hideAbbr, setHideAbbr] = useState(ps)
    useEffect(() => {
        setHideAbbr(ps)
    }, [ps])

    return (<>
        <div
            className={'bonus-item ' + (typeof bonus == 'string' ? ('empty ' + bonus) : bonus.type) + ((info.uid && info.uid == selectedUid) ? ' selected' : '')}
            onClick={(e) => {
                e.stopPropagation();
                if (typeof bonus != 'string') {
                    cb_onSelectBonus(info);
                }
            }}
        >
            <div className={'text-mark ' + (typeof bonus == 'string' ? bonus : bonus.type)}>
                {(typeof bonus == 'string' ? bonus : bonus.type)[0]}
            </div>
            
            {!hideAbbr && <div className='bonus-type-text'>
                {(typeof bonus == 'string' ? bonus : bonus.type).slice(0, 3)}
            </div>}
        </div>
    </>)
}

export default BonusItem