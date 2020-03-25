import React, { useState } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { StoreType } from 'conseiljs';
import { useTranslation } from 'react-i18next';
import IconButton from '@material-ui/core/IconButton';

import TezosAddress from '../TezosAddress';
import Update from '../Update';
import Modal from '../CustomModal';
import Tooltip from '../Tooltip';
import { openLink } from '../../utils/general';
import { AddressType } from '../../types/general';
import keyIconSvg from '../../../resources/imgs/Key_Icon.svg';
import circleKeyIconSvg from '../../../resources/imgs/Circle_Key_Icon.svg';
import { ms } from '../../styles/helpers';
import { syncWalletThunk } from '../../reduxContent/wallet/thunks';

import { RootState } from '../../types/store';

const { Mnemonic } = StoreType;

import {
  Container,
  TopRow,
  BottomRow,
  AddressTitle,
  AddressTitleIcon,
  AddressInfo,
  Amount,
  Delegate,
  DelegateContainer,
  Breadcrumbs,
  CircleKeyIcon,
  KeyIconButton,
  KeyIcon,
  ModalContent,
  ButtonContainer,
  CloseButton,
  HideShowContainer,
  KeyContainer,
  WarningContainer,
  WarningTxt,
  StoreTxt,
  BellIcon,
  TooltipContent
} from './style';

interface Props {
  storeType?: string | number;
  isReady: boolean;
  balance: number;
  publicKeyHash: string;
  privateKey: string;
  delegatedAddress?: string | null;
  displayName?: string;
  symbol?: string;
}

function BalanceBanner(props: Props) {
  const {
    storeType,
    isReady,
    balance,
    privateKey,
    publicKeyHash,
    delegatedAddress,
    displayName,
    symbol
  } = props;

  const { t } = useTranslation();
  const dispatch = useDispatch();
  const {
    time,
    isWalletSyncing,
    isLedger,
    selectedAccountType,
    selectedAccountIndex,
    selectedParentIndex
  } = useSelector((state: RootState) => state.app, shallowEqual);
  const addressIndex = selectedAccountIndex + 1;
  const parentIndex = selectedParentIndex + 1;

  const [isOpen, setIsOpen] = useState(false);
  const [isShowKey, setIsShowKey] = useState(false);

  const secretPrivateKey = privateKey.split('').map(() => '*');

  let addressLabel = '';
  switch (selectedAccountType) {
    case AddressType.Manager: {
      addressLabel = t('components.address.manager_address');
      break;
    }
    case AddressType.Smart: {
      addressLabel = `${t('general.nouns.smart_contract')} ${addressIndex}`;
      break;
    }
    case AddressType.Token: {
      addressLabel = `${t('general.nouns.token_contract')} ${addressIndex}`;
      break;
    }
    default: {
      addressLabel = t('components.address.delegation_contract', { index: addressIndex });
      break;
    }
  }

  const isManager = selectedAccountType === AddressType.Manager;

  const breadcrumbs = t('components.balanceBanner.breadcrumbs', { parentIndex, addressLabel });

  function onSyncWallet() {
    dispatch(syncWalletThunk());
  }

  function openUrl() {
    const newUrl = `https://t.me/TezosNotifierBot?start=mininax_${publicKeyHash}`;
    openLink(newUrl);
  }

  return (
    <Container>
      <TopRow isReady={isReady}>
        <Breadcrumbs>{breadcrumbs}</Breadcrumbs>
        <Update
          onClick={onSyncWallet}
          time={time}
          isReady={isReady}
          isWalletSyncing={isWalletSyncing}
        />
      </TopRow>
      <BottomRow isReady={isReady}>
        {selectedAccountType !== AddressType.Smart && (
          <AddressTitle>
            {selectedAccountType !== AddressType.Token && (
              <AddressTitleIcon
                iconName={isManager ? 'manager' : 'smart-address'}
                size={ms(0)}
                color="white"
              />
            )}
            {!displayName ? addressLabel : displayName}

            {isManager && !isLedger && (
              <KeyIconButton size="small" color="primary" onClick={() => setIsOpen(true)}>
                <KeyIcon src={keyIconSvg} />
              </KeyIconButton>
            )}
            {isManager && (
              <Tooltip
                position="bottom"
                content={
                  <TooltipContent>{t('components.balanceBanner.tooltip_content')}</TooltipContent>
                }
              >
                <IconButton size="small" color="primary" onClick={() => openUrl()}>
                  <BellIcon />
                </IconButton>
              </Tooltip>
            )}
          </AddressTitle>
        )}
        <AddressInfo>
          <TezosAddress
            address={publicKeyHash}
            weight={100}
            color="white"
            text={publicKeyHash}
            size={ms(1.7)}
          />

          {isReady || storeType === Mnemonic ? (
            <Amount
              color="white"
              size={ms(4.5)}
              amount={balance}
              weight="light"
              format={2}
              symbol={symbol}
              showTooltip={true}
            />
          ) : null}
        </AddressInfo>
        {delegatedAddress && (
          <DelegateContainer>
            <Delegate>{t('components.balanceBanner.delegated_to')}</Delegate>
            <TezosAddress address={delegatedAddress} color="white" size={ms(-1)} weight={300} />
          </DelegateContainer>
        )}
      </BottomRow>
      <Modal
        title={t('components.balanceBanner.secret_key')}
        open={isOpen}
        onClose={() => setIsOpen(false)}
      >
        <ModalContent>
          <HideShowContainer onClick={() => setIsShowKey(!isShowKey)}>
            {isShowKey
              ? t('components.balanceBanner.hide_key')
              : t('components.balanceBanner.reveal_key')}
          </HideShowContainer>
          <KeyContainer>{isShowKey ? privateKey : secretPrivateKey}</KeyContainer>
          <WarningContainer>
            <CircleKeyIcon src={circleKeyIconSvg} />
            <StoreTxt>
              <WarningTxt>{t('components.balanceBanner.warning')}</WarningTxt>
              {t('components.balanceBanner.do_not_store')}
            </StoreTxt>
          </WarningContainer>
          <ButtonContainer>
            <CloseButton buttonTheme="primary" onClick={() => setIsOpen(false)}>
              {t('general.verbs.close')}
            </CloseButton>
          </ButtonContainer>
        </ModalContent>
      </Modal>
    </Container>
  );
}

BalanceBanner.defaultProps = {
  parentIndex: 0,
  isWalletSyncing: false
};

export default BalanceBanner;
