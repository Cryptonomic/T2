import React, { Component } from 'react';
import { clipboard } from 'electron';
import styled, { withTheme } from 'styled-components';
import ContentCopy from '@material-ui/icons/FileCopyOutlined';
import i18n from '../../utils/i18n';
import { ms } from '../../styles/helpers';

interface TooltipProps {
  show: boolean;
}

const CopyConfirmationTooltip = styled.div<Pick<TooltipProps, 'show'>>`
  position: absolute;
  bottom: 35px;
  left: 35px;
  background: ${({ theme: { colors } }) => colors.white};
  color: ${({ theme: { colors } }) => colors.accent};
  font-size: ${ms(-1)};
  border-radius: ${ms(0)};
  border: 1px solid ${({ theme: { colors } }) => colors.accent};
  padding: ${ms(-5)};
  opacity: ${({ show }) => (show ? 1 : 0)};
  transition: opacity 0.4s;
  z-index: 1000;
  white-space: nowrap;
`;

const Container = styled.div`
  position: relative;
`;

interface Props {
  text: string;
  spanClicked?: boolean;
  color: string;
  theme: {
    colors?: [];
  };
  weight?: string;
  format?: number;
  className?: string;
  showTooltip?: boolean;
}

class CopyIcon extends Component<Props> {
  public static defaultProps = {
    color: 'white'
  };

  state = {
    showCopyConfirmation: false
  };

  componentWillUpdate() {
    const { text, spanClicked } = this.props;
    if (spanClicked) {
      this.copyToClipboard(text);
    }
  }

  copyToClipboard = text => {
    try {
      clipboard.writeText(text);
      this.setState({ showCopyConfirmation: true }, () => {
        setTimeout(() => {
          this.setState({ showCopyConfirmation: false });
        }, 1000);
      });
    } catch (e) {
      console.error(e);
    }
  };

  render() {
    const {
      text,
      color,
      theme: { colors },
      className
    } = this.props;
    const newColor = colors && colors[color];
    return (
      <Container onClick={() => this.copyToClipboard(text)}>
        <ContentCopy
          style={{
            width: ms(1),
            height: ms(1),
            color: newColor,
            cursor: 'pointer',
            marginLeft: ms(0)
          }}
          className={className}
        />
        <CopyConfirmationTooltip show={this.state.showCopyConfirmation}>
          {i18n.t('components.copyIcon.copied')}
        </CopyConfirmationTooltip>
      </Container>
    );
  }
}

export default withTheme(CopyIcon);
