import React, { useState } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { BigNumber } from 'bignumber.js';

import { formatAmount } from '../../../utils/currency';
import { getMainNode } from '../../../utils/settings';
import { Token } from '../../../types/general';
import PasswordInput from '../../../components/PasswordInput';
import NumericInput from '../../../components/NumericInput';
import InputError from '../../../components/InputError';
import { setIsLoadingAction } from '../../../reduxContent/app/actions';
import { RootState, AppState, SettingsState } from '../../../types/store';
import { knownTokenContracts } from '../../../constants/Token';
import { TokenKind } from '../../../types/general';
import { Container, PasswordButtonContainer, InvokeButton, RowContainer } from '../../components/style';
import { InfoIcon } from '../../../featureModals/style';

import { SegmentedControlContainer, SegmentedControl, SegmentedControlItem, ColumnContainer, MessageContainer } from '../../components/Swap/style';
import {
    quipuPoolStorageMap,
    quipuPool2StorageMap,
    tokenPoolMap,
    getPoolState,
    getTokenToCashExchangeRate,
    getTokenToCashInverse,
    applyFees,
} from '../../components/Swap/util';
import { buyQuipu, sellQuipu } from '../../components/Swap/thunks';

interface Props {
    isReady: boolean;
    token: Token;
}

interface Props1 {
    type: string;
    changeFunc: (val: string) => void;
}

const RestoreTabs = (props: Props1) => {
    const { t } = useTranslation();
    const { type, changeFunc } = props;

    return (
        <SegmentedControl>
            <SegmentedControlItem active={type === 'buy'} onClick={() => changeFunc('buy')}>
                {t('general.verbs.buy')}
            </SegmentedControlItem>
            <SegmentedControlItem active={type === 'sell'} onClick={() => changeFunc('sell')}>
                {t('general.verbs.sell')}
            </SegmentedControlItem>
        </SegmentedControl>
    );
};

function Swap(props: Props) {
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const [tradeSide, setTradeSide] = useState('buy');
    const [passPhrase, setPassPhrase] = useState('');
    const [ledgerModalOpen, setLedgerModalOpen] = useState(false);

    const [tokenAmount, setTokenAmount] = useState('');
    const [quipuTokenCost, setQuipuTokenCost] = useState(0.0);
    const [quipuTokenProceeds, setQuipuTokenProceeds] = useState(0.0);
    const [bestMarket, setBestMarket] = useState('');

    const { isLoading, isLedger } = useSelector<RootState, AppState>((state: RootState) => state.app, shallowEqual);
    const { selectedNode, nodesList } = useSelector<RootState, SettingsState>((state: RootState) => state.settings, shallowEqual);
    const tezosUrl = getMainNode(nodesList, selectedNode).tezosUrl;

    const { isReady, token } = props;

    const isDisabled = !isReady || isLoading || (!passPhrase && !isLedger);

    const onTypeChange = (side: string) => {
        setTradeSide(side);
        updateMarketPrice(tokenAmount, side);
    };

    function getBalanceState() {
        const realAmount = 0; // !amount ? Number(amount) : 0;
        if (token.balance < realAmount) {
            return {
                isIssue: true,
                warningMessage: t('components.send.warnings.total_exceeds'),
            };
        }

        return {
            isIssue: false,
            warningMessage: '',
        };
    }

    async function updateAmount(val) {
        setTokenAmount(val);
        updateMarketPrice(val, tradeSide);
    }

    async function updateMarketPrice(tokenValue, side) {
        const tokenMetadata = knownTokenContracts.find((i) => i.address === token.address);

        const quipuState = await getPoolState(
            tezosUrl,
            tokenPoolMap[token.address].quipuPool,
            tokenMetadata?.kind === TokenKind.tzip12 ? quipuPool2StorageMap : quipuPoolStorageMap
        );

        setBestMarket('');

        if (side === 'buy') {
            let quipuCost = { cashAmount: -1, rate: 0 };
            if (quipuState) {
                quipuCost = getTokenToCashExchangeRate(
                    new BigNumber(tokenValue).multipliedBy(10 ** (token.scale || 0)).toString(),
                    quipuState.tokenBalance,
                    quipuState.coinBalance
                );
            }

            setQuipuTokenCost(applyFees(quipuCost.cashAmount, 'buy'));
            setBestMarket('QuipuSwap');
        } else if (side === 'sell') {
            let quipuProceeds = { cashAmount: -1, rate: 0 };
            if (quipuState) {
                quipuProceeds = getTokenToCashInverse(
                    new BigNumber(tokenValue).multipliedBy(10 ** (token.scale || 0)).toString(),
                    quipuState.tokenBalance,
                    quipuState.coinBalance
                );
            }

            setQuipuTokenProceeds(applyFees(quipuProceeds.cashAmount, 'sell'));
            setBestMarket('QuipuSwap');
        }
    }

    async function onSend() {
        dispatch(setIsLoadingAction(true));

        if (isLedger) {
            setLedgerModalOpen(true);
        }

        if (tradeSide === 'buy' && bestMarket.toLowerCase() === 'quipuswap') {
            await dispatch(
                buyQuipu(
                    tokenPoolMap[token.address].quipuPool,
                    token.address,
                    -1,
                    new BigNumber(tokenAmount).multipliedBy(10 ** (token.scale || 0)).toString(),
                    new BigNumber(quipuTokenCost).toString(),
                    passPhrase
                )
            );
        } else if (tradeSide === 'sell' && bestMarket.toLowerCase() === 'quipuswap') {
            await dispatch(
                sellQuipu(
                    tokenPoolMap[token.address].quipuPool,
                    token.address,
                    -1,
                    new BigNumber(tokenAmount).multipliedBy(10 ** (token.scale || 0)).toString(),
                    new BigNumber(quipuTokenProceeds).toString(),
                    passPhrase
                )
            );
        }

        setLedgerModalOpen(false);
        dispatch(setIsLoadingAction(false));
    }

    const { isIssue, warningMessage } = getBalanceState();
    const error = isIssue ? <InputError error={warningMessage} /> : '';

    return (
        <Container>
            <RowContainer>
                <div style={{ width: '100%', paddingRight: '10px' }}>
                    <SegmentedControlContainer>
                        <RestoreTabs type={tradeSide} changeFunc={(val) => onTypeChange(val)} />
                    </SegmentedControlContainer>
                </div>
                <ColumnContainer>
                    <div style={{ width: '100%', paddingLeft: '10px' }}>
                        <NumericInput
                            label={t('general.nouns.amount')}
                            amount={tokenAmount}
                            onChange={updateAmount}
                            errorText={error}
                            symbol={token.symbol}
                            scale={token.scale || 0}
                            precision={token.precision || 6}
                        />

                        {tokenAmount.length > 0 && tokenAmount !== '0' && tradeSide === 'buy' && quipuTokenCost > 0 && (
                            <>
                                Cost {'on QuipuSwap'} {formatAmount(quipuTokenCost)} XTZ
                            </>
                        )}

                        {tokenAmount.length > 0 && tokenAmount !== '0' && tradeSide === 'sell' && quipuTokenProceeds > 0 && (
                            <>
                                Proceeds {'on QuipuSwap'} {formatAmount(quipuTokenProceeds)} XTZ
                            </>
                        )}
                    </div>
                </ColumnContainer>
            </RowContainer>

            <MessageContainer>
                <InfoIcon color="info" iconName="info" />
                {t('components.swap.outcome_warning')}
            </MessageContainer>

            <PasswordButtonContainer>
                {!isLedger && (
                    <PasswordInput
                        label={t('general.nouns.wallet_password')}
                        password={passPhrase}
                        onChange={(val) => setPassPhrase(val)}
                        containerStyle={{ width: '47%', marginTop: '10px' }}
                    />
                )}
                {isLedger && ledgerModalOpen && <>Please confirm the operation on the Ledger device</>}
                <InvokeButton buttonTheme="primary" disabled={isDisabled} onClick={() => onSend()}>
                    {t(`general.verbs.${tradeSide}`)}
                    {bestMarket && bestMarket.length > 0 && (
                        <>
                            {' '}
                            {t('general.prepositions.on')} {bestMarket}{' '}
                        </>
                    )}
                </InvokeButton>
            </PasswordButtonContainer>
        </Container>
    );
}

export default Swap;
