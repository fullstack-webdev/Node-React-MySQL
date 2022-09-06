//STYLES
import './game-panel.scss';

import React, {
  useEffect,
  useState,
} from 'react';

import CircularProgress from '@mui/material/CircularProgress';

//IMAGES
import imgAncien from '../../assets-game/ancien.webp';
import imgStone from '../../assets-game/stone.webp';
import imgWood from '../../assets-game/wood.webp';
import { Button } from '../../components';
import { toFixed } from '../../utils/utils';

const classNameForComponent = 'game-panel' // ex: game-inventory
const componentTitle = 'Your City' // ex: Inventory
const hasTab = false // true if this component has tabs
const tabNames = ['A', 'B', 'C', 'D', 'E'] // tab display names

function GamePanel(props) {
    const [idDelegate, setIdDelegate] = useState(props.idDelegate)
    useEffect(() => { setIdDelegate(props.idDelegate) }, [props.idDelegate])
    const [delegationData, setDelegationData] = useState(props.delegationData)
    useEffect(() => { setDelegationData(props.delegationData) }, [props.delegationData])

    const [onLoading, setOnLoading] = useState(false)
    useEffect(() => {
        // call api to get data for this component
        setOnLoading(false)
    }, [])

    const [currentTabIndex, setCurrentTabIndex] = useState(0)
    const tabChanged = (index) => {
        if (currentTabIndex === index) {
            return
        }
        setCurrentTabIndex(index)
    }

    const [ancienLastValue, setAncienLastValue] = useState(props.claimable.ancien)
    const [ancienOnClaiming, setAncienOnClaiming] = useState(false)

    const [woodLastValue, setWoodLastValue] = useState(props.claimable.wood)
    const [woodOnClaiming, setWoodOnClaiming] = useState(false)

    const [stoneLastValue, setStoneLastValue] = useState(props.claimable.stone)
    const [stoneOnClaiming, setStoneOnClaiming] = useState(false)

    useEffect(() => {
        if (props.claimable.ancien < ancienLastValue) setAncienOnClaiming(false)
        if (props.claimable.ancien > ancienLastValue) setAncienLastValue(props.claimable.ancien)
    }, [props.claimable.ancien]);
    useEffect(() => {
        if (props.claimable.wood < woodLastValue) setWoodOnClaiming(false)
        if (props.claimable.wood > woodLastValue) setWoodLastValue(props.claimable.wood)
    }, [props.claimable.wood]);
    useEffect(() => {
        if (props.claimable.stone < stoneLastValue) setStoneOnClaiming(false)
        if (props.claimable.stone > stoneLastValue) setStoneLastValue(props.claimable.stone)
    }, [props.claimable.stone]);

    const isClaimable = (props) => {
        if ((props.claimable.ancien >= 1 || props.claimable.wood >= 1 || props.claimable.stone >= 1) && !onLoading) return true
        return false
    }

    const setOnClaiming = () => {
        if (props.claimable.ancien >= 1) setAncienOnClaiming(true)
        if (props.claimable.wood >= 1) setWoodOnClaiming(true)
        if (props.claimable.stone >= 1) setStoneOnClaiming(true)
    }
    useEffect(() => {
        if (!ancienOnClaiming && !woodOnClaiming && !stoneOnClaiming) setOnLoading(false)
        else setOnLoading(true)
    }, [ancienOnClaiming, woodOnClaiming, stoneOnClaiming]);

    return (<>
        <div className={'game-component ' + classNameForComponent}>
            <div className='game-container'>
                <div className='header'>
                    <span className='title'>{componentTitle}</span>
                </div>
                <div className='content'>
                    {hasTab &&
                        <div className='tab-navs'>
                            {tabNames.map((tabName, index) => (
                                <div key={index} className={'tab-nav ' + (currentTabIndex === index ? 'active' : '')} onClick={() => tabChanged(index)}>{tabName}</div>
                            ))}
                        </div>}
                    <div className='scroll-content'>
                        {hasTab &&
                            <div className='tab-content'>
                                {/* add tab content here */}
                                <span style={{ color: 'white' }}> {currentTabIndex + 1}th Tab </span>
                            </div>}
                        <div className='claimAll'>
                            <h3>Resources</h3>
                            <p><img src={imgAncien} /> {toFixed(props.claimable.ancien, 4)}</p>
                            <p><img src={imgWood} /> {toFixed(props.claimable.wood, 4)}</p>
                            <p><img src={imgStone} /> {toFixed(props.claimable.stone, 4)}</p>
                            <Button
                                style={
                                    (isClaimable(props) && !(idDelegate != null && !delegationData.claim))
                                        ? 'btn-claimAll'
                                        : 'btn-claimAll disabled'}
                                text={onLoading ? <CircularProgress size={30} sx={{ color: "gray", marginTop: "5px" }} /> : 'Claim All'}
                                onButtonClick={() => {
                                    if ((idDelegate != null && !delegationData.claim)) {
                                        return
                                    }
                                    if (isClaimable(props) && !onLoading) {
                                        setOnClaiming()
                                        props.callback_claimAll(true)
                                    }
                                }
                                }
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
        {onLoading ?
            <div className='game-on-loading'>
                <div className="sk-cube-grid">
                    <div className="sk-cube sk-cube1"></div>
                    <div className="sk-cube sk-cube2"></div>
                    <div className="sk-cube sk-cube3"></div>
                    <div className="sk-cube sk-cube4"></div>
                    <div className="sk-cube sk-cube5"></div>
                    <div className="sk-cube sk-cube6"></div>
                    <div className="sk-cube sk-cube7"></div>
                    <div className="sk-cube sk-cube8"></div>
                    <div className="sk-cube sk-cube9"></div>
                </div>
            </div>
            : null}
    </>)
}

export default GamePanel