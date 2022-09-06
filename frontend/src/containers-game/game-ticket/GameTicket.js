import './game-ticket.scss';

// import '../../json-mockup';
import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import axios from 'axios';
import {
  usePagination,
  useTable,
} from 'react-table';
import styled from 'styled-components';

import BackspaceIcon from '@mui/icons-material/Backspace';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import MenuIcon from '@mui/icons-material/Menu';
import SellIcon from '@mui/icons-material/Sell';
import {
  Button,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  TextField,
} from '@mui/material';

import iconBack from '../../assets-game/arrow_back.svg';
import iconForward from '../../assets-game/arrow_forward.svg';
import { playSound } from '../../utils/sounds';
import {
  getShortData,
  isENS,
  resolveENS,
} from '../../utils/utils';

const classNameForComponent = 'game-ticket' // ex: game-inventory
const componentTitle = 'Tickets' // ex: Inventory
const hasTab = true // true if this component has tabs
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

function GameTicket/* Component_Name_You_Want */(props) {
    const [ onLoading, setOnLoading ] = useState(false)

    const [ landData, setLandData ] = useState(props.landData)
    useEffect(() => { setLandData(props.landData) }, [props.landData])

    const [constTicketData, setConstTicketData] = useState(null)
    const [ticketData, setTicketData] = useState([])
    useEffect(() => {
        reloadData()
    }, [])

    const reloadData = () => {
        setOnLoading(true)
        axios({
            method: 'post',
            url: '/api/m1/land/getTicketsOwner',
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
                    setConstTicketData(res)
                    if ( detailView ) {
                        updateSelectedTicket([...res.generatedTickets, ...res.sellingTickets, ...res.otherTickets])
                    }
                    setTicketData([...res.generatedTickets, ...res.sellingTickets, ...res.otherTickets])
                    setOnLoading(false)
                } else {
                    setConfirmActionType('get');
                    onDidAction(response);
                    const res = {generatedTickets: [], sellingTickets: [], otherTickets: []};
                    setConstTicketData([...res.generatedTickets, ...res.sellingTickets, ...res.otherTickets])
                    setTicketData([...res.generatedTickets, ...res.sellingTickets, ...res.otherTickets])
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
    }

    const updateSelectedTicket = (tickets) => {
        for ( const ticket of tickets ) {
            if ( selectedTicket.idTicket == ticket.idTicket ) {
                setSelectedTicket(ticket);
                break;
            }
        }
    }

    const [ currentTabIndex, setCurrentTabIndex ] = useState(0)
    const tabChanged = (index) => {
        if ( currentTabIndex === index ) {
            return
        }
        setCurrentTabIndex(index)
        if ( tabNames[index] == 'All' ) {
            setTicketData([...constTicketData.generatedTickets, ...constTicketData.sellingTickets, ...constTicketData.otherTickets])
        } else if ( tabNames[index] == 'onSale' ) {
            setTicketData([...constTicketData.sellingTickets])
        } else if ( tabNames[index] == 'Sent/Used/Expired' ) {
            setTicketData([...constTicketData.otherTickets])
        }
    }

    const IdTicketCell = ({ row }) => {
        return <>#{row.values.idTicket}</>;
    };
    const TypeCell = ({ row }) => {
        return <>{row.values.type}</>;
    };
    const StatusCell = ({ row }) => {
        return <>
        <div className="status">
            <div className={"status-mark " + row.values.status}>
                {row.values.status == 'active' ? 'Sale' : row.values.status}
            </div>
        </div>
        </>;
    };
    const ActionCell = ({ row }) => {
        return <>
            <IconButton
            className={"actionBtn " + ((row.values.menu.view == 0 && row.values.menu.sell == 0 && row.values.send == 0) ? 'notAllowed' : '')}
            onClick={() => { onShowActionMenu(row.values) }}
            aria-label="stake"
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
            Cell: IdTicketCell,
            isVisible: true,
        },
        {
            Header: "Type",
            accessor: "type",
            Cell: TypeCell,
            isVisible: true,
        },
        {
            Header: "",
            accessor: "status",
            Cell: StatusCell,
            isVisible: true,
        },
        {
            Header: "",
            accessor: "menu",
            Cell: ActionCell,
            isVisible: true,
        },
        {
            Header: "",
            accessor: "price",
            isVisible: false,
        },
        {
            Header: "",
            accessor: "idTicketMarketplace",
            isVisible: false,
        },
        {
            Header: "",
            accessor: "endingTime",
            isVisible: false,
        },
        {
            Header: "",
            accessor: "revoke",
            isVisible: false,
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
    const onShowActionMenu = (ticket) => {
        console.log(ticket);
        setSelectedTicket(ticket);
        setDetailView(true);
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
        if ( confirmActionType == 'sell' ) {
            axios({
                method: 'post',
                url: '/api/m1/land/createListingTicket',
                data: {
                    address: props.metamask.walletAccount,
                    idTicket: selectedTicket.idTicket,
                    price: ticketCost
                }
            })
            .then(response => {
                onDidAction(response);
            })
            .catch(error => {
                error.response.status == 500 && props.callback_Logout()
                error.response.status == 401 && props.callback_Logout()
            })
        } else if ( confirmActionType == 'unSell' ) {
            axios({
                method: 'post',
                url: '/api/m1/land/removeListingTicket',
                data: {
                    address: props.metamask.walletAccount,
                    idTicket: selectedTicket.idTicket,
                    idTicketMarketplace: selectedTicket.idTicketMarketplace
                }
            })
            .then(response => {
                onDidAction(response);
            })
            .catch(error => {
                error.response.status == 500 && props.callback_Logout()
                error.response.status == 401 && props.callback_Logout()
            })
        } else if ( confirmActionType == 'send' ) {
            axios({
                method: 'post',
                url: '/api/m1/land/sendTicket',
                data: {
                    address: props.metamask.walletAccount,
                    receiver: sendResolvedAddress,
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
        } else if ( confirmActionType == 'delete' ) {
            axios({
                method: 'post',
                url: '/api/m1/land/deleteTicket',
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
        } else if ( confirmActionType == 'revoke' ) {
            axios({
                method: 'post',
                url: '/api/m1/land/revokeTicket',
                data: {
                    address: props.metamask.walletAccount,
                    idTicket: selectedTicket.idTicket
                }
            })
            .then(response => {
                if ( response.data.success ) {
                    setSelectedTicket(response.data.data);
                }
                onDidAction(response);
            })
            .catch(error => {
                error.response.status == 500 && props.callback_Logout()
                error.response.status == 401 && props.callback_Logout()
            })
        }
    }

    const [ticketCost, setTicketCost] = useState(0)

    // response process
    const [actionResModalOpen, setActionResModalOpen] = useState(false)
    const [actionRes, setActionRes] = useState(null)
    const [resActionType, setResActionType] = useState('')
    const onDidAction = (response) => {
        console.log(response)
        playSound(confirmActionType)
        if ( response.data.success ) {
            const res = response.data.data;
            console.log(res);
            if ( confirmActionType == 'sell' ) {
            } else if ( confirmActionType == 'unSell' ) {
            } else if ( confirmActionType == 'send' ) {
            } else if ( confirmActionType == 'delete' ) {
                setDetailView(false);
            } else if ( confirmActionType == 'revoke' ) {
            }
            reloadData();
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

    const [ sendAddress, setSendAddress ] = useState('')
    const [ sendResolvedAddress, setSendResolvedAddress ] = useState('')
    useEffect(() => {
        async function resolve(){ setSendResolvedAddress(await resolveENS(sendAddress)) }
        resolve();
    }, [sendAddress])
    const [sendAddressErrorName, setSendAddressErrorName] = useState('')

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
                        {detailView ?
                        <div className='detailView'>
                            <div className='backBtn' onClick={onCloseDetailView}>
                                <img className='backImg' src={iconBack} />
                                <span className='backText'>Back</span>
                            </div>
                            <div className='detail-info'>
                                <div className='ticket-info'>
                                    <div className='info-spec'><a>#TicketID : </a><p>#{selectedTicket.idTicket}</p></div>
                                    <div className='info-spec'><a>Type : </a><p>{selectedTicket.type}</p></div>
                                    <div className='info-spec'><a>Status : </a>
                                        <div className='view-panel-mark'>
                                            <div className="status">
                                                <div className={"status-mark " + selectedTicket.status}>
                                                    {selectedTicket.status == 'onSale' ? 'Sale' : selectedTicket.status}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {selectedTicket.status == 'active' && <div className='info-spec'><a>Price : </a><p>{selectedTicket.price}</p> <img src={ANCIEN_IMAGE} className='priceUnitImg' /> </div>}
                                    {selectedTicket.status == 'active' && <div className='info-spec'><a>EndingTime : </a><p>{getShortData(selectedTicket.endingTime)}</p></div>}
                                    {selectedTicket.revoke == 1 && <div className='info-spec'>
                                        <a>You can revoke : </a>
                                        <Button 
                                            variant="contained" 
                                            className={'revokeBtn'}
                                            onClick={() => { onDoAction('revoke') }}
                                        >Revoke</Button>
                                    </div>}
                                </div>
                                <div className='sell-panel'>
                                    <div className='iconActionBar'>
                                        <div className='sell-input'>
                                            <input 
                                                className={'ticketCostInput' + ((selectedTicket.menu.sell == 0 || selectedTicket.type == 'free') ? ' notAllowed' : '')}
                                                disabled={selectedTicket.menu.sell == 0 || selectedTicket.type == 'free'}
                                                placeholder='0.00'
                                                type='number'
                                                maxLength="5"
                                                step=".01"
                                                value={ticketCost}
                                                onKeyPress={(e) => {
                                                    if (e.code === 'Minus') {
                                                        e.preventDefault();
                                                    } else if (e.code === 'NumpadSubtract') {
                                                        e.preventDefault();
                                                    } else if (e.code === 'Equal') {
                                                        e.preventDefault();
                                                    } else if (e.code === 'NumpadAdd') {
                                                        e.preventDefault();
                                                    } else if (e.code === 'Comma') {
                                                        e.preventDefault();
                                                    } else if (e.code === 'KeyE') {
                                                        e.preventDefault();
                                                    }
                                                }}
                                                onChange={(e) => {
                                                    let cost = '';
                                                    if ( e.target.value == 0 || e.target.value == '' ) {
                                                        cost = e.target.value;
                                                    } else if ( e.target.value.toString().length > 8 ) {
                                                        null
                                                    } else if ( e.target.value.toString().split('.').length > 1 && e.target.value.toString().split('.')[1].length > 2 ) {
                                                        cost = Math.max(Number(e.target.value).toFixed(2), 0);
                                                    } else {
                                                        cost = Math.max(0, e.target.value);
                                                    }
                                                    setTicketCost(cost);
                                                }}
                                            />
                                            <img className='priceUnitImg' src={ANCIEN_IMAGE} />
                                        </div>

                                        <div className='iconAction'>
                                            <IconButton
                                                className={"iconBtn sellBtn" + ((selectedTicket.menu.sell == 0 || selectedTicket.type == 'free' || ticketCost == '' || ticketCost <= 0) ? ' notAllowed' : '')}
                                                onClick={() => { onDoAction('sell') }}
                                                aria-label="sell"
                                                >
                                                <SellIcon />
                                            </IconButton>
                                            <p>Sell</p>
                                        </div>
                                        <div className='iconAction'>
                                            <IconButton
                                                className={"iconBtn unSellBtn" + (selectedTicket.status != 'active' ? ' notAllowed' : '')}
                                                onClick={() => { onDoAction('unSell') }}
                                                aria-label="unSell"
                                                >
                                                <BackspaceIcon />
                                            </IconButton>
                                            <p>un-Sell</p>
                                        </div>
                                        <div className='iconAction'>
                                            <IconButton
                                                className={"iconBtn deleteBtn" + (selectedTicket.status != 'generated' ? ' notAllowed' : '')}
                                                onClick={() => { onDoAction('delete') }}
                                                aria-label="delete"
                                                >
                                                <DeleteForeverIcon />
                                            </IconButton>
                                            <p>Delete</p>
                                        </div>
                                    </div>
                                    <div className='send-panel'>
                                        <TextField
                                            onChange={(e) => {
                                                    var address = e.target.value
                                                    let regex=/^0x[a-fA-F0-9]{40}$/
                                                    if ( regex.test(address) || isENS(address) ) {
                                                        setSendAddressErrorName('')
                                                        setSendAddress(e.target.value)
                                                    } else {
                                                        setSendAddressErrorName('Invalid format address')
                                                        setSendAddress(e.target.value)
                                                    }
                                                }}
                                            value={sendAddress}
                                            disabled={selectedTicket.menu.send == 0 || selectedTicket.type == 'paid'}
                                            placeholder={'0x000000 / ens.eth'}
                                            label="Address" 
                                            variant="filled"
                                            helperText={sendAddressErrorName}
                                            error={!!sendAddressErrorName}
                                            required
                                            />
                                        <Button 
                                            variant="contained" 
                                            className={'sendBtn' + ((selectedTicket.menu.send == 0 || selectedTicket.type == 'paid' || !!sendAddressErrorName || sendAddress == '') ? ' notAllowed' : '')}
                                            onClick={() => { onDoAction('send') }}
                                        >Send</Button>
                                    </div>
                                </div>
                            </div>
                        </div> : 
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
                        }
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
                        Do you want to {confirmActionType == 'send' ? `send to "${sendResolvedAddress}"` : 
                        confirmActionType == 'sell' ? 'put on marketplace' :
                        confirmActionType == 'unSell' ? 'remove from marketplace' :
                        confirmActionType == 'delete' ? 'delete' : 
                        confirmActionType == 'revoke' ? 'revoke' : ''}?
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
                    <DialogContentText>
                        {actionRes?.data.success ? 'Successfully done!' : actionRes?.data.error || 'Error occurred!'}
                    </DialogContentText>
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

export default GameTicket // Component_Name_You_Want