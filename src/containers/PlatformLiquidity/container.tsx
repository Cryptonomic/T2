import * as React from 'react';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { BigNumber } from 'bignumber.js';

import { Container as TopWrapper, TopRow, BottomRow, Breadcrumbs, AddressTitle } from '../../components/BalanceBanner/style';
import { Container } from '../../contracts/components/TabContainer/style';
import { BottomRowInner, Link, LinkIcon, BodyContainer, ColumnContainer, MessageContainer, BlockMessageContainer } from './style';

import { SegmentedControlContainer, SegmentedControl, SegmentedControlItem } from '../../contracts/components/Swap/style';
import { PasswordButtonContainer, InvokeButton, RowContainer } from '../../contracts/components/style';
import { InfoIcon } from '../../featureModals/style';
import PasswordInput from '../../components/PasswordInput';
import NumericInput from '../../components/NumericInput';

import Update from '../../components/Update';

import { syncWalletThunk } from '../../reduxContent/wallet/thunks';

import { openLink, isReady } from '../../utils/general';

import { getAccountSelector } from '../../contracts/duck/selectors';

import { RootState, AppState, SettingsState } from '../../types/store';

import { liquiditySupportURL } from '../../config.json';

import AmountView from '../../components/AmountView';
import TezosAmount from '../../components/TezosAmount';
import { ms } from '../../styles/helpers';

import {
    granadaPoolStorageMap,
    tokenPoolMap,
    getPoolState,
    calcPoolShare,
    calcTokenLiquidityRequirement,
    getTokenToCashInverse,
    applyFees,
    calcProposedShare,
} from '../../contracts/components/Swap/util';
import { addLiquidityThunk, removeLiquidityThunk } from '../../contracts/TzBtcToken/thunks';
import { getAccountBalance } from '../../contracts/TzBtcToken/util';

import { getMainNode } from '../../utils/settings';
import { setIsLoadingAction } from '../../reduxContent/app/actions';
import { formatAmount } from '../../utils/currency';

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
                {t('components.platformLiquidity.add')}
            </SegmentedControlItem>
            <SegmentedControlItem active={type === 'remove'} onClick={() => changeFunc('remove')}>
                {t('components.platformLiquidity.remove')}
            </SegmentedControlItem>
        </SegmentedControl>
    );
};

const PlatformLiquidity = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { time, selectedParentIndex } = useSelector((state: RootState) => state.app);
    const selectedAccount = useSelector(getAccountSelector);
    const tokens = useSelector((state: RootState) => state.wallet.tokens);

    const { storeType, status, balance } = selectedAccount;
    const isReadyProp = isReady(status, storeType);

    const token = tokens.find((tkn) => tkn.address === 'KT1PWx2mnDueood7fEmfbBDKx1D9BAnnXitn')!;

    const onSyncWallet = () => dispatch(syncWalletThunk());

    const onClickLink = (link: string) => openLink(link);

    const [tradeSide, setTradeSide] = useState('add');
    const [passPhrase, setPassPhrase] = useState('');
    const [ledgerModalOpen, setLedgerModalOpen] = useState(false);
    const [ammTokenBalance, setAMMTokenBalance] = useState(0);

    const [cashAmount, setCashAmount] = useState('0');
    const [lpAmount, setLPAmount] = useState('0');
    const [tokenMatch, setTokenMatch] = useState(0.0);
    const [poolPercent, setPoolPercent] = useState('0.000%');
    const [tokenShare, setTokenShare] = useState(0.0);
    const [cashShare, setCashShare] = useState(0.0);

    const [cashError, setCashError] = useState('');
    const [tokenError, setTokenError] = useState('');
    const [lpError, setLPError] = useState('');

    const [tokenShortFall, setTokenShortFall] = useState('');
    const [tokenShortFallCost, setTokenShortFallCost] = useState('');
    const [tokenShortFallMessage, setTokenShortFallMessage] = useState('');
    const [shortFallBlock, setShortFallBlock] = useState(false);

    const { isLoading, isLedger, selectedParentHash, isWalletSyncing } = useSelector<RootState, AppState>((state: RootState) => state.app, shallowEqual);
    const { selectedNode, nodesList } = useSelector<RootState, SettingsState>((state: RootState) => state.settings, shallowEqual);
    const tezosUrl = getMainNode(nodesList, selectedNode).tezosUrl;

    const isDisabled = !isReady || isLoading || (!passPhrase && !isLedger);

    const onTypeChange = (side: string) => {
        setTradeSide(side);

        setLPAmount('0');
        setLPError('');

        setCashAmount('0');
        setCashError('');
        setTokenMatch(0);
        setTokenError('');
        setTokenShortFall('');
        setTokenShortFallCost('');
        setTokenShortFallMessage('');
        setShortFallBlock(false);
    };

    useEffect(() => {
        const getAMMTokenBalance = async () => {
            const ammbalance = await getAccountBalance(tezosUrl, 9563, selectedParentHash).catch(() => {
                return 0;
            }); // TODO: 9563
            setAMMTokenBalance(ammbalance);
        };

        getAMMTokenBalance();
    }, [isWalletSyncing]);

    async function updateCashAmount(val: string) {
        setCashAmount(val);
        const _tokenMatch = await updateTokenRequirement(val);

        if (new BigNumber(balance).dividedBy(1_000_000).lt(val)) {
            setCashError('Amount exceeds account balance');
        } else {
            setCashError('');
        }

        if (new BigNumber(token.balance).lt(_tokenMatch)) {
            setTokenError('Token requirement exceeds account balance');

            const marketState = await getPoolState(tezosUrl, tokenPoolMap[token.address].granadaPool, granadaPoolStorageMap);
            const diff = new BigNumber(_tokenMatch).minus(token.balance);

            const diffCost = getTokenToCashInverse(diff.toString(), marketState!.tokenBalance, marketState!.coinBalance, token.scale).cashAmount;
            const diffCostSlippage = new BigNumber(diffCost).multipliedBy(101).dividedBy(100).decimalPlaces(0, 1);

            setTokenShortFall(diff.toString());
            setTokenShortFallCost(diffCostSlippage.toString());

            setShortFallBlock(false);
            let shortFallMessage = t('components.platformLiquidity.shortfall', {
                enough: token.balance === 0 ? 'any' : 'enough',
                shortFallCost: formatAmount(tokenShortFallCost),
                shortFall: formatAmount(tokenShortFall, token.scale, token.scale),
                shortFallTotal: formatAmount(Number(tokenShortFallCost) + new BigNumber(cashAmount).multipliedBy(1_000_000).toNumber()),
            });

            if (new BigNumber(cashAmount).multipliedBy(1_000_000).plus(diffCost).gte(balance)) {
                shortFallMessage = t('components.platformLiquidity.low_funds');
                setShortFallBlock(true);
            }
            setTokenShortFallMessage(shortFallMessage);
        } else {
            setTokenError('');
            setTokenShortFall('');
            setTokenShortFallCost('');
            setTokenShortFallMessage('');
            setShortFallBlock(false);
        }
    }

    async function updateTokenRequirement(cashValue: string) {
        const marketState = await getPoolState(tezosUrl, tokenPoolMap[token.address].granadaPool, granadaPoolStorageMap);

        let tokenRequirement = 0;
        let proposedShare = '0.000%';
        if (marketState) {
            tokenRequirement = calcTokenLiquidityRequirement(
                new BigNumber(cashValue).multipliedBy(1_000_000).toString(),
                marketState.tokenBalance,
                marketState.coinBalance
            );

            const proposedShareInt = calcProposedShare(tokenRequirement.toString(), marketState.tokenBalance, marketState.liquidityBalance);
            proposedShare = new BigNumber(proposedShareInt).dividedBy(marketState.liquidityBalance).multipliedBy(100).toFixed(3) + '%';
        }

        const _tokenMatch = applyFees(tokenRequirement, 'buy', 0);
        setTokenMatch(_tokenMatch);
        setPoolPercent(proposedShare);

        return _tokenMatch;
    }

    async function updateLPAmount(val: string) {
        setLPAmount(val);

        setLPError('');

        if (new BigNumber(val).multipliedBy(1_000_000).gt(ammTokenBalance)) {
            setLPError('LP token amount exceeds balance');
        }

        updatePoolShare(val);
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
            const wholeCoins = new BigNumber(cashAmount).multipliedBy(1_000_000).toString();
            const tokenRequirement = calcTokenLiquidityRequirement(wholeCoins, marketState.tokenBalance, marketState.coinBalance);
            const poolShare = calcProposedShare(tokenRequirement.toString(), marketState.tokenBalance, marketState.liquidityBalance);
            const tokenRequirementSlippage = new BigNumber(tokenRequirement).multipliedBy(101).dividedBy(100).decimalPlaces(0, 1).toNumber();

            await dispatch(
                addLiquidityThunk(
                    tokenPoolMap[token.address].granadaPool,
                    poolShare.toString(),
                    wholeCoins,
                    tokenRequirementSlippage.toString(),
                    passPhrase,
                    tokenShortFall,
                    tokenShortFallCost
                )
            );
        } else if (tradeSide === 'remove' && marketState) {
            const poolShare = new BigNumber(lpAmount).multipliedBy(10 ** 6).toString();
            const poolCashShare = calcPoolShare(poolShare, marketState.coinBalance, marketState.liquidityBalance).toString();
            const poolTokenShare = calcPoolShare(poolShare, marketState.tokenBalance, marketState.liquidityBalance).toString();

            await dispatch(removeLiquidityThunk(tokenPoolMap[token.address].granadaPool, poolShare, poolCashShare, poolTokenShare, passPhrase));
        }

        setLedgerModalOpen(false);
        dispatch(setIsLoadingAction(false));
    }

    return (
        <Container>
            <TopWrapper>
                <TopRow isReady={isReadyProp}>
                    <Breadcrumbs>
                        {t('components.balanceBanner.breadcrumbs', { parentIndex: selectedParentIndex + 1, addressLabel: 'Liquidity Baking' })}
                    </Breadcrumbs>
                    <Update onClick={onSyncWallet} time={time} isReady={isReadyProp} isWalletSyncing={isWalletSyncing} />
                </TopRow>
                <BottomRow isReady={isReadyProp}>
                    <BottomRowInner>
                        <AddressTitle>Liquidity Baking</AddressTitle>
                        {liquiditySupportURL && liquiditySupportURL.length > 0 && (
                            <Link onClick={() => onClickLink(liquiditySupportURL)}>
                                Learn more <LinkIcon />
                            </Link>
                        )}
                    </BottomRowInner>
                    <BottomRowInner>
                        <AmountView
                            color="white"
                            size={ms(4.5)}
                            amount={token.balance}
                            weight="light"
                            symbol={token.symbol}
                            showTooltip={true}
                            scale={token.scale}
                            precision={token.precision}
                            round={token.round}
                        />

                        <TezosAmount color="white" size={ms(4.5)} amount={balance} weight="light" format={2} showTooltip={true} />

                        <AmountView
                            color="white"
                            size={ms(4.5)}
                            amount={ammTokenBalance}
                            weight="light"
                            symbol={'LP'}
                            showTooltip={true}
                            scale={6}
                            precision={6}
                            round={6}
                        />
                    </BottomRowInner>
                </BottomRow>
            </TopWrapper>
            <BodyContainer>
                <MessageContainer>{t('components.platformLiquidity.description')}</MessageContainer>

                <RowContainer>
                    <div style={{ width: '100%', paddingRight: '10px' }}>
                        <SegmentedControlContainer>
                            <ActionSelector type={tradeSide} changeFunc={(val) => onTypeChange(val)} />
                        </SegmentedControlContainer>
                    </div>
                </RowContainer>
                <RowContainer>
                    {tradeSide === 'add' && (
                        <>
                            <ColumnContainer>
                                <div style={{ width: '100%' }}>
                                    <NumericInput
                                        label={t('components.platformLiquidity.xtz_deposit')}
                                        amount={cashAmount}
                                        onChange={updateCashAmount}
                                        errorText={cashError}
                                        scale={6}
                                        precision={6}
                                    />
                                </div>
                            </ColumnContainer>
                            <ColumnContainer>
                                <div style={{ width: '100%' }}>
                                    <NumericInput
                                        label={t('components.platformLiquidity.token_deposit')}
                                        amount={formatAmount(tokenMatch, token.precision, token.scale)}
                                        onChange={(v) => {
                                            return;
                                        }}
                                        errorText={''}
                                        symbol={token.symbol}
                                        scale={token.scale}
                                        precision={token.precision || 8}
                                        disabled={true}
                                    />
                                </div>
                            </ColumnContainer>
                        </>
                    )}
                    {tradeSide === 'remove' && (
                        <>
                            <ColumnContainer>
                                <div style={{ width: '100%' }}>
                                    <NumericInput
                                        label={t('components.platformLiquidity.lp_amount')}
                                        amount={lpAmount}
                                        onChange={updateLPAmount}
                                        errorText={lpError}
                                        symbol={'LP'}
                                        scale={6}
                                        precision={6}
                                    />
                                </div>
                            </ColumnContainer>
                        </>
                    )}
                </RowContainer>

                <RowContainer>
                    {tradeSide === 'add' && Number(cashAmount) > 0 && !shortFallBlock && (
                        <MessageContainer>Expected pool share {poolPercent}.</MessageContainer>
                    )}

                    {Number(lpAmount) > 0 && tradeSide === 'remove' && (
                        <MessageContainer>
                            Proceeds: {formatAmount(cashShare, 6, 6, false)} XTZ, {formatAmount(tokenShare, 8, 8, false)} {token.symbol}
                        </MessageContainer>
                    )}
                </RowContainer>
                <RowContainer>
                    <MessageContainer>
                        <InfoIcon color="info" iconName="info" />
                        {t('components.platformLiquidity.estimate_warning')}
                    </MessageContainer>
                </RowContainer>

                {tokenError.length > 0 && (
                    <RowContainer>
                        <BlockMessageContainer>{tokenShortFallMessage}</BlockMessageContainer>
                    </RowContainer>
                )}

                {((tradeSide === 'add' && !shortFallBlock) || (tradeSide === 'remove' && lpError.length === 0)) && (
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
                )}
            </BodyContainer>
        </Container>
    );
};

export default PlatformLiquidity;
