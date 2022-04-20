import React from 'react';
import styled from 'styled-components';
import { Trans, useTranslation } from 'react-i18next';
import { ms } from '../../styles/helpers';
import TezosIcon from '../TezosIcon/';

const Container = styled.div`
    display: flex;
    align-items: center;
    padding: ${ms(-1)} ${ms(3)} ${ms(-1)} ${ms(4)};
    background-color: ${({ theme: { colors } }) => colors.warning};
    color: ${({ theme: { colors } }) => colors.white};
    font-size: ${ms(-0.9)};
    line-height: ${ms(0.5)};
    font-weight: 300;
`;
const MsgContainer = styled.div`
    display: block;
`;

const WarningIcon = styled(TezosIcon)`
    font-size: ${ms(0.8)};
    margin-right: ${ms(-1.5)};
`;

const Link = styled.span`
    cursor: pointer;
    color: ${({ theme: { colors } }) => colors.white};
    font-weight: 400;
    text-decoration: underline;
`;

const MediumText = styled.span`
    font-weight: 400;
    display: block;
`;

interface Props {
    message: string;
}

const NodesStatus = (props: Props) => {
    const { message } = props;
    const { t } = useTranslation();

    function goTo() {
        console.log('goto');
    }

    function onGetNodeStatus(msg) {
        if (msg === 'nodes.errors.tezos_node' || msg === 'nodes.errors.wrong_server') {
            return (
                <Trans i18nKey="nodes.errors.tezos_node">
                    <MediumText>We’re currently experiencing network issues.</MediumText>
                    Your assets are safe but you may not be able to complete new transactions.
                    <Link onClick={() => goTo()}> Learn more </Link>
                </Trans>
            );
        }
        if (msg === 'nodes.errors.not_synced' || msg === 'nodes.errors.indexer_server') {
            return (
                <Trans i18nKey="nodes.errors.not_synced">
                    <MediumText>We’re currently experiencing network issues.</MediumText>
                    Your assets are safe but you may not be able to see an updated transaction history. Please check back later while we work on a fix.
                    <Link onClick={() => goTo()}> Learn more </Link>
                </Trans>
            );
        }
        if (msg === 'nodes.errors.wrong_network') {
            return t('nodes.errors.wrong_network');
        }

        return '';
    }
    return (
        <Container>
            <WarningIcon color="white" iconName="warning" />
            <MsgContainer>{onGetNodeStatus(message)}</MsgContainer>
        </Container>
    );
};

export default NodesStatus;
