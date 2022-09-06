import './ticket-marketplace.scss';

// import '../../json-mockup';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import axios from 'axios';
import {
  usePagination,
  useTable,
} from 'react-table';
import styled from 'styled-components';

import MenuIcon from '@mui/icons-material/Menu';
import PaidOutlinedIcon from '@mui/icons-material/PaidOutlined';
import ThumbDownAltOutlinedIcon from '@mui/icons-material/ThumbDownAltOutlined';
import ThumbUpAltOutlinedIcon from '@mui/icons-material/ThumbUpAltOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import {
  Button,
  Checkbox,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
} from '@mui/material';

import iconBack from '../../assets-game/arrow_back.svg';
import iconForward from '../../assets-game/arrow_forward.svg';
import { playSound } from '../../utils/sounds';
import { getShortData } from '../../utils/utils';

const classNameForComponent = 'ticket-marketplace' // ex: game-inventory
const componentTitle = 'Ticket-Marketplace' // ex: Inventory
const hasTab = false // true if this component has tabs
const tabNames = ['All', 'onSale', 'Sent/Used/Expired'] // tab display names

const ANCIEN_IMAGE = 'https://ancient-society.s3.eu-central-1.amazonaws.com/resources/ancien.webp' 

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

function TicketMarketplace/* Component_Name_You_Want */(props) {
    const [ onLoading, setOnLoading ] = useState(false)

    const [ landData, setLandData ] = useState(props.landData)
    useEffect(() => { setLandData(props.landData) }, [props.landData])

    const [hasBought, setHasBought] = useState(false)
    const [ticketData, setTicketData] = useState([])
    const [ticketContractData, setTicketContractData] = useState({})
    useEffect(() => {
        reloadData();
    }, [])
    const reloadData = () => {
        setDetailView(false);
        setOnLoading(true)
        axios({
            method: 'post',
            url: '/api/m1/land/getTicketMarketplace',
            data: {
                address: props.metamask.walletAccount,
                idLandInstance: landData.info.id
            }
        })
        .then(response => {
            try {
                if (response.data.success) {
                    const res = response.data.data
                    console.log(res)
                    setHasBought(res.hasBought)
                    if ( res.hasBought ) {
                        setTicketContractData(res.data)
                    } else {
                        setTicketData(res.data)
                    }
                    setOnLoading(false)
                }
            } catch ( err ) {
                console.error(err)
            }
        })
        .catch(error => {
            error.response.status == 500 && props.callback_Logout()
            error.response.status == 401 && props.callback_Logout()
        })
    };

    const [ currentTabIndex, setCurrentTabIndex ] = useState(0)
    const tabChanged = (index) => {
        if ( currentTabIndex === index ) {
            return
        }
        setCurrentTabIndex(index)
    }

    const RowCell = ({ row }) => {
        return <>{row.index + 1}</>;
    };
    const PriceCell = ({ row }) => {
        return <>{parseFloat(row.values.price).toFixed(2)}</>;
    };
    const CreationTimeCell = ({ row }) => {
        return <>{getShortData(row.values.creationTime)}</>;
    };
    const EndingTimeCell = ({ row }) => {
        return <>{getShortData(row.values.endingTime)}</>;
    };
    const StatusCell = ({ row }) => {
        return <>
        <div className="status">
            <div className={"status-mark " + row.values.status}>
                {row.values.status == 'onSale' ? 'Sale' : row.values.status}
            </div>
        </div>
        </>;
    };
    const ActionCell = ({ row }) => {
        return <>
            <IconButton
                className={"buyBtn " + (!row.values.isBuyable ? 'notAllowed' : '')}
                onClick={() => { onBuyBtnClick(row.values) }}
                aria-label="buy"
                >
                <PaidOutlinedIcon />
            </IconButton>
            <IconButton
                className={"detailBtn"}
                onClick={() => { onShowBtnClick(row.values) }}
                aria-label="detail"
                >
                <MenuIcon />
            </IconButton>
        </>;
    };

    const columns = useMemo(
        () => [
        {
            Header: "ID",
            accessor: "idTicket",
            Cell: RowCell,
            isVisible: true,
        },
        {
            Header: "Price",
            accessor: "price",
            Cell: PriceCell,
            isVisible: true,
        },
        {
            Header: "Created",
            accessor: "creationTime",
            Cell: CreationTimeCell,
            isVisible: false,
        },
        {
            Header: "End",
            accessor: "endingTime",
            Cell: EndingTimeCell,
            isVisible: true,
        },
        {
            Header: "",
            accessor: "marketStatus",
            Cell: StatusCell,
            isVisible: false,
        },
        {
            Header: "",
            accessor: "isBuyable",
            Cell: ActionCell,
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
            data: ticketData,
            initialState: { pageIndex: 0, pageSize: 10 }
        },
        usePagination
    )

    useEffect(() => {
        setHiddenColumns(
        columns.filter(column => !column.isVisible).map(column => column.accessor)
        );
    }, [setHiddenColumns, columns])

    const [detailView, setDetailView] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);

    const constTicketData = useRef();
    useEffect(() => {
        constTicketData.current = JSON.parse(JSON.stringify(ticketData))
    }, [ticketData])
    const onShowBtnClick = (ticket) => {
        setDoingAction(true);
        axios({
            method: 'post',
            url: '/api/m1/land/getInstanceTicket',
            data: {
                address: props.metamask.walletAccount,
                idTicket: ticket.idTicket
            }
        })
        .then(response => {
            try {
                if (response.data.success) {
                    const res = response.data.data
                    setTicketData(constTicketData.current.map((ticketRow) => {
                        return ticketRow.idTicket != res.ticket.idTicket ? 
                            ticketRow : 
                            {...ticketRow, endingTime: res.ticket.endingTime, price: res.ticket.price}
                    }))
                    setSelectedTicket({...res.ticket, isBuyable: ticket.isBuyable})
                    setDoingAction(false)
                    setDetailView(true)
                }
            } catch ( err ) {
                console.error(err)
            }
        })
        .catch(error => {
            error.response.status == 500 && props.callback_Logout()
            error.response.status == 401 && props.callback_Logout()
        })
    }
    const onBuyBtnClick = (ticket) => {
        setSelectedTicket(ticket);
        onDoAction('buy');
    }
    const onCloseDetailView = (e) => {
        setDetailView(false);
    }

    const [ doingAction, setDoingAction ] = useState(false);
    const [ confirmActionType, setConfirmActionType ] = useState('');
    const [ confirmModalOpen, setConfirmModalOpen ] = useState(false);
    const onDoAction = (actionType) => {
        setConfirmActionType(actionType)
        setConfirmModalOpen(true)
    }
    const onCloseConfirmModal = () => {
        setConfirmModalOpen(false);
    }
    const proceedAction = () => {
        onCloseConfirmModal();
        setDoingAction(true);
        if ( confirmActionType == 'buy' ) {
            axios({
                method: 'post',
                url: '/api/m1/land/buyTicketMarketplace',
                data: {
                    address: props.metamask.walletAccount,
                    idTicket: selectedTicket.idTicket
                }
            })
            .then(response => {
                onDidAction(response);
            })
            .catch(error => {
                error.response.status == 500 && props.callback_Logout()
                error.response.status == 401 && props.callback_Logout()
            })
        } else if ( confirmActionType == 'subscribe' ) {
            axios({
                method: 'post',
                url: '/api/m1/land/subscribeTicket',
                data: {
                    address: props.metamask.walletAccount,
                    idTicket: ticketContractData.idTicket,
                    isVisitable: isPrivate ? 0 : 1
                }
            })
            .then(response => {
                console.log(response)
                try {
                    if (response.data.success) {
                        const res = response.data.data
                        props.callback_visitLand({id: landData.info.id});
                        // setTicketContractData({...ticketContractData, subscribe: true})
                        // setOnLoading(false)
                    }
                    onDidAction(response);
                } catch ( err ) {
                    console.error(err)
                }
            })
            .catch(error => {
                error.response.status == 500 && props.callback_Logout()
                error.response.status == 401 && props.callback_Logout()
            })
        } else if ( confirmActionType == 'unsubscribe' ) {
            axios({
                method: 'post',
                url: '/api/m1/land/unsubscribeTicket',
                data: {
                    address: props.metamask.walletAccount,
                    idTicket: ticketContractData.idTicket
                }
            })
            .then(response => {
                try {
                    if (response.data.success) {
                        // const res = response.data.data
                        // console.log(res)
                        props.callback_visitLand({id: landData.info.id});
                        // setTicketContractData({...ticketContractData, subscribe: true})
                        // setOnLoading(false)
                    }
                    onDidAction(response);
                } catch ( err ) {
                    console.error(err)
                }
            })
            .catch(error => {
                error.response.status == 500 && props.callback_Logout()
                error.response.status == 401 && props.callback_Logout()
            })
        }
    }

    // response process
    const [actionResModalOpen, setActionResModalOpen] = useState(false)
    const [actionRes, setActionRes] = useState(null)
    const [resActionType, setResActionType] = useState('')
    const onDidAction = (response) => {
        console.log(response)
        playSound(confirmActionType)
        if ( response.data.success ) {
            const res = response.data.data;
            if ( confirmActionType == 'buy' ) {
                reloadData();
            }
        }
        setActionRes(response)
        setResActionType(confirmActionType)
        setDoingAction(false)
        setActionResModalOpen(true)
    }
    const onCloseActionResModal = () => {
        setActionResModalOpen(false)
        setResActionType('')
    }

    // private process
    const [isPrivate, setIsPrivate] = useState(false)
    const onPrivateChange = () => {
        setIsPrivate(!isPrivate);
    }

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
                    { hasTab && !detailView &&
                    <div className='tab-navs'>
                        { tabNames.map((tabName, index) => (
                            <div key={index} className={'tab-nav ' + (currentTabIndex === index ? 'active' : '')} onClick={() => tabChanged(index)}>{tabName}</div>
                        ))}
                    </div>}
                    <div className='scroll-content'>
                        {!onLoading && <>
                            {hasBought ?
                            <div className='detailView'>
                                <div className='descriptionText'>
                                    You have already bought the ticket.
                                </div>
                                <div className='detail-info'>
                                    <div className='ticket-info'>
                                        <div className='info-spec'><a>Land-Bonus : </a><p>{ticketContractData.bonus}</p>%</div>
                                        <div className='info-spec'><a>Contract-Fee : </a><p>{ticketContractData.fee}</p>%</div>
                                        <div className='info-spec'><a>#TicketID : </a><p>{ticketContractData.idTicket}</p></div>
                                        <div className='info-spec'><a>Type : </a><p>{ticketContractData.ticketType}</p></div>
                                        <div className='info-spec'><a>Status : </a>
                                            <div className='view-panel-mark'>
                                                <div className="status">
                                                    <div className={"status-mark " + ticketContractData.status}>
                                                        {ticketContractData.status == 'onSale' ? 'Sale' : ticketContractData.status}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className='info-spec'><a>Price : </a><p>{ticketContractData.price}</p> <img src={ANCIEN_IMAGE} className='priceUnitImg' /> </div>
                                        <div className='info-spec'><a>EndingTime : </a><p>{getShortData(ticketContractData.endingTime)}</p></div>
                                    </div>
                                    <div className='sell-panel'>
                                        <div className='descriptionText'>
                                            {ticketContractData.subscribe == 1 ? 'You have already joined' : 'You did not join this Land yet.'}
                                        </div>
                                        <div className='iconActionBar'>
                                            <div className={'info-text' + (ticketContractData.subscribe == 1 ? ' notAllowed' : '')}>
                                                <a>Private?</a>
                                                <a>
                                                    <Checkbox
                                                        className={'ctCheckInput'}
                                                        checked={isPrivate}
                                                        onChange={onPrivateChange}
                                                        inputProps={{ 'aria-label': 'controlled' }}
                                                        icon={<VisibilityIcon />}
                                                        checkedIcon={<VisibilityOffIcon />}
                                                        /> 
                                                        {isPrivate ? 'Yes' : 'No'}
                                                </a>
                                            </div>
                                            <div className='iconAction'>
                                                <IconButton
                                                    className={"iconBtn subscribeBtn" + (ticketContractData.subscribe == 1 ? ' notAllowed' : '')}
                                                    onClick={() => { onDoAction('subscribe') }}
                                                    aria-label="subscribe"
                                                    >
                                                    <ThumbUpAltOutlinedIcon />
                                                </IconButton>
                                                <p>Join the Land</p>
                                            </div>
                                            <div className='iconAction'>
                                                <IconButton
                                                    className={"iconBtn unsubscribeBtn" + (ticketContractData.subscribe == 0 ? ' notAllowed' : '')}
                                                    onClick={() => { onDoAction('unsubscribe') }}
                                                    aria-label="unsubscribe"
                                                    >
                                                    <ThumbDownAltOutlinedIcon />
                                                </IconButton>
                                                <p>Leave the Land</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div> : <>
                            {detailView ?
                            <div className='detailView'>
                                <div className='backBtn' onClick={onCloseDetailView}>
                                    <img className='backImg' src={iconBack} />
                                    <span className='backText'>Back</span>
                                </div>
                                <div className='detail-info'>
                                    <div className='ticket-info'>
                                        <div className='info-spec'><a>Land-Bonus : </a><p>{selectedTicket.bonus}</p>%</div>
                                        <div className='info-spec'><a>Contract-Fee : </a><p>{selectedTicket.fee}</p>%</div>
                                        <div className='info-spec'><a>Con-EndingTime : </a><p>{getShortData(selectedTicket.endingTime)}</p></div>
                                        <div className='info-spec'><a>#TicketID : </a><p>{selectedTicket.idTicket}</p></div>
                                        <div className='info-spec'><a>Status : </a>
                                            <div className='view-panel-mark'>
                                                <div className="status">
                                                    <div className={"status-mark " + selectedTicket.status}>
                                                        {selectedTicket.status == 'onSale' ? 'Sale' : selectedTicket.status}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className='info-spec'><a>Price : </a><p>{selectedTicket.price}</p> <img src={ANCIEN_IMAGE} className='priceUnitImg' /> </div>
                                    </div>
                                    <div className='sell-panel'>
                                        {selectedTicket.isBuyable == 0 && <div className='descriptionText'>
                                            You haven't enough $ANCIEN to buy the ticket.
                                        </div>}
                                        <div className='iconActionBar'>
                                            <div className='iconAction'>
                                                <IconButton
                                                    className={"iconBtn buyBtn" + (selectedTicket.isBuyable == 0 ? ' notAllowed' : '')}
                                                    onClick={() => { onDoAction('buy') }}
                                                    aria-label="buy"
                                                    >
                                                    <PaidOutlinedIcon />
                                                </IconButton>
                                                <p>Buy</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div> : 
                            ticketData.length == 0 ?
                            <div className='noTicketText'>
                                No ticket in this Land - Marketplace.
                            </div> : 
                            <>
                            <div className='descriptionText'>
                                You haven't bought any ticket yet.
                            </div>
                            <Styles>
                                <div className="tableWrap ticket-table">
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
                            </>
                            }
                            </>}
                        </>}
                    </div>
                </div>
            </div>
            <props.ConfirmContext.ConfirmationDialog
                open={confirmModalOpen}
                onClose={onCloseConfirmModal}
            >
                <DialogTitle>
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to {confirmActionType} this ticket?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={proceedAction} autoFocus>
                        Sure
                    </Button>
                </DialogActions>
            </props.ConfirmContext.ConfirmationDialog>
            <props.ConfirmContext.ConfirmedDialog
                open={actionResModalOpen}
                onClose={onCloseActionResModal}
            >
                <DialogTitle>
                    {actionRes?.data.success ? 'Success!' : 'Failed!'}
                </DialogTitle>
                <DialogContent>
                    {resActionType == 'buy' && <DialogContentText>
                        {actionRes?.data.success ? 'Successfully bought!' : actionRes?.data.error}
                    </DialogContentText>}
                    {resActionType == 'subscribe' && <DialogContentText>
                        {actionRes?.data.success ? <>
                            Successfully subscribed! <br/>
                            New drop quantity: {actionRes?.data.data.newDropQuantity}
                        </> : actionRes?.data.error}
                    </DialogContentText>}
                    {resActionType == 'unsubscribe' && <DialogContentText>
                        {actionRes?.data.success ? 'Successfully unsubscribed!' : actionRes?.data.error}
                    </DialogContentText>}
                </DialogContent>
                <DialogActions>
                    <Button onClick={onCloseActionResModal} autoFocus>
                        Ok!
                    </Button>
                </DialogActions>
            </props.ConfirmContext.ConfirmedDialog>
        </div>
        {/* { onLoading ?
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
        : null } */}
    </>)
}

export default TicketMarketplace // Component_Name_You_Want