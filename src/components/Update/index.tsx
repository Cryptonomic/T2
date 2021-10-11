import React from 'react';
import moment from 'moment';
import styled from 'styled-components';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useTranslation } from 'react-i18next';
import { ms } from '../../styles/helpers';

const Container = styled.div`
    display: flex;
    align-items: center;
`;
const Text = styled.span`
    font-size: ${ms(-1.7)};
    font-weight: 100;
    color: ${({ theme: { colors } }) => colors.white};
    opacity: 0.8;
    margin: 0 ${ms(-2)} 0 0;
`;

const SpinningRefreshIcon = styled(RefreshIcon)`
    -webkit-animation: spin 0.5s linear infinite;
    -moz-animation: spin 0.5s linear infinite;
    animation: spin 0.5s linear infinite;

    @-moz-keyframes spin {
        100% {
            -moz-transform: rotate(360deg);
        }
    }
    @-webkit-keyframes spin {
        100% {
            -webkit-transform: rotate(360deg);
        }
    }
    @keyframes spin {
        100% {
            -webkit-transform: rotate(360deg);
            transform: rotate(360deg);
        }
    }
`;

interface Props {
    isReady?: boolean;
    isWalletSyncing?: boolean;
    onClick?: () => void;
    time: Date;
}

function Update(props: Props) {
    const { isReady, isWalletSyncing, onClick, time } = props;
    const { t } = useTranslation();
    const Refresh = isReady && isWalletSyncing ? SpinningRefreshIcon : RefreshIcon;
    return (
        <Container>
            <Text>
                {t('components.update.last_updated', {
                    date: moment(time).format('LT'),
                })}
            </Text>
            <Refresh
                style={{
                    fill: 'white',
                    height: ms(2),
                    width: ms(2),
                    cursor: 'pointer',
                }}
                onClick={onClick}
            />
        </Container>
    );
}

export default Update;
