import './gamecities.scss';

import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  usePagination,
  useTable,
} from 'react-table';
import styled from 'styled-components';

import ArrowCircleRightIcon from '@mui/icons-material/ArrowCircleRight';
import CallReceivedIcon from '@mui/icons-material/CallReceived';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import InfoIcon from '@mui/icons-material/Info';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import PhishingIcon from '@mui/icons-material/Phishing';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import TransferWithinAStationIcon
  from '@mui/icons-material/TransferWithinAStation';
import UpgradeIcon from '@mui/icons-material/Upgrade';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import {
  CircularProgress,
  DialogContent,
  DialogTitle,
  IconButton,
} from '@mui/material';

import iconBack from '../../assets-game/arrow_back.svg';
import iconForward from '../../assets-game/arrow_forward.svg';
import { playSound } from '../../utils/sounds';

const classNameForComponent = 'game-cities' // ex: game-inventory
const componentTitle = 'Cities' // ex: Inventory
const hasTab = false // true if this component has tabs
const tabNames = ['A', 'B', 'C', 'D', 'E'] // tab display names
const defaultAvatar = 'https://ancient-society.s3.eu-central-1.amazonaws.com/placeholder/no-image.webp'
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

function GameCities/* Component_Name_You_Want */(props) {
    const [ currentTabIndex, setCurrentTabIndex ] = useState(0)
    const tabChanged = (index) => {
        if ( currentTabIndex === index ) {
            return
        }
        setCurrentTabIndex(index)
    }

    const [onLoading, setOnLoading] = useState(false)
    const [doingAction, setDoingAction] = useState(false)
    const [delegatedCities, setDelegatedCities] = useState([])
    useEffect(() => {
        props.callback_getDelegatedCities()
    }, [])
    useEffect(() => {
        setDelegatedCities(props.cities)
    }, [props.cities])
    useEffect(() => {
        setOnLoading(delegatedCities.length == 0)
    }, [delegatedCities])


    const formatDisOwner = (disOwner) => {
        return disOwner.length > 15 ? disOwner.slice(0, 10) + '..' : disOwner
    }
    const RowCell = ({ row }) => {
        return <>{row.index + 1}</>
    }
    const DisOwnerCell = ({ row }) => {
        return <>{formatDisOwner(row.values.disOwner)}</>
    }
    const ImageOwnerCell = ({ row }) => {
        return <img 
            src={row.values.imageOwner ? row.values.imageOwner : defaultAvatar} 
            className='avatar'
        />
    }
    const InfoCell = ({ row }) => {
        return  <IconButton className='iconBtn infoIcon' onClick={() => onInfoBtnClick(row.values)} aria-label="info">
                    <InfoIcon />
                </IconButton>
    }
    const VisitCell = ({ row }) => {
        return <>
            {row.values.isAllowed ? <>
                <IconButton className='iconBtn visitIcon' onClick={() => onDelegate(row.values.id, row.values.delegations)} aria-label="visit">
                    <ArrowCircleRightIcon />
                </IconButton>
            </> : <div className='notAllowedText'>Not Allowed</div>}
        </>
    }

    const columns = useMemo(
        () => [
          {
            Header: 'ID',
            accessor: 'id',
            isVisible: false
          },
          {
            Header: 'Owner',
            accessor: 'disOwner',
            Cell: DisOwnerCell,
            isVisible: true
          },
          {
            Header: 'View',
            accessor: 'imageOwner',
            Cell: ImageOwnerCell,
            isVisible: true
          },
          {
            Header: '',
            accessor: 'isAllowed',
            isVisible: false
          },
          {
            Header: 'Info',
            accessor: 'delegations',
            Cell: InfoCell,
            isVisible: true
          },
          {
            Header: 'Visit',
            accessor: 'visit',
            Cell: VisitCell,
            isVisible: true
          }
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
            data: delegatedCities,
            initialState: { pageIndex: 0, pageSize: 5 }
        },
        usePagination
    )

    useEffect(() => {
        setHiddenColumns(
          columns.filter(column => !column.isVisible).map(column => column.accessor)
        );
    }, [setHiddenColumns, columns])
    
    const [confirmModalOpen, setConfirmModalOpen] = useState(false)
    const [curDelegate, setCurDelegate] = useState({})
    const onCloseConfirmModal = () => {
        setConfirmModalOpen(false)
    }
    const onInfoBtnClick = (row) => {
        playSound('button')
        setCurDelegate(row)
        setConfirmModalOpen(true)
    }
    const onDelegate = (id, delegations) => {
        playSound('button')
        onCloseConfirmModal()
        let delegationData = {}
        for ( let delegation of delegations ) {
            delegationData[delegation.type] = delegation.allowed
        }
        props.callback_onDelegate(id, delegationData)
        setDoingAction(true)
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
                        {(onLoading || doingAction) && <div className='backDrop' onClick={(e) => {e.stopPropagation()}}>
                            <CircularProgress size={50} sx={{color:"gold"}} />
                        </div>}
                        { hasTab && 
                        <div className='tab-content'>
                            {/* add tab content here */}
                            <span  style={{color: 'white'}}> {currentTabIndex + 1}th Tab </span>
                        </div>}
                        <Styles>
                            <div className="tableWrap city-table">
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
        <props.ConfirmContext.ConfirmationDialog
            open={confirmModalOpen}
            onClose={onCloseConfirmModal}
        >
            <DialogTitle>
                <div className='visit-city-info'>
                Permissions in <span>{`${curDelegate.disOwner ? formatDisOwner(curDelegate.disOwner) : ''}`}</span>
                </div>
            </DialogTitle>
            <DialogContent className='delegation-list'>
                { curDelegate.delegations && curDelegate.delegations.map((delegation, index) => (
                    <div className={'delegation-info'} key={index} >
                        <DelegationIcon
                            allowed={delegation.allowed}
                            type={delegation.type}
                            />
                        <div className='delegationType'>
                            {delegation.type}
                            { !delegation.allowed && <div className='notAllowedText'>
                                Not Allowed
                            </div>}
                        </div>
                    </div>
                )
                )}
            </DialogContent>
        </props.ConfirmContext.ConfirmationDialog>
    </>)
}

function DelegationIcon ({allowed, type}) {
    return <>
        <IconButton className={'delegateBtn' + (allowed ? ' show' : '')} aria-label="delegate">        
        {
            type == 'claim' ? <CallReceivedIcon /> :
            type == 'upgrade' ? <UpgradeIcon /> :
            type == 'marketplace' ? <CurrencyExchangeIcon /> :
            type == 'shop' ? <ShoppingCartIcon /> :
            type == 'transfer' ? <TransferWithinAStationIcon /> :
            type == 'profile' ? <ManageAccountsIcon /> :
            type == 'fisherman' ? <PhishingIcon /> :
            type == 'inventory' ? <WarehouseIcon /> :
            null
        }
        </IconButton>
    </>
}

export default GameCities // Component_Name_You_Want