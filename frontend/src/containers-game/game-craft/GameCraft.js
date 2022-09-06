import './game-craft.scss';

import {
  useEffect,
  useRef,
  useState,
} from 'react';

import axios from 'axios';

import { Button } from '@mui/material';

import itemImg from '../../assets-game/game-craft/item.webp';
import recipeImg from '../../assets-game/game-craft/recipeImg.svg';

const testRecipe = {
    id: 1,
    title: 'Fishing Rod Recipe',
    image: itemImg,
    requirements: [],
    available: parseInt(Math.random()*2) === 1
}
for ( var i = 0 ; i < 5 ; ++ i ) {
    testRecipe.requirements.push(
        {
            mat: {
                id: 11,
                title: 'Sand',
                image: itemImg,
            },
            count: 40,
            available: parseInt(Math.random()*2) === 1
        }
    );
}
const items = []
for ( var i = 0 ; i < 12 ; ++ i ) {
    items.push({
        mat: {
            id: 12,
            title: 'Coral',
            image: itemImg,
        },
        count: 10,
    })
}

const tabName = ['MATS', 'RECIPE', 'ITEMS']

function GameCraft ( props ) {
    const [ onLoading, setOnLoading ] = useState(false)
    const [ matLoad, setMatLoad ] = useState(false)
    const [ recipeLoad, setRecipeLoad ] = useState(false)
    const [ itemLoad, setItemLoad ] = useState(false)

    
    const [ currentTab, setCurrentTab ] = useState(0)
    const [ currentRecipe, setCurrentRecipe ] = useState({})
    const [ mats, setMats ] = useState([])
    

    useEffect(() => {
        const getMats = async function() {
            axios({
                method: 'post',
                url: '/api/m1/craft/getMats',
                data: {
                address: props.metamask.walletAccount
                }
            })
            .then(response => {
                console.log('fish response: ', response)
            })
            .catch(error => {
                error.response.status == 500 && this.props.callback_Logout()
                error.response.status == 401 && this.props.callback_Logout()
            })
        }
        // getMats()
    }, [])

    useEffect(() => {
        if ( matLoad && recipeLoad && itemLoad ) {
            setOnLoading(false)
        }
    }, [matLoad, recipeLoad, itemLoad])

    const tabChanged = (index) => {
        if ( currentTab === index ) {
            return
        }
        setCurrentTab(index)
    }

    const dragItem = useRef()
    const dragOverItem = useRef()
    const dragStart = (e, position) => {
        dragItem.current = position
    }
    const dragEnter = (e) => {
        dragOverItem.current = 'recipe'
    }
    const drop = () => {
        if ( dragOverItem.current === 'recipe' ) {
            setCurrentRecipe(testRecipe/* items[dragItem.current] */)
        }
        dragItem.current = null
        dragOverItem.current = null
    }
    
    return ( <>
        <div className='game-craft'>
            <div className='container'>
                <div className='header'>
                    <span className='title'> Craft </span>
                </div>
                <div className='content'>
                    <div className='scroll-content'>
                        < div className='recipePanel'>
                            <div className='craft' onDragEnter={dragEnter} draggable >
                                <img className={(currentRecipe.id ? '' : 'empty') + ' craft-image'} src={currentRecipe.id ? currentRecipe.image : recipeImg}></img>
                                <div className={(currentRecipe.available ? 'available' : 'missing') + ' craft-desc'}>
                                    <span className='craft-text'>{currentRecipe.available ? currentRecipe.title : 'Recipe'}</span>
                                    {currentRecipe.available ? 
                                        <Button variant="contained" color="success" onClick={()=>{alert('craft begin at ' + currentRecipe.title)}}>Craft</Button> :
                                        <Button variant="contained" color="error">Craft</Button>
                                    }
                                </div>
                            </div>
                            <div className='requirements'>
                                {!currentRecipe.id && 
                                    <span className='empty'>CHOOSE A RECIPE</span>
                                }
                                {currentRecipe.id && currentRecipe.requirements.map((requirement, index) => (
                                    <div className={(requirement.available ? 'available' : 'missing') +' requirement'} key={index}>
                                        <div className='required-item'>
                                            <img className='required-item-img' src={requirement.mat.image}></img>
                                            <div className='required-item-desc'>
                                                <div><span className='require-item-desc-title'>{requirement.mat.title}</span></div>
                                                <div><span className='require-item-desc-count'> x {requirement.count}</span></div>
                                            </div>
                                        </div>
                                        <div className='required-available'>
                                            <span>
                                                {requirement.available ? 'AVAILABLE' : 'MISSING'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className='craft-inventory'>
                            <div className='tabNav'>
                                {tabName.map((tab, index) => (
                                    <div key={index} className={'tab ' + (currentTab === index ? 'active' : '')} onClick={() => tabChanged(index)}>{tab}</div>
                                ))}
                            </div>
                            <div className='craft-items'>
                                {currentTab === 0 && items.map((item, index) => (
                                    <div key={index} className='craft-item' onClick={() => {setCurrentRecipe({}); alert('mat clicked')}}>
                                        <div className='craft-item-container'>
                                            <img className='craft-item-img' src={item.mat.image}></img>
                                            <div className='craft-item-desc'>
                                                <span className='craft-item-desc-count'> x {item.count}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {currentTab === 1 && items.map((item, index) => ( index < 10 &&
                                    <div key={index} className='craft-item' onClick={() => {setCurrentRecipe(testRecipe)}}
                                        draggable
                                        onDragStart={(e) => dragStart(e, index)}
                                        onDragEnd={drop}
                                        onDragOver={(e) => e.preventDefault()}
                                    >
                                        <div className='craft-item-container'>
                                            <img className='craft-item-img' src={item.mat.image}></img>
                                            <div className='craft-item-desc'>
                                                <span className='craft-item-desc-count'> x {item.count}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {currentTab === 2 && items.map((item, index) => (
                                    <div key={index} className='craft-item' onClick={() => {setCurrentRecipe({}); alert('item clicked')}}>
                                        <div className='craft-item-container'>
                                            <img className='craft-item-img' src={item.mat.image}></img>
                                            <div className='craft-item-desc'>
                                                <span className='craft-item-desc-count'> x {item.count}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
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

export default GameCraft