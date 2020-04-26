import React from 'react';
import { shell } from 'electron';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { ms } from '../../../../styles/helpers';
import TezosIcon from '../../../../components/TezosIcon';

const Container = styled.div`
    padding: 0 20px 20px 20px;
`;

const BroadIcon = styled(TezosIcon)`
    margin-left: 2px;
`;

const LinkContainer = styled.span`
    margin-left: 7px;
    cursor: pointer;
`;

const LinkTitle = styled.span`
    font-size: 12px;
    text-decoration: underline;
`;

interface Props {
    pkh: string;
    details?: any;
}

export default function Details(props: Props) {
    const { details } = props;
    const { t } = useTranslation();

    const onClick = (link: string) => {
        shell.openExternal(link);
    };

    const phaseMap = {
        0: 'proposal',
        1: 'evaluation',
        2: 'voting',
        3: 'implementation'
    };

    const { paused, stage, phase, supply, council } = details;
    const isReady = paused !== undefined && stage !== undefined && phase !== undefined && supply !== undefined;

    return (
        <Container>
            {isReady && (
                <p>
                    The DAO is in governance stage {stage}, phase {t('general.nouns.' + phaseMap[phase])}.
                    {council.length > 0 && (
                        <>
                            Current council member are:{' '}
                            {council.map(link => (
                                <LinkContainer onClick={() => onClick(link)} key={link}>
                                    <LinkTitle>{link}</LinkTitle>
                                    <BroadIcon iconName="new-window" size={ms(0)} color="black" />
                                </LinkContainer>
                            ))}
                            .
                        </>
                    )}{' '}
                    The token is {paused ? 'inactive' : 'active'} with a total supply of {supply}.
                </p>
            )}
        </Container>
    );
}
