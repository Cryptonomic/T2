import React from 'react';
import { useTranslation } from 'react-i18next';

import { ms } from '../../../../styles/helpers';

import { openBlockExplorerForAccount } from '../../../../utils/general';

import { Container, BroadIcon, LinkContainer, LinkTitle, ContentTitle } from './style';

interface Props {
    pkh: string;
    details?: any;
}

export default function Details(props: Props) {
    const { details } = props;
    const { t } = useTranslation();

    const onClick = (account: string) => {
        openBlockExplorerForAccount(account);
    };

    const phaseMap = {
        0: 'proposal',
        1: 'evaluation',
        2: 'voting',
        3: 'implementation'
    };

    const councilMap = {
        tz1RSfu48E1yHvs1abx7yv8QTTpzis3W3Kt9: 'Jonas Lamis',
        tz1SAJpH6eeSdPU7WJPXxgdPLYPhFVCiHwDx: 'Olaf Carlson-Wee',
        tz1UKCEd8vWm9v85TxKssT9ZndqchBpy9VsM: 'Luke Youngblood',
        tz1ZZsCA2xPonKH13UhWVnhehc74vxx5ZKZM: 'Shaishav Todi',
        tz1de9b4byQpmHuEYtHXzE2bAvJAbpwR9gEB: 'Spencer Noon'
    };

    const { paused, stage, phase, supply, council } = details;
    const isReady = paused !== undefined && stage !== undefined && phase !== undefined && supply !== undefined;

    const today = new Date();
    const currentEpoch = (today.getFullYear() - 2020) * 12 + today.getMonth();
    const currentPhase = Math.max(3, (today.getDate() - 1) % 7);
    const currentStage = currentEpoch * 4 + currentPhase;

    return (
        <Container>
            {isReady && (
                <div>
                    <ContentTitle>Latest contract update</ContentTitle>
                    <p>
                        The DAO is in governance stage {stage}, phase {t('general.nouns.' + phaseMap[phase])}.
                        {council.length > 0 && (
                            <>
                                {' '}
                                Current council member are:{' '}
                                {council.map(link => (
                                    <LinkContainer onClick={() => onClick(link)} key={link}>
                                        <LinkTitle>{councilMap[link] || link}</LinkTitle>
                                        <BroadIcon iconName="new-window" size={ms(0)} color="black" />
                                    </LinkContainer>
                                ))}
                                .
                            </>
                        )}
                    </p>
                    <ContentTitle>Current state</ContentTitle>
                    <p>
                        The DAO is in governance stage {currentStage}, phase {t('general.nouns.' + phaseMap[currentPhase])}.
                    </p>
                </div>
            )}
        </Container>
    );
}
