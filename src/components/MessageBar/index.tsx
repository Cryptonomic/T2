import React, { useState, useEffect } from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import styled from 'styled-components';

import MessageContent from './MessageContent';

import { openLinkToBlockExplorer } from '../../utils/general';
import { MessageState } from '../../types/store';

const SnackbarWrapper = styled(Snackbar)`
  &&& {
    &.MuiSnackbar-root {
      min-width: 500px;
      max-width: 1000px;
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

interface Props {
  clear: () => void;
  message: MessageState;
}

function MessageBar(props: Props) {
  const { message, clear } = props;
  const { text, hash, isError, localeParam } = message;
  const [open, setOpen] = useState(false);
  function openLink() {
    clear();
    openLinkToBlockExplorer(hash);
  }

  function changeHash() {
    let newHash = hash;
    const hashLen = hash.length;
    if (hashLen > 10) {
      newHash = `${hash.slice(0, 4)}...${hash.slice(hashLen - 4, hashLen)}`;
    }
    return newHash;
  }

  function onClose() {
    setOpen(false);
    setTimeout(() => {
      clear();
    }, 200);
  }

  useEffect(() => {
    if (text) {
      setOpen(true);
    }
  }, [text]);

  return (
    <SnackbarWrapper
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      open={open}
      onClose={() => onClose()}
      message={
        <MessageContent
          content={text}
          hash={changeHash()}
          openLink={() => openLink()}
          onClose={() => onClose()}
          isError={isError}
          localeParam={localeParam}
        />
      }
    />
  );
}

export default MessageBar;
