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
import { setIsLoadingAction } from '../../../reduxContent/app/actions';
import { RootState, AppState, SettingsState } from '../../../types/store';
import { Container, PasswordButtonContainer, InvokeButton, RowContainer } from '../../components/style';
import { InfoIcon } from '../../../featureModals/style';

import { SegmentedControlContainer, SegmentedControl, SegmentedControlItem, ColumnContainer, MessageContainer } from '../../components/Swap/style';
import {
    granadaPoolStorageMap,
    tokenPoolMap,
    getPoolState,
    calcPoolShare,
    calcCashLiquidityRequirement,
    applyFees,
    calcProposedShare,
} from '../../components/Swap/util';
import { addLiquidityThunk, removeLiquidityThunk } from '../thunks';
import { getAccountBalance } from '../util';

interface Props {
    isReady: boolean;
    token: Token;
}

interface ActionSelectorProps {
    type: string;
    changeFunc: (val: string) => void;
}

const ActionSelector = (props: ActionSelectorProps) => {
    const { t } = useTranslation();
    const { type, changeFunc } = props;

    return (
        <SegmentedControl>
            <SegmentedControlItem active={type === 'add'} onClick={() => changeFunc('add')}>
                {t('general.verbs.add')}
            </SegmentedControlItem>
            <SegmentedControlItem active={type === 'remove'} onClick={() => changeFunc('remove')}>
                {t('general.verbs.remove')}
            </SegmentedControlItem>
        </SegmentedControl>
    );
};

function Liquidity(props: Props) {
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const [tradeSide, setTradeSide] = useState('add');
    const [passPhrase, setPassPhrase] = useState('');
    const [ledgerModalOpen, setLedgerModalOpen] = useState(false);
    const [ammTokenBalance, setAMMTokenBalance] = useState('0.0');

    const [tokenAmount, setTokenAmount] = useState('');
    const [cashMatch, setCashMatch] = useState(0.0);
    const [poolPercent, setPoolPercent] = useState('0.000%');
    const [tokenShare, setTokenShare] = useState(0.0);
    const [cashShare, setCashShare] = useState(0.0);

    const { isLoading, isLedger, selectedParentHash, isWalletSyncing } = useSelector<RootState, AppState>((state: RootState) => state.app, shallowEqual);
    const { selectedNode, nodesList } = useSelector<RootState, SettingsState>((state: RootState) => state.settings, shallowEqual);
    const tezosUrl = getMainNode(nodesList, selectedNode).tezosUrl;

    const { isReady, token } = props;

    const isDisabled = !isReady || isLoading || (!passPhrase && !isLedger);

    const onTypeChange = (side: string) => {
        setTradeSide(side);
        updateCashRequirement(tokenAmount);
    };

    useEffect(() => {
        const getAMMTokenBalance = async () => {
            const balance = await getAccountBalance(tezosUrl, 9563, selectedParentHash).catch(() => {
                return 0;
            }); // TODO: 9563
            setAMMTokenBalance(new BigNumber(balance).dividedBy(10 ** 6).toString());
        };

        getAMMTokenBalance();
    }, [isWalletSyncing]);

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

    async function updateAmount(val: string) {
        setTokenAmount(val);

        if (tradeSide === 'add') {
            updateCashRequirement(val);
        } else if (tradeSide === 'remove') {
            updatePoolShare(val);
        }
    }

    async function updateCashRequirement(tokenValue: string) {
        const marketState = await getPoolState(tezosUrl, tokenPoolMap[token.address].granadaPool, granadaPoolStorageMap);

        let cashRequirement = 0;
        let proposedShare = '0.000%';
        if (marketState) {
            cashRequirement = calcCashLiquidityRequirement(
                new BigNumber(tokenValue).multipliedBy(10 ** (token.scale || 0)).toString(),
                marketState.tokenBalance,
                marketState.coinBalance
            );

            const proposedShareInt = calcProposedShare(cashRequirement.toString(), marketState.coinBalance, marketState.liquidityBalance);
            proposedShare = new BigNumber(proposedShareInt).dividedBy(marketState.liquidityBalance).multipliedBy(100).toFixed(3) + '%';
        }

        setCashMatch(applyFees(cashRequirement, 'buy', 0));
        setPoolPercent(proposedShare);
    }

    async function updatePoolShare(poolShare: string) {
        const marketState = await getPoolState(tezosUrl, tokenPoolMap[token.address].granadaPool, granadaPoolStorageMap);

        let poolPart = { cashShare: -1, tokenShare: -1 };
        if (marketState) {
            poolPart.cashShare = calcPoolShare(
                new BigNumber(poolShare).multipliedBy(10 ** 6).toString(),
                marketState.coinBalance,
                marketState.liquidityBalance
            );
            poolPart.tokenShare = calcPoolShare(
                new BigNumber(poolShare).multipliedBy(10 ** 6).toString(),
                marketState.tokenBalance,
                marketState.liquidityBalance
            );

            if (poolPart.cashShare > Number(marketState.coinBalance) || poolPart.tokenShare > Number(marketState.tokenBalance)) {
                poolPart = { cashShare: -1, tokenShare: -1 };
            }
        }

        setTokenShare(poolPart.tokenShare);
        setCashShare(poolPart.cashShare);
    }

    async function onSend() {
        dispatch(setIsLoadingAction(true));

        if (isLedger) {
            setLedgerModalOpen(true);
        }

        const marketState = await getPoolState(tezosUrl, tokenPoolMap[token.address].granadaPool, granadaPoolStorageMap);

        if (tradeSide === 'add' && marketState) {
            const wholeTokens = new BigNumber(tokenAmount).multipliedBy(10 ** (token.scale || 0)).toString();
            const cashRequirement = calcCashLiquidityRequirement(wholeTokens, marketState.tokenBalance, marketState.coinBalance);
            const poolShare = calcProposedShare(cashRequirement.toString(), marketState.coinBalance, marketState.liquidityBalance);

            await dispatch(
                addLiquidityThunk(tokenPoolMap[token.address].granadaPool, poolShare.toString(), cashRequirement.toString(), wholeTokens, passPhrase)
            );
        } else if (tradeSide === 'remove' && marketState) {
            const poolShare = new BigNumber(tokenAmount).multipliedBy(10 ** 6).toString();
            const poolCashShare = calcPoolShare(poolShare, marketState.coinBalance, marketState.liquidityBalance).toString();
            const poolTokenShare = calcPoolShare(poolShare, marketState.tokenBalance, marketState.liquidityBalance).toString();

            await dispatch(removeLiquidityThunk(tokenPoolMap[token.address].granadaPool, poolShare, poolCashShare, poolTokenShare, passPhrase));
        }

        setLedgerModalOpen(false);
        dispatch(setIsLoadingAction(false));
    }

    const { isIssue, warningMessage } = getBalanceState();
    const error = isIssue ? <InputError error={warningMessage} /> : '';

    return (
        <Container>
            <MessageContainer>
                <InfoIcon color="info" iconName="info" />
                {t('components.liquidity.description')}
            </MessageContainer>

            <RowContainer>
                <div style={{ width: '100%', paddingRight: '10px' }}>
                    {Number(ammTokenBalance) > 0 && <>Current LP token balance: {ammTokenBalance}</>}
                    <SegmentedControlContainer>
                        <ActionSelector type={tradeSide} changeFunc={(val) => onTypeChange(val)} />
                    </SegmentedControlContainer>
                </div>
                <ColumnContainer>
                    <div style={{ width: '100%', paddingLeft: '10px' }}>
                        <NumericInput
                            label={t('general.nouns.amount')}
                            amount={tokenAmount}
                            onChange={updateAmount}
                            errorText={error}
                            symbol={tradeSide === 'add' ? token.symbol : 'LP Tokens'}
                            scale={tradeSide === 'add' ? token.scale || 0 : 6}
                            precision={tradeSide === 'add' ? token.precision || 6 : 6}
                        />

                        {tokenAmount.length > 0 && tokenAmount !== '0' && tradeSide === 'add' && (
                            <>
                                Required deposit {formatAmount(cashMatch)} XTZ, {poolPercent} of pool
                            </>
                        )}

                        {tokenAmount.length > 0 && tokenAmount !== '0' && tradeSide === 'remove' && (
                            <>
                                Proceeds: {formatAmount(cashShare, 6, 6, false)} XTZ, {formatAmount(tokenShare, 8, 8, false)} {token.symbol}
                            </>
                        )}
                    </div>
                </ColumnContainer>
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
                {isLedger && ledgerModalOpen && <>Please confirm the operation on the Ledger device</>}
                <InvokeButton buttonTheme="primary" disabled={isDisabled} onClick={() => onSend()}>
                    {t(`general.verbs.${tradeSide}`)} Liquidity
                </InvokeButton>
            </PasswordButtonContainer>
        </Container>
    );
}

export default Liquidity;
