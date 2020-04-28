import React, { useState } from 'react';
import styled from 'styled-components';
import { darken } from 'polished';
import IconButton from '@material-ui/core/IconButton';
import AddCircle from '@material-ui/icons/AddCircle';
import CloseIcon from '@material-ui/icons/Close';
import { StoreType } from 'conseiljs';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';

import { ms } from '../../styles/helpers';
import TezosIcon from '../TezosIcon';
import { H3 } from '../Heading';
import Button from '../Button';
import TezosAmount from '../TezosAmount';
import Address from '../Address/';
import AddressStatus from '../AddressStatus';
import { READY, PENDING } from '../../constants/StatusTypes';
import { isReady } from '../../utils/general';
import AddDelegateModal from '../ConfirmModals/AddDelegateModal';
import InteractContractModal from '../InteractContractModal';
import SecurityNoticeModal from '../SecurityNoticeModal';
import Tooltip from '../Tooltip';
import TokenNav from '../TokenNav';

import SignVerifyModal from '../../featureModals/SignVerify';
import AuthModal from '../../featureModals/Auth';
import { setModalOpen, clearModal } from '../../reduxContent/modal/actions';
import { changeAccountThunk } from '../../reduxContent/app/thunks';
import { getSelectedNode } from '../../reduxContent/settings/selectors';
import { getAddressType } from '../../utils/account';
import { getLocalData, setLocalData } from '../../utils/localData';

import { RootState } from '../../types/store';
import { AddressType, Identity } from '../../types/general';

const { Mnemonic } = StoreType;

const Container = styled.div`
    overflow: hidden;
`;

const AddressLabel = styled.div`
    padding: 9px 20px;
    display: flex;
    font-weight: 500;
    color: ${({ theme: { colors } }) => colors.primary};
    background: ${({ theme: { colors } }) => colors.gray1};
    align-items: center;
    justify-content: space-between;
`;

const AddDelegateLabel = styled(AddressLabel)`
    display: flex;
    flex-direction: row;
    font-size: 14px;
    margin-top: 20px;
    margin-bottom: 1px;
`;

const AddressesTitle = styled.div`
    display: flex;
    align-items: center;
    line-height: 1.5;
`;

const DelegateTitle = styled(AddressesTitle)`
    font-size: ${ms(-0.7)};
    font-weight: 500;
`;

const AccountTitle = styled(H3)`
    font-size: 18px;
    font-weight: 500;
    letter-spacing: 0.8px;
    padding: 0 ${ms(-1)} 0 0;
    display: inline-block;
    line-height: 1.5;
`;

const NoSmartAddressesContainer = styled.div`
    width: 100%;
    padding: ${ms(2)};
    background: ${({ theme: { colors } }) => colors.white};
    color: ${({ theme: { colors } }) => colors.secondary};
    font-size: ${ms(-1)};
    position: relative;
    margin-top: ${ms(1)};
`;
const NoSmartAddressesTitle = styled.span`
    color: ${({ theme: { colors } }) => colors.gray3};
    font-weight: 500;
    font-size: ${ms(1)};
`;

const NoSmartAddressesDescriptionList = styled.ul`
    margin: 0;
    padding: 0;
    margin-bottom: ${ms(1)};
    list-style-type: none;
`;

const NoSmartAddressesDescriptionItem = styled.li`
    display: flex;
    font-weight: ${({ theme: { typo } }) => typo.weights.light};
    color: ${({ theme: { colors } }) => colors.primary};
    padding: ${ms(-2)} 0;
    border-bottom: 1px solid ${({ theme: { colors } }) => colors.gray2};
`;

const NoSmartAddressesIcon = styled(TezosIcon)`
    padding-top: ${ms(-10)};
    padding-right: ${ms(-2)};
`;

const NoSmartAddressesButton = styled(Button)`
    border: 2px solid ${({ theme: { colors } }) => colors.gray3};
    padding: ${ms(-5)} ${ms(1)};
    font-weight: ${({ theme: { typo } }) => typo.weights.bold};
    width: 100%;
`;

const NoFundTooltip = styled.div`
    color: ${({ theme: { colors } }) => colors.primary};
    font-weight: 100;
    font-size: ${ms(-1)};
    max-width: ${ms(12)};
`;

const CloseIconWrapper = styled(CloseIcon)`
    position: absolute;
    top: ${ms(0)};
    right: ${ms(0)};
    fill: ${({ theme: { colors } }) => colors.secondary};
    width: ${ms(0)};
    height: ${ms(0)};
    cursor: pointer;
`;

const AddCircleWrapper = styled(AddCircle)<{ active: number }>`
    &&& {
        fill: #7b91c0;
        width: ${ms(1)};
        height: ${ms(1)};
        opacity: ${({ active }) => (active ? 1 : 0.5)};
        cursor: ${({ active }) => (active ? 'pointer' : 'default')};
    }
`;

interface Props {
    accountBlock: Identity;
    identityIndex: number;
}

function AddressBlock(props: Props) {
    const { accountBlock, identityIndex } = props;
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const selectedAccountHash = useSelector<RootState, string>(state => state.app.selectedAccountHash);
    const isModalOpen = useSelector<RootState, boolean>(state => state.modal.open);
    const activeModal = useSelector<RootState, string>(state => state.modal.activeModal);
    const selectedNode = useSelector(getSelectedNode);
    const tokens = useSelector((state: RootState) => state.wallet.tokens);

    const [isDelegateModalOpen, setIsDelegateModalOpen] = useState(false);
    const [isInteractModalOpen, setIsInteractModalOpen] = useState(false);
    const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
    const [isHideDelegateTooltip, setIsDelegateTooltip] = useState(() => getLocalData('isHideDelegateTooltip'));

    const { publicKeyHash, balance, accounts, status, storeType } = accountBlock;
    let regularAddresses = [{ pkh: publicKeyHash, balance }];
    const isManagerActive = publicKeyHash === selectedAccountHash;

    function hideDelegateTooltip() {
        setIsDelegateTooltip(true);
        setLocalData('isHideDelegateTooltip', true);
    }

    const onCheckInteractModal = () => {
        const { tezosUrl } = selectedNode;
        const index = tezosUrl.indexOf('localhost');
        const isNotShowMessage = getLocalData('isNotShowMessage');
        if (index >= 0 || isNotShowMessage) {
            setIsInteractModalOpen(true);
        } else {
            setIsSecurityModalOpen(true);
        }
    };

    const onProceedSecurityModal = () => {
        setIsInteractModalOpen(true);
        setIsSecurityModalOpen(false);
    };

    function goToAccount(addressId, index, addressType) {
        dispatch(changeAccountThunk(addressId, publicKeyHash, index, identityIndex, addressType));
    }

    function setIsModalOpen(open, active) {
        dispatch(setModalOpen(open, active));
        if (!open) {
            dispatch(clearModal());
        }
    }

    const getAddresses = addresses => {
        const addresses1: any[] = [];
        const addresses2: any[] = [];
        const addresses3: any[] = [];
        let totalBalance = 0;
        addresses.forEach(address => {
            const { script, account_id } = address;
            const addressType = getAddressType(account_id, script);
            if (addressType === AddressType.Delegated) {
                addresses2.push(address);
            } else if (addressType === AddressType.Smart) {
                addresses3.push(address);
            }

            if (address.status === READY || address.status === PENDING) {
                totalBalance += address.balance;
            }
        });
        return {
            newAddresses: addresses1,
            delegatedAddresses: addresses2.sort((a, b) => a.order - b.order),
            smartAddresses: addresses3.sort((a, b) => a.order - b.order),
            smartBalance: totalBalance
        };
    };

    const renderNoSmartAddressesDescription = arr => {
        return (
            <NoSmartAddressesDescriptionList>
                {arr.map((item, index) => {
                    return (
                        <NoSmartAddressesDescriptionItem key={index}>
                            <NoSmartAddressesIcon iconName="arrow-right" size={ms(0)} color="gray3" />
                            <div>{item}</div>
                        </NoSmartAddressesDescriptionItem>
                    );
                })}
            </NoSmartAddressesDescriptionList>
        );
    };

    const { newAddresses, delegatedAddresses, smartAddresses, smartBalance } = getAddresses(accounts);
    regularAddresses = regularAddresses.concat(newAddresses);

    const isDelegateToolTip = !!(isHideDelegateTooltip && delegatedAddresses.length && smartAddresses.length);

    const isManagerReady = status === READY;
    const noSmartAddressesDescriptionContent = [
        t('components.addressBlock.descriptions.description1'),
        t('components.addressBlock.descriptions.description2'),
        t('components.addressBlock.descriptions.description3'),
        t('components.addressBlock.descriptions.description4')
    ];
    const ready = isReady(status, storeType);
    const isSignModalOpen = isModalOpen && activeModal === 'sign';
    const isAuthModalOpen = isModalOpen && activeModal === 'auth';

    return (
        <Container>
            {ready ? (
                <Address isManager={true} isActive={isManagerActive} balance={balance} onClick={() => goToAccount(publicKeyHash, 0, AddressType.Manager)} />
            ) : (
                <AddressStatus isManager={true} isActive={isManagerActive} status={status} onClick={() => goToAccount(publicKeyHash, 0, AddressType.Manager)} />
            )}
            <AddDelegateLabel>
                <DelegateTitle>{t('components.addDelegateModal.add_delegate_title')}</DelegateTitle>
                {isManagerReady ? (
                    <AddCircleWrapper active={1} onClick={() => setIsDelegateModalOpen(true)} />
                ) : (
                    <Tooltip position="bottom" content={<NoFundTooltip>{t('components.addressBlock.not_ready_tooltip')}</NoFundTooltip>}>
                        <IconButton size="small" color="primary">
                            <AddCircleWrapper active={0} />
                        </IconButton>
                    </Tooltip>
                )}
            </AddDelegateLabel>

            {delegatedAddresses.map((address, index) => {
                const addressId = address.account_id;
                const isDelegatedActive = addressId === selectedAccountHash;
                const delegatedAddressReady = isReady(address.status);

                return delegatedAddressReady ? (
                    <Address
                        key={addressId}
                        isContract={true}
                        accountId={addressId}
                        isActive={isDelegatedActive}
                        balance={address.balance}
                        onClick={() => goToAccount(addressId, index, AddressType.Delegated)}
                    />
                ) : (
                    <AddressStatus
                        key={addressId}
                        isContract={true}
                        isActive={isDelegatedActive}
                        status={address.status}
                        onClick={() => goToAccount(addressId, index, AddressType.Delegated)}
                    />
                );
            })}

            <AddressLabel>
                <AccountTitle>{t('general.nouns.total_balance')}</AccountTitle>
                {ready || storeType === Mnemonic ? <TezosAmount color="primary" size={ms(0)} amount={balance + smartBalance} format={2} /> : null}
            </AddressLabel>

            <AddDelegateLabel>
                <DelegateTitle onClick={() => setIsModalOpen(true, 'sign')}>{t('general.nouns.sign_n_verify')}</DelegateTitle>
            </AddDelegateLabel>

            <AddDelegateLabel>
                <DelegateTitle>{t('general.nouns.tokens')}</DelegateTitle>
            </AddDelegateLabel>
            {tokens.map((token, index) => {
                if (!token.balance) {
                    return null;
                }

                let tokenType = AddressType.Token; // HACK
                if (token.kind === 'stkr') {
                    tokenType = AddressType.STKR;
                }
                if (token.kind === 'tzbtc') {
                    tokenType = AddressType.TzBTC;
                }
                console.log(`looking at token ${JSON.stringify(token)}`);
                return (
                    <TokenNav
                        key={token.address}
                        isActive={token.address === selectedAccountHash}
                        token={token}
                        onClick={() => goToAccount(token.address, index, tokenType)}
                    />
                );
            })}

            <AddDelegateLabel>
                <DelegateTitle>{t('components.interactModal.interact_contract')}</DelegateTitle>
                {isManagerReady ? (
                    <AddCircleWrapper active={1} onClick={() => onCheckInteractModal()} />
                ) : (
                    <Tooltip position="bottom" content={<NoFundTooltip>{t('components.addressBlock.not_ready_interact_tooltip')}</NoFundTooltip>}>
                        <IconButton size="small" color="primary">
                            <AddCircleWrapper active={0} />
                        </IconButton>
                    </Tooltip>
                )}
            </AddDelegateLabel>
            {smartAddresses.map((address, index) => {
                const addressId = address.account_id;
                const isActive = addressId === selectedAccountHash;
                const smartAddressReady = isReady(address.status);

                return smartAddressReady ? (
                    <Address
                        key={addressId}
                        isContract={true}
                        accountId={addressId}
                        isActive={isActive}
                        balance={address.balance}
                        onClick={() => goToAccount(addressId, index, AddressType.Smart)}
                    />
                ) : (
                    <AddressStatus
                        key={addressId}
                        isActive={isActive}
                        status={address.status}
                        isContract={true}
                        onClick={() => goToAccount(addressId, index, AddressType.Smart)}
                    />
                );
            })}

            {isSignModalOpen && <SignVerifyModal open={isSignModalOpen} onClose={() => setIsModalOpen(false, 'sign')} />}
            {isAuthModalOpen && <AuthModal open={isAuthModalOpen} onClose={() => setIsModalOpen(false, 'auth')} />}

            {isInteractModalOpen && (
                <InteractContractModal open={isInteractModalOpen} onClose={() => setIsInteractModalOpen(false)} addresses={regularAddresses} />
            )}

            {isDelegateModalOpen && <AddDelegateModal open={isDelegateModalOpen} onClose={() => setIsDelegateModalOpen(false)} managerBalance={balance} />}
            <SecurityNoticeModal open={isSecurityModalOpen} onClose={() => setIsSecurityModalOpen(false)} onProceed={onProceedSecurityModal} />
            {isDelegateToolTip && (
                <NoSmartAddressesContainer>
                    <CloseIconWrapper onClick={() => hideDelegateTooltip()} />
                    <NoSmartAddressesTitle>{t('components.addressBlock.delegation_tips')}</NoSmartAddressesTitle>
                    {renderNoSmartAddressesDescription(noSmartAddressesDescriptionContent)}
                    <NoSmartAddressesButton small={true} buttonTheme="secondary" onClick={() => setIsDelegateModalOpen(true)} disabled={!isManagerReady}>
                        {t('components.addDelegateModal.add_delegate_title')}
                    </NoSmartAddressesButton>
                </NoSmartAddressesContainer>
            )}
        </Container>
    );
}

export default AddressBlock;
