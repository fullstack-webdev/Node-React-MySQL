import './game-leaderboard.scss';

import React, {
  useEffect,
  useState,
} from 'react';

import axios from 'axios';

import goldCrownImg from '../../assets-game/gold.png';
import silverCrownImg from '../../assets-game/silver.png';
import bronzeCrownImg from '../../assets-game/bronze.png';
import rankFirstImg from '../../assets-game/rankFirst.png';
import rankSecondImg from '../../assets-game/rankSecond.png';
import rankThirdtImg from '../../assets-game/rankThird.png';

import CircularProgress from '@mui/material/CircularProgress';

import TableLeaderboard from './TableLeaderboard';

const classNameForComponent = 'game-leaderboard' // ex: game-inventory
const componentTitle = 'Leaderboard' // ex: Inventory
const hasTab = true // true if this component has tabs
const tabNames = ['General', 'Fishing', 'Crafting'] // tab display names

function GameLeaderBoard ( props ) {
    //LOADING
    const [ onLoading, setOnLoading ] = useState(true)
    useEffect(() => {
        // call api to get data for this component
        setOnLoading(false)
    }, [])

    //TABS
    const [ currentTabIndex, setCurrentTabIndex ] = useState(0)

    const tabChanged = (index) => {
        if ( currentTabIndex === index || !dataLeaderboardGeneral || !dataLeaderboardFishing || !dataLeaderboardCrafting) {
            return
        }
        setCurrentTabIndex(index) 
        const page = currentPageIndex
        setCurrentPageIndex(hisotryPageIndex)
        setHistoryPageIndex(page)
        let data = 
            index == 0 
                ? dataLeaderboardGeneral 
            : index == 1 
                ? dataLeaderboardFishing
            : index == 2
                ? dataLeaderboardCrafting
            : null
        let data_topthree = []
        data.map((row, index) => { index < 3 && data_topthree.push(row)})
        setDataTopThree(data_topthree)
    }

    //TABLEPAGE
    const [ currentPageIndex, setCurrentPageIndex ] = useState(0)
    const [ hisotryPageIndex, setHistoryPageIndex ] = useState(0)
    
    const setPageIndex = (page) => {
        setCurrentPageIndex(page)
    }

    //LEADERBOARD DATAS 
    const [ dataTopThree, setDataTopThree ] = useState(null)
    const [ dataLeaderboardGeneral, setDataLeaderboardGeneral ] = useState(null)
    const [ dataLeaderboardFishing, setDataLeaderboardFishing ] = useState(null)
    const [ dataLeaderboardCrafting, setDataLeaderboardCrafting ] = useState(null)

    //GET DATAS
    useEffect(() => {
        const getLeaderboard = async function() {
            console.log('getLeaderboard')
            axios.post('/api/m1/leaderboard/getLeaderboard')
            .then(response => {
                let data = response.data.data.leaderboard
                let data_topthree = []
                data.map((row, index) => { index < 3 && data_topthree.push(row)})
                setDataTopThree(data_topthree)
                setDataLeaderboardGeneral(data)
            })
            .catch(error => {
                error.response.status == 500 && props.callback_Logout()
                error.response.status == 401 && props.callback_Logout()
            })
        }
        const getLeaderboardFisherman = async function() {
            console.log('getLeaderboardFisherman')
            axios.post('/api/m1/leaderboard/getLeaderboardFisherman')
            .then(response => {
                let data = response.data.data.leaderboard
                setDataLeaderboardFishing(data)
            })
            .catch(error => {
                error.response.status == 500 && props.callback_Logout()
                error.response.status == 401 && props.callback_Logout()
            })
        }
        const getLeaderboardCrafting = async function() {
            console.log('getLeaderboardCrafting')
            axios.post('/api/m1/leaderboard/getLeaderboardCrafting')
            .then(response => {
                let data = response.data.data.leaderboard
                setDataLeaderboardCrafting(data)
            })
            .catch(error => {
                error.response.status == 500 && props.callback_Logout()
                error.response.status == 401 && props.callback_Logout()
            })
        }
        getLeaderboard()
        getLeaderboardFisherman()
        getLeaderboardCrafting()
    }, []);

    //PERSONAL RANKING
    const getPersonalRanking = (data) => {
        return data?.map((data, index) => (
            data.cityName == props.settings.cityName && 
                <div key={index}>
                    <span className='myRanking'>
                        #{data.ranking}
                    </span>
                    <span className='myImage'>
                        <img src={data.image}/>
                    </span>
                    <span className='myImage'>
                        <img src={data.imageEmblem}/>
                    </span>
                    <span className='myName'>
                        {data.cityName}
                    </span>
                    <span className='myExp'>
                        {data.experience}
                    </span>
                </div>
        ))
    }

    return ( <>
        <div className={'game-component ' + classNameForComponent}>
            <div className='game-container'>
                <div className='header'>
                    <span className='title'>{componentTitle}</span>
                </div>
                <div className='content'>
                    { hasTab &&
                    <div className='tab-navs'>
                        { tabNames.map((tabName, index) => (
                            <div key={index} className={'tab-nav ' + (currentTabIndex === index ? 'active' : '')} onClick={() => tabChanged(index)}>{tabName}</div>
                        ))}
                    </div>}
                    <div className='scroll-content'>
                        { hasTab && 
                        <div className='tab-content'>
                            {dataTopThree != null && currentPageIndex == 0 &&
                                <div className='specPanel'>
                                    {dataTopThree[1] != null &&
                                        <div className="specSection">
                                            <div className="sectionTop">
                                                <img src={silverCrownImg} className="specBack back-2nd"></img>
                                                {dataTopThree[1].image 
                                                    ? <img src={dataTopThree[1].image} className="specAvatar avatar-2nd"></img>
                                                    : null}
                                                <img src={rankSecondImg} className="specRanking rank-2nd"></img>
                                            </div>
                                            <div className='sectionBottom'>
                                                {dataTopThree[1].imageEmblem
                                                    ? <img src={dataTopThree[1].imageEmblem} className="specEmblem"></img>
                                                    : null}
                                                <div className="specCity">{dataTopThree[1].cityName}</div>
                                                <div className="specExp">{dataTopThree[1].experience}</div>
                                            </div>  
                                        </div>
                                    }
                                    {dataTopThree[0] != null &&
                                        <div className="specSection">
                                            <div className="sectionTop">
                                                <img src={goldCrownImg} className="specBack back-1st"></img>
                                                {dataTopThree[0].image
                                                    ? <img src={dataTopThree[0].image} className="specAvatar avatar-1st"></img>
                                                    : null} 
                                                <img src={rankFirstImg} className="specRanking rank-1st"></img>
                                            </div>
                                            <div className='sectionBottom'>
                                                {dataTopThree[0].imageEmblem
                                                    ? <img src={dataTopThree[0].imageEmblem} className="specEmblem"></img>
                                                    : null}
                                                <div className="specCity">{dataTopThree[0].cityName}</div>
                                                <div className="specExp">{dataTopThree[0].experience}</div>
                                            </div>
                                        </div>
                                    }
                                    {dataTopThree[2] != null &&
                                        <div className="specSection">
                                            <div className="sectionTop">
                                                <img src={bronzeCrownImg} className="specBack back-3rd"></img>
                                                {dataTopThree[2].image
                                                    ? <img src={dataTopThree[2].image} className="specAvatar avatar-3rd"></img>
                                                    : null}
                                                <img src={rankThirdtImg} className="specRanking rank-3rd"></img>
                                            </div>
                                            <div className='sectionBottom'>
                                                {dataTopThree[2].imageEmblem
                                                    ? <img src={dataTopThree[2].imageEmblem} className="specEmblem"></img>
                                                    : null}
                                                <div className="specCity">{dataTopThree[2].cityName}</div>
                                                <div className="specExp">{dataTopThree[2].experience}</div>
                                            </div>
                                        </div>
                                    }
                                </div>
                            }
                            {currentTabIndex === 0 ? 
                                !dataLeaderboardGeneral ? 
                                    <div className='lb-table-loader'><CircularProgress size={50} sx={{color:"gold"}}/></div> 
                                : dataLeaderboardGeneral.length > 3 ?
                                     <TableLeaderboard data={dataLeaderboardGeneral} page={currentPageIndex} callback_pageNum={(page) => setPageIndex(page)}/>
                                : null
                            : currentTabIndex === 1 ?
                                !dataLeaderboardFishing ? 
                                    <div className='lb-table-loader'><CircularProgress size={50} sx={{color:"gold"}}/></div> 
                                : dataLeaderboardFishing.length > 3 ?
                                    <TableLeaderboard data={dataLeaderboardFishing} page={currentPageIndex} callback_pageNum={(page) => setPageIndex(page)}/>
                                : null
                            : currentTabIndex === 2 ?
                                !dataLeaderboardCrafting ? 
                                    <div className='lb-table-loader'><CircularProgress size={50} sx={{color:"gold"}}/></div> 
                                : dataLeaderboardCrafting.length > 3 ?
                                    <TableLeaderboard data={dataLeaderboardCrafting} page={currentPageIndex} callback_pageNum={(page) => setPageIndex(page)}/>
                                : null
                            : null}
                        </div>}
                        
                        <div className='myRankingPanel'>
                            {currentTabIndex == 0 ?
                                getPersonalRanking(dataLeaderboardGeneral)
                            : currentTabIndex == 1 ?
                                getPersonalRanking(dataLeaderboardFishing)
                            : currentTabIndex == 2 ?
                                getPersonalRanking(dataLeaderboardCrafting)
                            : null}    
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

export default GameLeaderBoard