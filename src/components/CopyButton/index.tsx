import React, { useState } from 'react';
import { clipboard } from 'electron';
import styled from 'styled-components';
import ContentCopy from '@material-ui/icons/FileCopyOutlined';
import { Tooltip, Button, IconButton } from '@material-ui/core';
import { withTranslation, WithTranslation } from 'react-i18next';

const Container = styled(Button)`
  &&& {
    padding: 0;
    font-size: 14px;
    &.MuiButton-textSecondary:hover {
      background-color: transparent;
    }
    .MuiButton-startIcon {
      margin-right: 5px;
    }
  }
`;

interface OwnProps {
  text: string;
  title?: string;
  color: string;
}

type Props = OwnProps & WithTranslation;

function CopyButton(props: Props) {
  const { text, title, color, t } = props;

  const [isShowed, setIsShowed] = useState(false);

  function copyToClipboard() {
    try {
      clipboard.writeText(text);
      setIsShowed(true);
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <Tooltip
      open={isShowed}
      title={t('components.copyIcon.copied')}
      leaveDelay={500}
      placement="top-end"
      onClose={() => setIsShowed(false)}
      PopperProps={{
        popperOptions: {
          modifiers: {
            offset: {
              enabled: true,
              offset: '50px, 0px'
            }
          }
        }
      }}
    >
      {title ? (
        <Container
          color="secondary"
          startIcon={<ContentCopy />}
          disableRipple={true}
          onClick={() => copyToClipboard()}
        >
          {title}
        </Container>
      ) : (
        <IconButton color="secondary" onClick={() => copyToClipboard()}>
          <ContentCopy />
        </IconButton>
      )}
    </Tooltip>
  );
}

export default withTranslation()(CopyButton);
