import React, { useState } from 'react';
import { clipboard } from 'electron';
import styled, { css } from 'styled-components';
import ContentCopy from '@mui/icons-material/FileCopyOutlined';
import { Tooltip, Button, IconButton } from '@mui/material';
import { useTranslation } from 'react-i18next';

const Container = styled(Button)<{ realcolor: string }>`
    &&& {
        padding: 0;
        font-size: 14px;
        color: ${({ realcolor, theme: { colors } }) => colors[realcolor]};
        &.MuiButton-textSecondary:hover {
            background-color: transparent;
        }
        .MuiButton-startIcon {
            margin-right: 5px;
        }
    }
`;

const IconButtonWrapper = styled(IconButton)<{ realcolor: string }>`
    &&& {
        color: ${({ realcolor, theme: { colors } }) => colors[realcolor]};
        margin-left: 5px;
    }
`;

const CopyIconWrapper = styled(ContentCopy)<{ iconstyle?: any }>`
    &&& {
        width: 19px;
        height: 19px;
        ${({ iconstyle }) => !!iconstyle && iconstyle}
    }
`;

interface Props {
    text: string;
    title?: string;
    color: string;
    iconStyle?: any;
}

function CopyButton(props: Props) {
    const { text, title, color, iconStyle } = props;
    const { t } = useTranslation();

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
            title={<React.Fragment>{t('components.copyIcon.copied')}</React.Fragment>}
            leaveDelay={500}
            placement="top-end"
            onClose={() => setIsShowed(false)}
            PopperProps={{
                popperOptions: {
                    modifiers: [
                        {
                            name: 'offset',
                            enabled: true,
                            options: {
                                offset: '50px, 0px',
                            },
                        },
                    ],
                },
            }}
        >
            {title ? (
                <Container realcolor={color} startIcon={<CopyIconWrapper iconstyle={iconStyle} />} disableRipple={true} onClick={() => copyToClipboard()}>
                    {title}
                </Container>
            ) : (
                <IconButtonWrapper size="small" realcolor={color} onClick={() => copyToClipboard()}>
                    <CopyIconWrapper iconstyle={iconStyle} />
                </IconButtonWrapper>
            )}
        </Tooltip>
    );
}

export default CopyButton;
