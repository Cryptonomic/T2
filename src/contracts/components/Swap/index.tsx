import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { BigNumber } from 'bignumber.js';

import { formatAmount } from '../../../utils/currency';
import { getMainNode } from '../../../utils/settings';
import { Token } from '../../../types/general';
import PasswordInput from '../../../components/PasswordInput';
import NumericInput from '../../../components/NumericInput';
import InputError from '../../../components/InputError';
import EmptyState from '../../../components/EmptyState';
import { setIsLoadingAction } from '../../../reduxContent/app/actions';
import { RootState, AppState, SettingsState } from '../../../types/store';
import { knownTokenContracts } from '../../../constants/Token';
import { TokenKind } from '../../../types/general';
import { Container, PasswordButtonContainer, InvokeButton, RowContainer } from '../style';
import { InfoIcon } from '../../../featureModals/style';

import { ColumnContainer, SegmentedControlContainer, SegmentedControl, SegmentedControlItem, MessageContainer } from './style';
import {
    dexterPoolStorageMap,
    granadaPoolStorageMap,
    quipuPoolStorageMap,
    quipuPool2StorageMap,
    tokenPoolMap,
    getPoolState,
    getTokenToCashExchangeRate,
    getTokenToCashInverse,
    applyFees,
    isTradeable,
    PoolState,
} from './util';
import { buyDexter, sellDexter, buyQuipu, sellQuipu } from './thunks';

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
    const [dexterTokenCost, setDexterTokenCost] = useState(0.0);
    const [quipuTokenCost, setQuipuTokenCost] = useState(0.0);
    const [dexterTokenProceeds, setDexterTokenProceeds] = useState(0.0);
    const [quipuTokenProceeds, setQuipuTokenProceeds] = useState(0.0);
    const [bestMarket, setBestMarket] = useState('');

    const { isLoading, isLedger } = useSelector<RootState, AppState>((state: RootState) => state.app, shallowEqual);
    const { selectedNode, nodesList } = useSelector<RootState, SettingsState>((state: RootState) => state.settings, shallowEqual);
    const tezosUrl = getMainNode(nodesList, selectedNode).tezosUrl;

    const { isReady, token } = props;

    const isDisabled = !isReady || isLoading || (!passPhrase && !isLedger) || bestMarket.length === 0;

    const tokenPoolConfig = token.tokenIndex !== undefined ? tokenPoolMap[`${token.address}+${token.tokenIndex}`] : tokenPoolMap[token.address];

    useEffect(() => {
        setTradeSide('buy');
        setBestMarket('');
        setTokenAmount('0');
        setDexterTokenCost(0.0);
        setQuipuTokenCost(0.0);
        setDexterTokenProceeds(0.0);
        setQuipuTokenProceeds(0.0);
        setPassPhrase('');
    }, [token.symbol]);

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
        setBestMarket('');

        if (tokenValue.length === 0 || new BigNumber(tokenValue).toNumber() === 0) {
            return;
        }

        const tokenMetadata = knownTokenContracts.find((i) => i.address === token.address);

        let dexterState: PoolState | undefined;
        if (token.symbol.toLocaleLowerCase() === 'tzbtc') {
            dexterState = await getPoolState(tezosUrl, tokenPoolConfig.granadaPool, granadaPoolStorageMap);
        } else {
            dexterState = await getPoolState(tezosUrl, tokenPoolConfig.dexterPool, dexterPoolStorageMap);
        }
        const quipuState = await getPoolState(
            tezosUrl,
            tokenPoolConfig.quipuPool,
            tokenMetadata?.kind === TokenKind.tzip12 ? quipuPool2StorageMap : quipuPoolStorageMap
        );

        if (side === 'buy') {
            let dexterCost = { cashAmount: -1, rate: 0 };
            if (dexterState) {
                dexterCost = getTokenToCashInverse(
                    new BigNumber(tokenValue).multipliedBy(10 ** (token.scale || 0)).toString(),
                    dexterState.tokenBalance,
                    dexterState.coinBalance
                );
            }

            let quipuCost = { cashAmount: -1, rate: 0 };
            if (quipuState) {
                quipuCost = getTokenToCashInverse(
                    new BigNumber(tokenValue).multipliedBy(10 ** (token.scale || 0)).toString(),
                    quipuState.tokenBalance,
                    quipuState.coinBalance
                );
            }

            setDexterTokenCost(applyFees(dexterCost.cashAmount, 'buy'));
            setQuipuTokenCost(applyFees(quipuCost.cashAmount, 'buy'));

            if ((dexterCost.cashAmount > 0 && dexterCost.cashAmount <= quipuCost.cashAmount) || (quipuCost.cashAmount < 0 && dexterCost.cashAmount > 0)) {
                setBestMarket('Dexter');
            }

            if ((quipuCost.cashAmount > 0 && dexterCost.cashAmount > quipuCost.cashAmount) || (dexterCost.cashAmount < 0 && quipuCost.cashAmount > 0)) {
                setBestMarket('QuipuSwap');
            }
        } else if (side === 'sell') {
            let dexterProceeds = { cashAmount: -1, rate: 0 };
            if (dexterState) {
                dexterProceeds = getTokenToCashExchangeRate(
                    new BigNumber(tokenValue).multipliedBy(10 ** (token.scale || 0)).toString(),
                    dexterState.tokenBalance,
                    dexterState.coinBalance
                );
            }

            let quipuProceeds = { cashAmount: -1, rate: 0 };
            if (quipuState) {
                quipuProceeds = getTokenToCashExchangeRate(
                    new BigNumber(tokenValue).multipliedBy(10 ** (token.scale || 0)).toString(),
                    quipuState.tokenBalance,
                    quipuState.coinBalance
                );
            }

            setDexterTokenProceeds(applyFees(dexterProceeds.cashAmount, 'sell'));
            setQuipuTokenProceeds(applyFees(quipuProceeds.cashAmount, 'sell'));

            if (
                (dexterProceeds.cashAmount > 0 && dexterProceeds.cashAmount >= quipuProceeds.cashAmount) ||
                (quipuProceeds.cashAmount < 0 && dexterProceeds.cashAmount > 0)
            ) {
                setBestMarket('Dexter');
            }

            if (
                (quipuProceeds.cashAmount > 0 && dexterProceeds.cashAmount < quipuProceeds.cashAmount) ||
                (dexterProceeds.cashAmount < 0 && quipuProceeds.cashAmount > 0)
            ) {
                setBestMarket('QuipuSwap');
            }
        }
    }

    async function onSend() {
        dispatch(setIsLoadingAction(true));

        if (isLedger) {
            setLedgerModalOpen(true);
        }

        if (tradeSide === 'buy' && bestMarket.toLowerCase() === 'dexter') {
            await dispatch(
                buyDexter(
                    token.symbol.toLocaleLowerCase() === 'tzbtc' ? tokenPoolConfig.granadaPool : tokenPoolConfig.dexterPool,
                    token.address,
                    token.tokenIndex || -1,
                    new BigNumber(tokenAmount).multipliedBy(10 ** (token.scale || 0)).toString(),
                    new BigNumber(dexterTokenCost).toString(),
                    passPhrase
                )
            );
        } else if (tradeSide === 'buy' && bestMarket.toLowerCase() === 'quipuswap') {
            await dispatch(
                buyQuipu(
                    tokenPoolConfig.quipuPool,
                    token.address,
                    token.tokenIndex || -1,
                    new BigNumber(tokenAmount).multipliedBy(10 ** (token.scale || 0)).toString(),
                    new BigNumber(quipuTokenCost).toString(),
                    passPhrase
                )
            );
        } else if (tradeSide === 'sell' && bestMarket.toLowerCase() === 'dexter') {
            console.log('tokenPoolConfig', tokenPoolConfig);
            await dispatch(
                sellDexter(
                    token.symbol.toLocaleLowerCase() === 'tzbtc' ? tokenPoolConfig.granadaPool : tokenPoolConfig.dexterPool,
                    token.address,
                    token.tokenIndex || -1,
                    new BigNumber(tokenAmount).multipliedBy(10 ** (token.scale || 0)).toString(),
                    new BigNumber(dexterTokenProceeds).toString(),
                    passPhrase
                )
            );
        } else if (tradeSide === 'sell' && bestMarket.toLowerCase() === 'quipuswap') {
            await dispatch(
                sellQuipu(
                    tokenPoolConfig.quipuPool,
                    token.address,
                    token.tokenIndex || -1,
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
    const showForm = isTradeable(token.address, token.tokenIndex);

    if (!showForm) {
        return (
            <Container>
                <EmptyState imageSrc={''} title={`Trading of ${token.displayName} is not supported yet.`} description={null} />
            </Container>
        );
    }

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

                        <ColumnContainer>
                            <div style={{ alignItems: 'left' }}>
                                {tokenAmount.length > 0 && tokenAmount !== '0' && tradeSide === 'buy' && dexterTokenCost > 0 && (
                                    <div>
                                        Cost {quipuTokenCost > 0 ? (token.symbol.toLocaleLowerCase() === 'tzbtc' ? ' on GranadaSwap' : 'on Dexter') : ''}{' '}
                                        {formatAmount(dexterTokenCost)} XTZ
                                    </div>
                                )}
                                {tokenAmount.length > 0 && tokenAmount !== '0' && tradeSide === 'buy' && quipuTokenCost > 0 && (
                                    <div>
                                        Cost {dexterTokenCost > 0 ? 'on QuipuSwap' : ''} {formatAmount(quipuTokenCost)} XTZ
                                    </div>
                                )}

                                {tokenAmount.length > 0 && tokenAmount !== '0' && tradeSide === 'sell' && dexterTokenProceeds > 0 && (
                                    <div>
                                        Proceeds{' '}
                                        {quipuTokenProceeds > 0 ? (token.symbol.toLocaleLowerCase() === 'tzbtc' ? ' on GranadaSwap' : 'on Dexter') : ''}{' '}
                                        {formatAmount(dexterTokenProceeds)} XTZ
                                    </div>
                                )}
                                {tokenAmount.length > 0 && tokenAmount !== '0' && tradeSide === 'sell' && quipuTokenProceeds > 0 && (
                                    <div>
                                        Proceeds {dexterTokenProceeds > 0 ? 'on QuipuSwap' : ''} {formatAmount(quipuTokenProceeds)} XTZ
                                    </div>
                                )}
                            </div>
                        </ColumnContainer>
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
                            {t('general.prepositions.on')}{' '}
                            {bestMarket === 'Dexter' && token.symbol.toLocaleLowerCase() === 'tzbtc' ? 'Granada Swap' : bestMarket}
                        </>
                    )}
                </InvokeButton>
            </PasswordButtonContainer>
        </Container>
    );
}

export default Swap;
