import './game-contract.scss';

// import '../../json-mockup';
import {
  useEffect,
  useState,
} from 'react';

import axios from 'axios';
import { ethers } from 'ethers';
import {
  toast,
  ToastContainer,
} from 'react-toastify';
import styled from 'styled-components';

import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import {
  Button,
  Checkbox,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

import { playSound } from '../../utils/sounds';
import { getShortData } from '../../utils/utils';

const classNameForComponent = 'game-contract' // ex: game-inventory
const componentTitle = 'Contract' // ex: Inventory
const hasTab = false // true if this component has tabs
const tabNames = ['A', 'B', 'C'] // tab display names

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

function GameContract/* Component_Name_You_Want */(props) {
    // tab manage
    const [ currentTabIndex, setCurrentTabIndex ] = useState(0)
    const tabChanged = (index) => {
        if ( currentTabIndex === index ) {
            return
        }
        setCurrentTabIndex(index)
    }

    // set landData prop to state
    const [landData, setLandData] = useState(props.landData)
    useEffect(() => { setLandData(props.landData) }, [props.landData])

    // loading contract data
    const [ onLoading, setOnLoading ] = useState(false)
    const [contractData, setContractData] = useState({})
    useEffect(() => {
        reloadData();
    }, [])
    const reloadData = () => {
        setOnLoading(true)
        axios({
            method: 'post',
            url: '/api/m1/land/getContractOwner',
            data: {
                address: props.metamask.walletAccount,
                idLandInstance: landData.info.id
            }
        })
        .then(response => {
            try {
                if (response.data.success) {
                    const res = response.data.data
                    console.log("getContractOwner res: ", res)

                    if(res?.voucherCreation){
                        onDidAction(response)
                    }
                    setContractData(res)
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

    // confirm and confirmed modals manage | api call
    const [ doingAction, setDoingAction ] = useState(false);
    const [ confirmModalOpen, setConfirmModalOpen ] = useState(false);
    const [ confirmActionType, setConfirmActionType ] = useState('');
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
        if ( confirmActionType == 'generate' ) {
            axios({
                method: 'post',
                url: '/api/m1/land/createTickets',
                data: {
                    address: props.metamask.walletAccount,
                    idLandInstance: landData.info.id,
                    idContract: contractData.contract.id,
                    quantity: ticketCount,
                    type: ticketType
                }
            })
            .then(response => {
                onDidAction(response)
            })
            .catch(error => {
                error.response.status == 500 && props.callback_Logout()
                error.response.status == 401 && props.callback_Logout()
            })
        } else if ( confirmActionType == 'create' ) {
            axios({
                method: 'post',
                url: '/api/m1/land/createContract',
                data: {
                    address: props.metamask.walletAccount,
                    idLandInstance: landData.info.id,
                    fee: fee,
                    duration: duration * 24 * 3600,
                    isPrivate: isPrivate
                }
            })
            .then(response => {
                onDidAction(response)
            })
            .catch(error => {
                error.response.status == 500 && props.callback_Logout()
                error.response.status == 401 && props.callback_Logout()
            })
        } else if ( confirmActionType == 'delete' ) {
            axios({
                method: 'post',
                url: '/api/m1/land/deleteContract',
                data: {
                    address: props.metamask.walletAccount,
                    idLandInstance: landData.info.id,
                    idContract: contractData.contract.id
                }
            })
            .then(response => {
                onDidAction(response)
            })
            .catch(error => {
                error.response.status == 500 && props.callback_Logout()
                error.response.status == 401 && props.callback_Logout()
            })
        }
    }

    const setContract = async (res, newStatus) => {
        const actionToDo = (newStatus == 'active' ? 'Creating' : 'Deleting');
        console.log(actionToDo, res);

        let contractAddress = props.ERCStaking.contractLand;
        let contract = new ethers.Contract(contractAddress, props.ERCStaking.ABI, props.metamask.walletSigner);

        let set = null;
        let receipt = null;

        try{
            if ( newStatus == 'active' ) {
                console.log('setContract begin', contract.setContract);
                console.log('setContract params', res.idContract, res.owner, res.blockNumber, res.creation, res.signature, res.idLand, res.expireTime, res.fee);
                set = await contract.setContract(res.idContract, res.owner, res.blockNumber, res.creation, res.signature, res.idLand, res.expireTime, res.fee);
                if ( set ) {
                    let toastLoading = toast.loading(actionToDo + '... Almost done!');
                    receipt = await set.wait();
                    console.log(receipt);
                    getEventFromBE(res.idContract, newStatus, toastLoading);
                }
            } else {
                console.log('deleteContract begin');
                set = await contract.deleteContract(res.idContract, res.owner, res.blockNumber, res.creation, res.signature);
                if ( set ) {
                    let toastLoading = toast.loading(actionToDo + '... Almost done!')
                    receipt = await set.wait();
                    console.log(receipt);
                    getEventFromBE(res.idContract, newStatus, toastLoading);
                }
            }
        } catch ( err ) {
            toast.error(err.message)
            setDoingAction(false)
            reloadData()
        }
    }
    const getEventFromBE = async (idContract, newStatus, toastLoading) => {
        const maxTimeout = 5;
        let serverApproved = false;
        let wait = 1;

        let i;
        for ( i = 0 ; i < maxTimeout ; i++ ) {
            await axios.post('/api/m1/land/getContractStatus', {
                address: props.metamask.walletAccount,
                idContract: idContract,
            })
            .then(response => {
                if(response.data.success){
                    console.log('contractStatus', response.data.data);
                    if ( response.data.data == newStatus ) {
                        serverApproved = true;
                    }
                } 
            })
            .catch(error => {
                error.response.status == 500
                && props.callback_Logout()
        
                error.response.status == 401
                && props.callback_Logout()
            })
    
            serverApproved ?
            i = maxTimeout :
            await new Promise(resolve => setTimeout(resolve, wait * 1000));
        }
    
        console.log('serverApproved', serverApproved);
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
        reloadData()
    }

    // response process
    const [actionResModalOpen, setActionResModalOpen] = useState(false)
    const [actionRes, setActionRes] = useState(null)
    const [resActionType, setResActionType] = useState('')
    const onDidAction = (response) => {
        console.log("onDidAction response: ", response)
        playSound(confirmActionType)
        if ( response.data.success ) {
            initInputs();
            const res = response.data.data;
            if(res?.voucherCreation){
                setContract(res.voucherCreation, 'active');
                return;
            }
            if ( confirmActionType == 'generate' ) {
                const totalTicketCount = res.generatedTickets.length + res.otherTickets.length + res.sellingTickets.length
                setContractData({...contractData, contract: {
                    ...contractData.contract,
                    generatedTickets: totalTicketCount,
                    ticketsToGenerate: contractData.contract.maxTickets - totalTicketCount,
                    createTickets: contractData.contract.maxTickets > totalTicketCount,
                }});
            } else if ( confirmActionType == 'create' ) {
                setContract(res, 'active');
                return ;
            } else if ( confirmActionType == 'delete' ) {
                setContract(res, 'deleted');
                return ;
            }
        }
        setActionRes(response)
        setResActionType(confirmActionType)
        setActionResModalOpen(true)
        setDoingAction(false)
    }
    const onCloseActionResModal = () => {
        setActionResModalOpen(false)
        setResActionType('')
    }
    const initInputs = () => {
        setFee('');
        setDuration('');
        setTicketCount('');
        setTicketType('paid');
        setTicketCost('');
    }

    // go to Ticket Component
    const onShowAllTicketsBtnClick = () => {
        props.callback_showTicketComponent();
    }

    // create tickets process
    const [ticketCount, setTicketCount] = useState('')
    const [ticketType, setTicketType] = useState('paid')
    const onTicketTypeChange = () => {
        setTicketType(ticketType == 'free' ? 'paid' : 'free');
    }
    const [ticketCost, setTicketCost] = useState('')
    const onCreateTicketBtnClick = () => {
        onDoAction('generate');
    }

    // private process
    const [isPrivate, setIsPrivate] = useState(false)
    const onPrivateChange = () => {
        setIsPrivate(!isPrivate);
    }

    // Create Contract Process
    const [fee, setFee] = useState('');
    const [duration, setDuration] =  useState('');
    const onCreateContractBtnClick = () => {
        onDoAction('create');
    }

    // Delete Contract Process
    const onDeleteContractBtnClick = () => {
        onDoAction('delete');
    }

    return ( <>
        <div className={'game-component ' + classNameForComponent}>
            <div className='game-container'>
                <div className='header'>
                    <span className='title'>{componentTitle}</span>
                </div>
                <div className='content'>
                    {(onLoading || doingAction) && 
                    <div className='api-loading'>
                        <span className='apiCallLoading'></span>
                        <span className={'loader ' + confirmActionType + '-loader'}></span>
                    </div>}
                    {hasTab &&
                    <div className='tab-navs'>
                        { tabNames.map((tabName, index) => (
                            <div key={index} className={'tab-nav ' + (currentTabIndex === index ? 'active' : '')} onClick={() => tabChanged(index)}>{tabName}</div>
                        ))}
                    </div>}
                    <div className='scroll-content'>
                        {!onLoading && <>{!contractData.created ? <div>
                            <div className='create-info'>
                                No contract yet, please create the New Contract.
                            </div>
                            <div className='create-panel'>
                                <div className='left-panel'>
                                    <div className='info-text'>
                                        <a>Fee : </a>
                                        <input
                                            className='feeInput'
                                            step={1}
                                            type='number'
                                            value={fee}
                                            onKeyPress={(e) => {
                                                if (e.code === 'Minus') {
                                                    e.preventDefault();
                                                } else if (e.code === 'NumpadSubtract') {
                                                    e.preventDefault();
                                                } else if (e.code === 'Period') {
                                                    e.preventDefault();
                                                } else if (e.code === 'NumpadDecimal') {
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
                                                if ( e.target.value == 0 ) {
                                                    setFee('')
                                                } else {
                                                    setFee(Math.max(Math.min(99, parseInt(e.target.value)), 0));
                                                }
                                            }}
                                            />%
                                    </div>
                                    <div className='info-text'>
                                        <a>Duration : </a>
                                        <input
                                            className='durationInput'
                                            step={1}
                                            type='number'
                                            value={duration}
                                            onKeyPress={(e) => {
                                                if (e.code === 'Minus') {
                                                    e.preventDefault();
                                                } else if (e.code === 'NumpadSubtract') {
                                                    e.preventDefault();
                                                } else if (e.code === 'Period') {
                                                    e.preventDefault();
                                                } else if (e.code === 'NumpadDecimal') {
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
                                                if ( e.target.value == 0 ) {
                                                    setDuration('');
                                                } else {
                                                    setDuration(Math.max(Math.min(365, parseInt(e.target.value)), 1));
                                                }
                                            }}
                                            />Days
                                    </div>
                                    <div className='info-text'>
                                        <a>Is Private? : </a>
                                        <a>
                                            <Checkbox
                                                className='ctCheckInput'
                                                checked={isPrivate}
                                                onChange={onPrivateChange}
                                                inputProps={{ 'aria-label': 'controlled' }}
                                                icon={<VisibilityIcon />}
                                                checkedIcon={<VisibilityOffIcon />}
                                                /> 
                                                {isPrivate ? 'Yes' : 'No'}
                                        </a>
                                    </div>
                                </div>
                                <div className='right-panel'>
                                    <Button className={"createContractBtn" + ((fee == '' || fee < 0 || duration == '' || duration < 0) ? ' notAllowed' : '')} variant="contained" onClick={onCreateContractBtnClick}>Create Contract</Button>
                                </div>
                            </div>
                        </div> : <div>
                            <div className='contract-info'>
                                <div className='left-panel'>
                                    <div className='sign-info'>
                                        Already have a contract.
                                        <div className={'contract-status' + (contractData.signed ? ' signed' : ' unsigned')}>
                                            {contractData.signed ? ' signed' : ' unsigned'}
                                        </div>
                                    </div>
                                    <div className='status-info'>
                                        Ending Spot : <b>{getShortData(contractData.contract.endingTime)}</b>
                                        <div className={'contract-status ' + contractData.contract.status}>
                                            {contractData.contract.status}
                                        </div>
                                    </div>
                                </div>
                                <div className='right-panel'>
                                    <div className='info-text'>
                                        <a>Fee : </a><a>{contractData.contract.fee}</a>%
                                    </div>
                                    <div className='info-text'>
                                        <a>Generated Tickets : </a><a>{contractData.contract.generatedTickets}</a> (/{contractData.contract.maxTickets})
                                    </div>
                                </div>
                            </div>
                            <div className='contract-panel'>
                                <div className='left-panel'>
                                    <div className='info-text'>
                                        <a>Tickets to Generate : </a>
                                        <input
                                            className='ticketCountInput'
                                            step={1}
                                            type='number'
                                            value={ticketCount}
                                            onKeyPress={(e) => {
                                                if (e.code === 'Minus') {
                                                    e.preventDefault();
                                                } else if (e.code === 'NumpadSubtract') {
                                                    e.preventDefault();
                                                } else if (e.code === 'Period') {
                                                    e.preventDefault();
                                                } else if (e.code === 'NumpadDecimal') {
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
                                                if ( e.target.value == 0 ) {
                                                    setTicketCount('')
                                                } else {
                                                    setTicketCount(Math.max(Math.min(parseInt(e.target.value), contractData.contract.ticketsToGenerate), 1));
                                                }
                                            }}
                                            />
                                    </div>
                                    <div className='info-text'>
                                        <a>Type : </a>
                                        <a>
                                            <Checkbox
                                                className='ttCheckInput'
                                                checked={ticketType == 'paid'}
                                                onChange={onTicketTypeChange}
                                                inputProps={{ 'aria-label': 'controlled' }}
                                                icon={<MoneyOffIcon />}
                                                checkedIcon={<AttachMoneyIcon />}
                                                /> 
                                                {ticketType == 'paid' ? 'Paid' : 'Free'}
                                        </a>
                                    </div>
                                    <Button className={"createTicketBtn" + ((!contractData.contract.createTickets || ticketCount == '' || ticketCount < 0) ? ' notAllowed' : '')} variant="contained" onClick={onCreateTicketBtnClick}>Generate Tickets</Button>
                                </div>
                                <div className='right-panel'>
                                    <Button className={"deleteContractBtn" + (!contractData.deleteContract ? ' notAllowed' : '')} variant="contained" onClick={() => onDeleteContractBtnClick()}>Delete Contract</Button>
                                    {!contractData.deleteContract && 
                                    <div className='delete-desc'>{contractData.deleteMessage}</div>}
                                    <Button className={"showAllTicketsBtn"} variant="contained" onClick={() => onShowAllTicketsBtnClick()}>Show All Tickets</Button>
                                </div>
                            </div>
                        </div>
                        }</>}
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
                    <DialogContentText>
                        Do you want to {confirmActionType == 'generate' ? `generate ${ticketCount} tickets` : 
                        confirmActionType == 'create' ? 'create the Contract' : 'delete the Contract'}?
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

export default GameContract // Component_Name_You_Want