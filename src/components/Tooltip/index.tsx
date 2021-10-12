import React from 'react';
import Tooltip from '@mui/material/Tooltip';
import styled from 'styled-components';
import { lighten } from 'polished';

import { ms } from '../../styles/helpers';
import { TooltipProps } from './types';

const StyledTooltip = styled((props) => <Tooltip classes={{ popper: props.className, tooltip: 'tooltip' }} {...props} />)`
    & .tooltip {
        padding: ${ms(-2)};
        color: ${({ theme: { colors } }) => colors.primary};
        text-align: left;
        text-decoration: none;
        background-color: ${({ theme: { colors } }) => colors.white};
        border: 1px solid ${({ theme: { colors } }) => lighten(0.1, colors.secondary)};
        box-shadow: ${({ theme: { colors } }) => `0 0 4px 0 ${colors.index0}`};
        & .MuiTooltip-arrow {
            color: ${({ theme: { colors } }) => lighten(0.1, colors.secondary)};
            bottom: ${({ placement }) => (placement === 'top' ? '-1px !important' : '')};
            right: ${({ placement }) => (placement === 'left' ? '-1px !important' : '')};
            &:after {
                border: solid transparent;
                content: '';
                height: 0;
                width: 0;
                position: absolute;
                pointer-events: none;
                border-top-color: ${({ placement, theme: { colors } }) => (placement === 'top' ? colors.white : '')};
                border-right-color: ${({ placement, theme: { colors } }) => (placement === 'right' ? colors.white : '')};
                border-bottom-color: ${({ placement, theme: { colors } }) => (placement === 'bottom' ? colors.white : '')};
                border-left-color: ${({ placement, theme: { colors } }) => (placement === 'left' ? colors.white : '')};
                border-width: 1em;
                top: ${({ placement }) => (placement === 'bottom' ? '-0.8333em' : placement === 'left' || placement === 'right' ? '0' : '')};
                right: ${({ placement }) => (placement === 'left' ? '-0.8333em' : '')};
                bottom: ${({ placement }) => (placement === 'top' ? '-0.8333em' : '')};
                left: ${({ placement }) => (placement === 'right' ? '-0.8333em' : '')};
            }
        }
    }
`;

const TooltipWrapper = ({ children, content, position }: TooltipProps) => (
    <StyledTooltip arrow={true} title={content} placement={position}>
        {children}
    </StyledTooltip>
);

export default TooltipWrapper;
