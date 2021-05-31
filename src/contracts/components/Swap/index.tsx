import React, { useState } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { BigNumber } from 'bignumber.js';

import { formatAmount } from '../../../utils/currency';
import { getMainNode } from '../../../utils/settings';
import { Token } from '../../../types/general';
import PasswordInput from '../../../components/PasswordInput';
import NumericInput from '../../../components/NumericInput';
import TokenLedgerConfirmationModal from '../../../components/ConfirmModals/TokenLedgerConfirmationModal';
import InputError from '../../../components/InputError';
import { setIsLoadingAction } from '../../../reduxContent/app/actions';

import { RootState, AppState, SettingsState } from '../../../types/store';
import { Container, AmountContainer, PasswordButtonContainer, InvokeButton, RowContainer } from '../style';

import { SegmentedControlContainer, SegmentedControl, SegmentedControlItem } from './style';
import { dexterPoolStorageMap, quipuPoolStorageMap, tokenPoolMap, getPoolState, getXTZBuyExchangeRate, getXTZSellExchangeRate } from './util';
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

    const [tokenAmount, setTokenAmount] = useState('');
    const [dexterTokenCost, setDexterTokenCost] = useState(0.0);
    const [quipuTokenCost, setQuipuTokenCost] = useState(0.0);
    const [dexterTokenProceeds, setDexterTokenProceeds] = useState(0.0);
    const [quipuTokenProceeds, setQuipuTokenProceeds] = useState(0.0);
    const [bestMarket, setBestMarket] = useState('');

    const [open, setOpen] = useState(false);

    const { isLoading, isLedger, selectedParentHash } = useSelector<RootState, AppState>((state: RootState) => state.app, shallowEqual);
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

    /**
     *
     * @param amount Decimal-formatted XTZ amount
     * @param side buy | sell
     * @returns
     */
    function applyFees(amount: number, side: string) {
        const slippage = 0.01;
        const fee = 0.05;
        const feeThreshold = 500_000_000;

        const ba = new BigNumber(amount);
        const bs = ba.multipliedBy(slippage);
        const bf = ba.isGreaterThanOrEqualTo(feeThreshold) ? ba.multipliedBy(fee) : 0;

        if (side === 'buy') {
            return ba.plus(bs).plus(bf).dp(0, 0).toNumber();
        }

        if (side === 'sell') {
            return ba.minus(bs).minus(bf).dp(0, 1).toNumber();
        }

        return 0;
    }

    async function updateAmount(val) {
        setTokenAmount(val);
        updateMarketPrice(val, tradeSide);
    }

    async function updateMarketPrice(tokenValue, side) {
        const dexterState = await getPoolState(tezosUrl, tokenPoolMap[token.address].dexterPool, dexterPoolStorageMap);
        const quipuState = await getPoolState(tezosUrl, tokenPoolMap[token.address].quipuPool, quipuPoolStorageMap);

        if (side === 'buy') {
            let dexterCost = { xtzAmount: -1, rate: 0 };
            if (dexterState) {
                dexterCost = getXTZBuyExchangeRate(
                    new BigNumber(tokenValue).multipliedBy(10 ** (token.scale || 0)).toString(),
                    dexterState.tokenBalance,
                    dexterState.coinBalance
                );
            }

            let quipuCost = { xtzAmount: -1, rate: 0 };
            if (quipuState) {
                quipuCost = getXTZBuyExchangeRate(
                    new BigNumber(tokenValue).multipliedBy(10 ** (token.scale || 0)).toString(),
                    quipuState.tokenBalance,
                    quipuState.coinBalance
                );
            }

            setDexterTokenCost(applyFees(dexterCost.xtzAmount, 'buy'));
            setQuipuTokenCost(applyFees(quipuCost.xtzAmount, 'buy'));

            if ((dexterCost.xtzAmount > 0 && dexterCost.xtzAmount <= quipuCost.xtzAmount) || (quipuCost.xtzAmount < 0 && dexterCost.xtzAmount > 0)) {
                setBestMarket('Dexter');
            }

            if ((quipuCost.xtzAmount > 0 && dexterCost.xtzAmount > quipuCost.xtzAmount) || (dexterCost.xtzAmount < 0 && quipuCost.xtzAmount > 0)) {
                setBestMarket('QuipuSwap');
            }
        } else if (side === 'sell') {
            let dexterProceeds = { xtzAmount: -1, rate: 0 };
            if (dexterState) {
                dexterProceeds = getXTZSellExchangeRate(
                    new BigNumber(tokenValue).multipliedBy(10 ** (token.scale || 0)).toString(),
                    dexterState.tokenBalance,
                    dexterState.coinBalance
                );
            }

            let quipuProceeds = { xtzAmount: -1, rate: 0 };
            if (quipuState) {
                quipuProceeds = getXTZSellExchangeRate(
                    new BigNumber(tokenValue).multipliedBy(10 ** (token.scale || 0)).toString(),
                    quipuState.tokenBalance,
                    quipuState.coinBalance
                );
            }

            setDexterTokenProceeds(applyFees(dexterProceeds.xtzAmount, 'sell'));
            setQuipuTokenProceeds(applyFees(quipuProceeds.xtzAmount, 'sell'));

            if (
                (dexterProceeds.xtzAmount > 0 && dexterProceeds.xtzAmount >= quipuProceeds.xtzAmount) ||
                (quipuProceeds.xtzAmount < 0 && dexterProceeds.xtzAmount > 0)
            ) {
                setBestMarket('Dexter');
            }

            if (
                (quipuProceeds.xtzAmount > 0 && dexterProceeds.xtzAmount < quipuProceeds.xtzAmount) ||
                (dexterProceeds.xtzAmount < 0 && quipuProceeds.xtzAmount > 0)
            ) {
                setBestMarket('QuipuSwap');
            }
        }
    }

    async function onSend() {
        dispatch(setIsLoadingAction(true));

        if (isLedger) {
            setOpen(true);
        }

        if (tradeSide === 'buy' && bestMarket.toLowerCase() === 'dexter') {
            await dispatch(
                buyDexter(
                    tokenPoolMap[token.address].dexterPool,
                    new BigNumber(tokenAmount).multipliedBy(10 ** (token.scale || 0)).toString(),
                    new BigNumber(dexterTokenCost).toString(),
                    passPhrase
                )
            );
        } else if (tradeSide === 'buy' && bestMarket.toLowerCase() === 'quipuswap') {
            await dispatch(
                buyQuipu(
                    tokenPoolMap[token.address].quipuPool,
                    token.address,
                    new BigNumber(tokenAmount).multipliedBy(10 ** (token.scale || 0)).toString(),
                    new BigNumber(quipuTokenCost).toString(),
                    passPhrase
                )
            );
        } else if (tradeSide === 'sell' && bestMarket.toLowerCase() === 'dexter') {
            await dispatch(
                sellDexter(
                    tokenPoolMap[token.address].dexterPool,
                    token.address,
                    new BigNumber(tokenAmount).multipliedBy(10 ** (token.scale || 0)).toString(),
                    new BigNumber(dexterTokenProceeds).toString(),
                    passPhrase
                )
            );
        } else if (tradeSide === 'sell' && bestMarket.toLowerCase() === 'quipuswap') {
            await dispatch(
                sellQuipu(
                    tokenPoolMap[token.address].quipuPool,
                    token.address,
                    new BigNumber(tokenAmount).multipliedBy(10 ** (token.scale || 0)).toString(),
                    new BigNumber(quipuTokenProceeds).toString(),
                    passPhrase
                )
            );
        }

        setOpen(false);
        dispatch(setIsLoadingAction(false));
    }

    const { isIssue, warningMessage } = getBalanceState();
    const error = isIssue ? <InputError error={warningMessage} /> : '';

    // TODO: needs a popup explaining slippage, fees
    // TODO: needs a modal to accept disclaimer on actual amounts
    return (
        <Container>
            <RowContainer>
                <SegmentedControlContainer>
                    <RestoreTabs type={tradeSide} changeFunc={(val) => onTypeChange(val)} />
                </SegmentedControlContainer>

                <AmountContainer>
                    <NumericInput
                        label={t('general.nouns.amount')}
                        amount={tokenAmount}
                        onChange={updateAmount}
                        errorText={error}
                        symbol={token.symbol}
                        scale={token.scale || 0}
                        precision={token.precision || 6}
                        maxValue={new BigNumber(token.balance).dividedBy(10 ** (token.scale || 0)).toNumber()}
                        minValue={new BigNumber(1).dividedBy(10 ** (token.scale || 0)).toNumber()}
                    />
                </AmountContainer>
            </RowContainer>
            <RowContainer>
                {tokenAmount.length > 0 && tokenAmount !== '0' && tradeSide === 'buy' && dexterTokenCost > 0 && (
                    <>Cost on Dexter {formatAmount(dexterTokenCost)}</>
                )}
                {tokenAmount.length > 0 && tokenAmount !== '0' && tradeSide === 'buy' && quipuTokenCost > 0 && (
                    <>Cost on QuipuSwap {formatAmount(quipuTokenCost)}</>
                )}

                {tokenAmount.length > 0 && tokenAmount !== '0' && tradeSide === 'sell' && dexterTokenProceeds > 0 && (
                    <>Proceeds on Dexter {formatAmount(dexterTokenProceeds)}</>
                )}
                {tokenAmount.length > 0 && tokenAmount !== '0' && tradeSide === 'sell' && quipuTokenProceeds > 0 && (
                    <>Proceeds on Dexter {formatAmount(quipuTokenProceeds)}</>
                )}
            </RowContainer>

            <PasswordButtonContainer>
                {!isLedger && (
                    <PasswordInput
                        label={t('general.nouns.wallet_password')}
                        password={passPhrase}
                        onChange={(val) => setPassPhrase(val)}
                        containerStyle={{ width: '47%', marginTop: '10px' }}
                    />
                )}
                <InvokeButton buttonTheme="primary" disabled={isDisabled} onClick={() => onSend()}>
                    {t(`general.verbs.${tradeSide}`)} {t('general.prepositions.on')} {bestMarket}
                </InvokeButton>
            </PasswordButtonContainer>
            {/*isLedger && open && (
                <TokenLedgerConfirmationModal
                    fee={fee}
                    to={newAddress}
                    source={selectedParentHash}
                    amount={amount}
                    open={open}
                    onClose={() => setOpen(false)}
                    isLoading={isLoading}
                    op={SEND}
                    symbol={token.symbol}
                />
            )*/}
        </Container>
    );
}

export default Swap;
