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
import { useFetchFees } from '../../../reduxContent/app/thunks';
import { setIsLoadingAction } from '../../../reduxContent/app/actions';

import { RootState, AppState, SettingsState } from '../../../types/store';
import { Container, AmountContainer, PasswordButtonContainer, InvokeButton, RowContainer } from '../style';

import { dexterPoolStorageMap, quipuPoolStorageMap, tokenPoolMap, getPoolState, getXTZBuyExchangeRate, getXTZSellExchangeRate } from './util';

interface Props {
    isReady: boolean;
    token: Token;
}

function Swap(props: Props) {
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const [passPhrase, setPassPhrase] = useState('');

    const [buyTokenAmount, setBuyTokenAmount] = useState('');
    const [dexterTokenCost, setDexterTokenCost] = useState(0.0);
    const [quipuTokenCost, setQuipuTokenCost] = useState(0.0);

    const [sellTokenAmount, setSellTokenAmount] = useState('');
    const [dexterTokenProceeds, setDexterTokenProceeds] = useState(0.0);
    const [quipuTokenProceeds, setQuipuTokenProceeds] = useState(0.0);

    const [open, setOpen] = useState(false);

    const { isLoading, isLedger, selectedParentHash } = useSelector<RootState, AppState>((state: RootState) => state.app, shallowEqual);
    const { selectedNode, nodesList } = useSelector<RootState, SettingsState>((state: RootState) => state.settings, shallowEqual);
    const tezosUrl = getMainNode(nodesList, selectedNode).tezosUrl;

    const { isReady, token } = props;

    const isDisabled = !isReady || isLoading || (!passPhrase && !isLedger);

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

    async function updateBuyAmount(val) {
        setBuyTokenAmount(val);

        const dexterState = await getPoolState(tezosUrl, tokenPoolMap[token.address].dexterPool, dexterPoolStorageMap);
        const quipuState = await getPoolState(tezosUrl, tokenPoolMap[token.address].quipuPool, quipuPoolStorageMap);

        const dexterProceeds = getXTZBuyExchangeRate(
            new BigNumber(val).multipliedBy(10 ** (token.scale || 0)).toString(),
            dexterState.tokenBalance,
            dexterState.coinBalance
        );
        const quipuProceeds = getXTZBuyExchangeRate(
            new BigNumber(val).multipliedBy(10 ** (token.scale || 0)).toString(),
            quipuState.tokenBalance,
            quipuState.coinBalance
        );

        setDexterTokenCost(dexterProceeds.xtzAmount);
        setQuipuTokenCost(quipuProceeds.xtzAmount);
    }

    async function updateSellAmount(val) {
        setSellTokenAmount(val);

        const dexterState = await getPoolState(tezosUrl, tokenPoolMap[token.address].dexterPool, dexterPoolStorageMap);
        const quipuState = await getPoolState(tezosUrl, tokenPoolMap[token.address].quipuPool, quipuPoolStorageMap);

        const dexterProceeds = getXTZSellExchangeRate(
            new BigNumber(val).multipliedBy(10 ** (token.scale || 0)).toString(),
            dexterState.tokenBalance,
            dexterState.coinBalance
        );
        const quipuProceeds = getXTZSellExchangeRate(
            new BigNumber(val).multipliedBy(10 ** (token.scale || 0)).toString(),
            quipuState.tokenBalance,
            quipuState.coinBalance
        );

        setDexterTokenProceeds(dexterProceeds.xtzAmount);
        setQuipuTokenProceeds(quipuProceeds.xtzAmount);
    }

    async function onSend() {
        dispatch(setIsLoadingAction(true));

        if (isLedger) {
            setOpen(true);
        }

        // await dispatch(tokenTransferAction(newAddress, new BigNumber(amount).multipliedBy(10 ** (token.scale || 0)).toFixed(), fee, passPhrase));
        setOpen(false);
        dispatch(setIsLoadingAction(false));
    }

    const { isIssue, warningMessage } = getBalanceState();
    const error = isIssue ? <InputError error={warningMessage} /> : '';

    return (
        <Container>
            <RowContainer>
                <AmountContainer>
                    <NumericInput
                        label={t('general.verbs.sell')}
                        amount={sellTokenAmount}
                        onChange={updateSellAmount}
                        errorText={error}
                        symbol={token.symbol}
                        scale={token.scale || 0}
                        precision={token.precision || 6}
                        maxValue={new BigNumber(token.balance).dividedBy(10 ** (token.scale || 0)).toNumber()}
                        minValue={new BigNumber(1).dividedBy(10 ** (token.scale || 0)).toNumber()}
                    />
                </AmountContainer>
                <>
                    Proceeds: D{formatAmount(dexterTokenProceeds)} Q{formatAmount(quipuTokenProceeds)}
                </>
            </RowContainer>
            <RowContainer>
                <AmountContainer>
                    <NumericInput
                        label={t('general.verbs.buy')}
                        amount={buyTokenAmount}
                        onChange={updateBuyAmount}
                        errorText={error}
                        symbol={token.symbol}
                        scale={token.scale || 0}
                        precision={token.precision || 6}
                        maxValue={new BigNumber(token.balance).dividedBy(10 ** (token.scale || 0)).toNumber()}
                        minValue={new BigNumber(1).dividedBy(10 ** (token.scale || 0)).toNumber()}
                    />
                </AmountContainer>
                <>
                    Cost: D{formatAmount(dexterTokenCost)} Q{formatAmount(quipuTokenCost)}
                </>
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
                    {t('general.verbs.send')}
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
