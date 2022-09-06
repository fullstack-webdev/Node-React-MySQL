import './bonus-view.scss';

import {
  useEffect,
  useState,
} from 'react';

import SwitchAccessShortcutAddIcon
  from '@mui/icons-material/SwitchAccessShortcutAdd';
// import Scrollbars from 'react-custom-scrollbars';
import {
  Dialog,
  DialogContent,
  Tooltip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { tooltipClasses } from '@mui/material/Tooltip';

const ConfirmationDialog = styled(Dialog)`
  & > .MuiDialog-container {
    backdrop-filter: blur(2px);
  }
  & > .MuiDialog-container > .MuiPaper-root {
    background-color: #121e2a;
    border: 1px solid #ffffff26;
    box-shadow: 0px 0px 20px 5px black;
  }
  &
    > .MuiDialog-container
    > .MuiPaper-root
    > .MuiDialogContent-root {
        padding: 0px;
    }
`;
const HtmlTooltip = styled(({ className, ...props }) => (
    <Tooltip {...props} placement='bottom' classes={{ popper: className }} />
))(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
        backgroundColor: 'transparent',
        width: 'calc(100%)',
        height: 'calc(100%)',
        margin: '0rem !important',
        padding: '0rem'
    },
}));

function BonusView(props) {
    const [info, setInfo] = useState(props.info)
    useEffect(() => {
        setInfo(props.info)
    }, [props.info])

    const [hasIcon, setHasIcon] = useState(props.icon)
    useEffect(() => {
        setHasIcon(props.icon)
    }, [props.icon])

    const [bonusViewModalOpen, setBonusViewModalOpen] = useState(false)
    const onBonusViewModalOpen = () => {
        setBonusViewModalOpen(true)
    }
    const onBonusViewModalClose = () => {
        setBonusViewModalOpen(false)
    }

    return (<>
        <HtmlTooltip
            className='bonus-view-popup'
            title={<>
                {/* <Scrollbars
                    style={{ width: '100%', height: '100%' }}
                    autoHide={false}
                    renderThumbVertical={props => <div {...props} className="thumb-vertical" />}
                > */}
                {info.map((bonus, index) => (
                    typeof bonus !== 'string' &&
                    <div key={index} className='bonus-detail'>
                        <div className={'bonus-type ' + bonus.type}>
                            {bonus.type}
                        </div>
                        <div className='bonus-name'>
                            {bonus.name}
                        </div>
                        <div className='bonus-description'>
                            {bonus.description}
                        </div>
                        <div className='bonus-footer'>
                            <div className='bonus-effect'>
                                effect: <a>{bonus.flatBoost || bonus.percentageBoost}</a>{bonus.percentageBoost && '%'}
                            </div>
                            <div className='bonus-tier'>
                                tier: <a>{bonus.tier}</a>
                            </div>
                        </div>
                    </div>
                ))}
                <div className='noBonusDescription'>
                    No Bonus
                </div>
                {/* </Scrollbars> */}
            </>}
        >
            <div className='bonus-view-panel'>
                <div className='bonus-view'>
                </div>
                {hasIcon && (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) &&
                    <div className='bonus-view-icon' onClick={onBonusViewModalOpen}>
                        <SwitchAccessShortcutAddIcon />
                    </div>}
            </div>
        </HtmlTooltip>

        <ConfirmationDialog
            className="bonus-view-modal"
            open={bonusViewModalOpen}
            onClose={onBonusViewModalClose}
        >
            <DialogContent>
                {info.map((bonus, index) => (
                    typeof bonus !== 'string' &&
                    <div key={index} className='bonus-detail'>
                        <div className={'bonus-type ' + bonus.type}>
                            {bonus.type}
                        </div>
                        <div className='bonus-name'>
                            {bonus.name}
                        </div>
                        <div className='bonus-description'>
                            {bonus.description}
                        </div>
                        <div className='bonus-footer'>
                            <div className='bonus-effect'>
                                effect: <a>{bonus.flatBoost || bonus.percentageBoost}</a>{bonus.percentageBoost && '%'}
                            </div>
                            <div className='bonus-tier'>
                                tier: <a>{bonus.tier}</a>
                            </div>
                        </div>
                    </div>
                ))}
                <div className='noBonusDescription'>
                    No Bonus
                </div>
            </DialogContent>
        </ConfirmationDialog>
    </>)
}

export default BonusView