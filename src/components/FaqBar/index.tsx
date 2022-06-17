import React, { useState, useEffect } from 'react';
import Snackbar from '@mui/material/Snackbar';
import styled from 'styled-components';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import MessageContent from './MessageContent';

import { clearMessageAction } from '../../reduxContent/message/actions';
import { openBlockExplorerForOperation, openLink } from '../../utils/general';
import { RootState, MessageState } from '../../types/store';
import { getMainNode } from '../../utils/settings';

const SnackbarWrapper = styled(Snackbar)`
    &&& {
        &.MuiSnackbar-root {
            width: 732px;
            padding: 0;
        }
        .MuiSnackbarContent-root {
            padding: 0;
            width: 100%;
        }
        .MuiSnackbarContent-message {
            padding: 0;
            width: 100%;
        }
    }
`;

const FaqUrl = 'https://cryptonomic.zendesk.com/hc/en-us/articles/5868256903053-The-NFT-gallery-and-dapp-interactions-are-unavailable-';

function FaqBar() {
    const dispatch = useDispatch();
    const [open, setOpen] = useState(true);

    function openLinkHandler() {
        openLink(FaqUrl);
    }

    function onClose() {
        setOpen(false);
        setTimeout(() => {
            dispatch(clearMessageAction());
        }, 200);
    }

    return (
        <SnackbarWrapper
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            open={open}
            onClose={() => onClose()}
            message={<MessageContent openLink={() => openLinkHandler()} onClose={() => onClose()} />}
        />
    );
}

export default FaqBar;
