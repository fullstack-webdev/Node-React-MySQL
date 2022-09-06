import './bonus-bar.scss';

import {
  useEffect,
  useState,
} from 'react';

function BonusBar(props) {
    const [info, setInfo] = useState(props.info)
    useEffect(() => {
        setInfo(props.info)
    }, [props.info])

    return (
        <div className='bonus-bar'>
            {info.map((bonus, index) => (
                <div key={index} className={'bonus-bar-individual ' + (typeof bonus == 'string' ? ('empty ' + bonus) : bonus.type)}></div>
            ))}
        </div>
    )
}

export default BonusBar