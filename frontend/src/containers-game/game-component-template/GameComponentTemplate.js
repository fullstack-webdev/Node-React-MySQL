import './GameComponentTemplate.scss';

import {
  useEffect,
  useState,
} from 'react';

const classNameForComponent = 'Class_Name_You_Want' // ex: game-inventory
const componentTitle = 'Component_Title_You_Want' // ex: Inventory
const hasTab = true // true if this component has tabs
const tabNames = ['A', 'B', 'C', 'D', 'E'] // tab display names

function GameComponentTemplate/* Component_Name_You_Want */(props) {
    const [ onLoading, setOnLoading ] = useState(true)
    useEffect(() => {
        // call api to get data for this component
        setOnLoading(false)
    }, [])

    const [ currentTabIndex, setCurrentTabIndex ] = useState(0)
    const tabChanged = (index) => {
        if ( currentTabIndex === index ) {
            return
        }
        setCurrentTabIndex(index)
    }

    const [ doingAction, setDoingAction ] = useState(false)
    const [ confirmActionType, setConfirmActionType ] = useState('')

    return ( <>
        <div className={'game-component ' + classNameForComponent}>
            <div className='game-container'>
                <div className='header'>
                    <span className='title'>{componentTitle}</span>
                </div>
                <div className='content'>
                    { (onLoading || doingAction) && 
                    <div className='api-loading'>
                        <span className='apiCallLoading'></span>
                        <span className={'loader ' + confirmActionType + '-loader'}></span>
                    </div>}

                    { hasTab &&
                    <div className='tab-navs'>
                        { tabNames.map((tabName, index) => (
                            <div key={index} className={'tab-nav ' + (currentTabIndex === index ? 'active' : '')} onClick={() => tabChanged(index)}>{tabName}</div>
                        ))}
                    </div>}
                    <div className='scroll-content'>
                        { hasTab && 
                        <div className='tab-content'>
                            {/* add tab content here */}
                            <span  style={{color: 'white'}}> {currentTabIndex + 1}th Tab </span>
                        </div>}
                    </div>
                </div>
            </div>
        </div>
        { onLoading ?
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
        : null }
    </>)
}

export default GameComponentTemplate // Component_Name_You_Want