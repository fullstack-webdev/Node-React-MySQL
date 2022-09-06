import './lands-owner.scss';
import 'react-toastify/dist/ReactToastify.css';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import axios from 'axios';
import { ethers } from 'ethers';
import {
  usePagination,
  useTable,
} from 'react-table';
import {
  toast,
  ToastContainer,
} from 'react-toastify';
import styled from 'styled-components';

import ArrowCircleRightIcon from '@mui/icons-material/ArrowCircleRight';
import LocationOffIcon from '@mui/icons-material/LocationOff';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
} from '@mui/material';

import iconBack from '../../assets-game/arrow_back.svg';
import iconForward from '../../assets-game/arrow_forward.svg';
import defaultLandView from '../../assets-game/defaultLandView.png';
import { playSound } from '../../utils/sounds';

const classNameForComponent = 'lands-owner' // ex: game-inventory
const componentTitle = 'My Lands' // ex: Inventory
const hasTab = false // true if this component has tabs
const tabNames = ['A', 'B', 'C', 'D', 'E'] // tab display names

const Styles = styled.div`
/* This is required to make the table full-width */
display: block;
max-width: 100%;

/* This will make the table scrollable when it gets too small */
.tableWrap {
    display: block;
    max-width: 100%;
    overflow-x: auto;
    overflow-y: hidden;
}

table {
    /* Make sure the inner table is always as wide as needed */
    width: 100%;
    border-spacing: 0;

    tr {
      :last-child {
        td {
          border-bottom: 0;
        }
      }
    }

    th,
    td {
        text-align: center;
        color: white;
        margin: 0;
        padding: 0.5rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.2);

        /* The secret sauce */
        /* Each cell should grow equally */
        width: 1%;
        /* But "collapsed" cells should be as small as possible */
        &.collapse {
            width: 0.0000000001%;
        }

        :last-child {
            border-right: 0;
        }
    }
}

.pagination {
    padding: 0.5rem;
}
`

function LandsOwner/* Component_Name_You_Want */(props) {
    const [ currentTabIndex, setCurrentTabIndex ] = useState(0)
    const tabChanged = (index) => {
        if ( currentTabIndex === index ) {
            return
        }
        setCurrentTabIndex(index)
    }

    const [onLoading, setOnLoading] = useState(false)
    const [doingAction, setDoingAction] = useState(false)
    const [ownedLandsData, setOwnedLandsData] = useState(props.ownedLandsData);
    const constLandData = useRef(props.ownedLandsData)
    const [landList, setLandList] = useState([])
    useEffect(() => {
      props.callback_getAllLands();
    }, []);
    useEffect(() => {
      setOwnedLandsData(props.ownedLandsData);
      if ( props.ownedLandsData != undefined ) {
        constLandData.current = JSON.parse(JSON.stringify(props.ownedLandsData))
      }
    }, [props.ownedLandsData]);
    useEffect(() => {
      setOnLoading(ownedLandsData.success == undefined);
      setLandList(ownedLandsData.crown ? ownedLandsData.landList : []);
    }, [ownedLandsData]);

    const onVisitLand = (idLandInstance) => {
      playSound("button");
      props.callback_onVisitLand({id: idLandInstance});
      setDoingAction(true);
    };

    const [confirmModalOpen, setConfirmModalOpen] = useState(false)
    const onCloseConfirmModal = () => {
        setConfirmModalOpen(false)
    }
    const [confirmAction, setConfirmAction] = useState('')
    const [actionLand, setActionLand] = useState(null) // idLandInstance
    const onStackLand = (idLandInstance) => {
      setActionLand(idLandInstance)
      setConfirmAction('stake')
      setConfirmModalOpen(true)
    }
    const onUnstakeLand = (idLandInstance) => {
      setActionLand(idLandInstance)
      setConfirmAction('unstake')
      setConfirmModalOpen(true)
    }

    const getEventFromBE = async (newStatus, toastLoading) => {
      const maxTimeout = 5;
      let serverApproved = false;
      let wait = 1;

      let i;
      for ( i = 0 ; i < maxTimeout ; i++ ) {
          await axios.post('/api/m1/land/isStake', {
              address: props.metamask.walletAccount,
              id: actionLand,
              newStatus: newStatus,
          })
          .then(response => {
              if(response.data.success){
                serverApproved = true;
              } 
          })
          .catch(error => {
              error.response.status == 500
              && props.callback_Logout()
      
              error.response.status == 401
              && props.callback_Logout()
          })
          
          console.log('checking event handler', i)

          serverApproved ?
          i = maxTimeout :
          await new Promise(resolve => setTimeout(resolve, wait * 1000));
      }
      
      console.log('done', serverApproved)
      if ( serverApproved ) {
          toast.update(toastLoading, { 
              render: "Done!", 
              type: "success", 
              isLoading: false,
              autoClose: 3000  
          });
      } else {
          toast.update(toastLoading, { 
              render: "Error!", 
              type: "error", 
              isLoading: false,
              autoClose: 3000  
          });
      }
      setDoingAction(false)
      props.callback_getAllLands();
    }

    const setLand = async (newStatus) => {
      const actionToDo = (newStatus ? 'Staking' : 'Unstaking');
      console.log(actionToDo, actionLand, newStatus);

      let stake = null;
      let isApproved = null;
      let approve = null;
      let receipt = null;
  
      console.log('contract addresses', props.ERCStaking.contractLand, props.ERC721.contractLand);

      let contractAddress =  props.ERCStaking.contractLand
      let contract = new ethers.Contract(contractAddress, props.ERCStaking.ABI, props.metamask.walletSigner);
      let contractAddress721 =  props.ERC721.contractLand
      let contract721 = new ethers.Contract(contractAddress721, props.ERC721.ABI, props.metamask.walletSigner);

      try{
          if ( newStatus ) {
            console.log('getApproved');
            isApproved = await contract721.getApproved(actionLand)
            if ( isApproved != contractAddress ) {
              console.log('approve begin');
              approve = await contract721.approve(contractAddress, actionLand);
              if(approve){
                let toastLoading = toast.loading('Approving... Almost done!')
                receipt = await approve.wait();
                console.log(receipt);
                toast.update(toastLoading, { 
                  render: "Done! You can stake now", 
                  type: "success", 
                  isLoading: false,
                  autoClose: 2000  
                });
              }
            }
            console.log('stack begin');
            stake = await contract.stake(actionLand);
            if ( stake ) {
              let toastLoading = toast.loading(actionToDo + '... Almost done!');
              receipt = await stake.wait();
              console.log(receipt);
              getEventFromBE(newStatus, toastLoading);
            }
          } else {
            console.log('unstack begin');
            stake = await contract.unstake(actionLand);
            if ( stake ) {
                let toastLoading = toast.loading(actionToDo + '... Almost done!')
                receipt = await stake.wait();
                console.log(receipt);
                getEventFromBE(newStatus, toastLoading);
            }
          }
      } catch ( err ) {
          console.log('error occurred');
          toast.error(err.message)
          setDoingAction(false)
          props.callback_getAllLands();
      }
    }

    const onDoAction = () => {
      setDoingAction(true)
      onCloseConfirmModal()
      if ( confirmAction == 'stake' ) { // stake
        setLand(true);
      } else if ( confirmAction == 'unstake' ) { // unstake
        setLand(false);
      }
    }

    const RowCell = ({ row }) => {
      return <>{row.index + 1}</>;
    };
  
    const ImageCell = ({ row }) => {
      return (
        <img
          src={row.values.image ? row.values.image : defaultLandView}
          className="land-image"
        />
      );
    };
  
    //IF Stakable == True => All Stake-Btns. IF Stakable == False: One only Unstake-Btn
    const StackCell = ({ row }) => {
      return (
        <>
        { (constLandData.current.stakable) ?
        <IconButton
          className="iconBtn stakeBtn"
          onClick={() => { onStackLand(row.values.id) }}
          aria-label="stake"
        >
          <LocationOnIcon />
        </IconButton> :
        (constLandData.current.unstakable != undefined && constLandData.current.unstakable.isUnstakable && row.values.stake) ?
        <IconButton
          className="iconBtn unstakeBtn"
          onClick={() => { onUnstakeLand(row.values.id) }}
          aria-label="unstake"
        >
          <LocationOffIcon />
        </IconButton>
        : row.values.stake ? <div className='unstakableMessage'>{constLandData.current.unstakable != undefined && constLandData.current.unstakable.unstakableMessage}</div> : null
        }
        </>
      );
    };
  
    //IF row.Stake == True => Open-Btn
    const VisitCell = ({ row }) => {
      return (
        <>
          {row.values.stake ? (
            <>
              <IconButton
                className="iconBtn visitBtn"
                onClick={() => { onVisitLand(row.values.id) }}
                aria-label="visit"
              >
                <ArrowCircleRightIcon />
              </IconButton>
            </>
          ) : (
            <div className="notAllowedText">Not Staked</div>
          )}
        </>
      );
    };

    const columns = useMemo(
        () => [
          {
            Header: "#",
            accessor: "id",
            Cell: RowCell,
            isVisible: true,
          },
          {
            Header: "View",
            accessor: "image",
            Cell: ImageCell,
            isVisible: true,
          },
          {
            Header: "Staking",
            accessor: "stake",
            Cell: StackCell,
            isVisible: true,
          },
          {
            Header: "Visit",
            accessor: "visit",
            Cell: VisitCell,
            isVisible: true,
          },
        ],
        []
    );
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        prepareRow,

        setHiddenColumns,
        page, // Instead of using 'rows', we'll use page,
        // which has only the rows for the active page
    
        // The rest of these things are super handy, too ;)
        canPreviousPage,
        canNextPage,
        pageOptions,
        pageCount,
        gotoPage,
        nextPage,
        previousPage,
        setPageSize,
        state: { pageIndex, pageSize },
    } = useTable(
        {
            columns,
            data: landList,
            initialState: { pageIndex: 0, pageSize: 5 }
        },
        usePagination
    )

    useEffect(() => {
        setHiddenColumns(
          columns.filter(column => !column.isVisible).map(column => column.accessor)
        );
    }, [setHiddenColumns, columns])
    
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
                        <span className={'loader'}></span>
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
                        <Styles>
                            <div className="tableWrap land-table">
                                <table {...getTableProps()}>
                                    <thead>
                                        {headerGroups.map((headerGroup, hgIndex) => (
                                        <tr key={hgIndex} {...headerGroup.getHeaderGroupProps()}>
                                            {headerGroup.headers.map((column, cIndex) => (
                                            <th key={cIndex} {...column.getHeaderProps()}>
                                                {column.render('Header')}
                                            </th>
                                            ))}
                                    </tr>
                                    ))}
                                    </thead>
                                    <tbody {...getTableBodyProps()}>
                                        {page?.map((row, rIndex) => {
                                            prepareRow(row);
                                            return (
                                                <tr key={rIndex} id={row.values.id} {...row.getRowProps()}>
                                                    {row?.cells.map((cell, cIndex) => {
                                                        return <td key={cIndex} {...cell.getCellProps()}>
                                                            {cell.render('Cell')}
                                                        </td>;
                                                    })}
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            <div className="pagination">
                                <img 
                                src={iconBack}
                                className={!canPreviousPage ? 'back-page page-disabled' : 'next-page'}
                                disabled={!canPreviousPage}
                                onClick={() => {
                                    playSound('touch')
                                    previousPage()
                                } }
                                />

                                <img 
                                src={iconForward}
                                className={!canNextPage ? 'next-page page-disabled' : 'next-page'}
                                disabled={!canNextPage}
                                onClick={() => {
                                    playSound('touch')
                                    nextPage()
                                }}
                                />
                            </div>
                        </Styles>
                    </div>
                </div>
            </div>
        </div>

        <ToastContainer 
            position="top-right"
            autoClose={1500}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
        />

        <props.ConfirmContext.ConfirmationDialog
          open={confirmModalOpen}
          onClose={onCloseConfirmModal}
        >
          <DialogTitle>
          </DialogTitle>
          <DialogContent>
            <div className='confirmText'>
              {confirmAction == 'stake' ? 'Do you want to stake?' :
              confirmAction == 'unstake' ? 'Do you want to unstake?' : null}
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={onDoAction} autoFocus>
                Sure
            </Button>
          </DialogActions>
        </props.ConfirmContext.ConfirmationDialog>
    </>)
}

export default LandsOwner // Component_Name_You_Want