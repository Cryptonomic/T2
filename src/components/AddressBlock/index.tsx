import React, { Fragment, useState } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { darken } from 'polished';
import IconButton from '@material-ui/core/IconButton';
import AddCircle from '@material-ui/icons/AddCircle';
import CloseIcon from '@material-ui/icons/Close';
import { StoreType } from 'conseiljs';
import { withTranslation, WithTranslation } from 'react-i18next';

import { ms } from '../../styles/helpers';
import TezosIcon from '../TezosIcon';
import { H3 } from '../Heading';
import Button from '../Button';
import TezosAmount from '../TezosAmount/';
import Address from '../Address/';
import AddressStatus from '../AddressStatus';
import { READY, PENDING } from '../../constants/StatusTypes';
import { isReady } from '../../utils/general';
// import AddDelegateModal from '../AddDelegateModal';
// import InteractContractModal from '../InteractContractModal';
// import SecurityNoticeModal from '../SecurityNoticeModal';
import Tooltip from '../Tooltip';

// import { hideDelegateTooltip } from '../../reduxContent/settings/thunks';
import { getAddressType } from '../../utils/account';

import { RootState } from '../../types/store';
import { AddressType } from '../../types/general';

const { Mnemonic } = StoreType;

const Container = styled.div`
  overflow: hidden;
`;

const AddressLabel = styled.div`
  padding: ${ms(-1)} ${ms(2)};
  display: flex;
  font-weight: ${({ theme: { typo } }) => typo.weights.bold};
  color: ${({ theme: { colors } }) => colors.primary};
  background: ${({ theme: { colors } }) => colors.gray1};
  align-items: center;
  justify-content: space-between;
`;

const AddDelegateLabel = styled(AddressLabel)`
  display: flex;
  flex-direction: row;
  font-size: ${ms(0)};
`;

const InteractContractLabel = styled(AddDelegateLabel)``;

const AddressesTitle = styled.div`
  display: flex;
  align-items: center;
  line-height: 1.5;
`;

const DelegateTitle = styled(AddressesTitle)`
  font-size: ${ms(-0.7)};
  font-weight: ${({
    theme: {
      typo: { weights }
    }
  }) => weights.bold};
`;

const AccountTitle = styled(H3)`
  font-size: ${ms(0.7)};
  font-weight: ${({ theme: { typo } }) => typo.weights.bold};
  letter-spacing: 0.8px;
  padding: 0 ${ms(-1)} 0 0;
  display: inline-block;
  line-height: 1.5;
  border-right: 2px solid ${({ theme: { colors } }) => darken(0.05, colors.gray1)};
  @media (max-width: 1200px) {
    border-right: none;
  }
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
  font-weight: ${({ theme: { typo } }) => typo.weights.bold};
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

interface OwnProps {
  // hideDelegateTooltip: () => void,
  delegateTooltip: boolean;
  selectedNode: string;
  nodesList: any[];
  accountBlock: any; // TODO: type this
  // syncAccountOrIdentity: () => void,
  selectedAccountHash: string;
}

type Props = OwnProps & WithTranslation;

function AddressBlock(props: Props) {
  const { accountBlock, selectedAccountHash, delegateTooltip, t } = props;
  const [isDelegateModalOpen, setIsDelegateModalOpen] = useState(false);
  const [isInteractModalOpen, setIsInteractModalOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);

  // openDelegateModal = () => this.setState({ isDelegateModalOpen: true });
  // closeDelegateModal = () => this.setState({ isDelegateModalOpen: false });

  // openInteractModal = () => this.setState({ isInteractModalOpen: true });

  const onCheckInteractModal = () => {
    // const index = nodeUrl.indexOf('localhost');
    // const isNotShowMessage = localStorage.getItem('isNotShowMessage');
    // if (index >= 0 || isNotShowMessage) {
    //   this.openInteractModal();
    // } else {
    //   this.setState({ isSecurityModalOpen: true });
    // }
  };

  const onProceedSecurityModal = () => {
    setIsInteractModalOpen(true);
    setIsSecurityModalOpen(true);
  };
  // closeInteractModal = () => this.setState({ isInteractModalOpen: false });
  // closeSecurityModal = () => this.setState({ isSecurityModalOpen: false });

  function goToAccount(addressId, index) {
    // const { history, syncAccountOrIdentity } = this.props;
    // history.push(
    //   `/home/addresses/${selectedAccountHash}/${selectedParentHash}/${index}`
    // );
    // syncAccountOrIdentity(selectedAccountHash, selectedParentHash);
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

  const { publicKeyHash, balance, accounts, status, storeType } = accountBlock;
  let regularAddresses = [{ pkh: publicKeyHash, balance }];
  const isManagerActive = publicKeyHash === selectedAccountHash;
  const { newAddresses, delegatedAddresses, smartAddresses, smartBalance } = getAddresses(accounts);
  regularAddresses = regularAddresses.concat(newAddresses);

  const isDelegateToolTip = !!(
    delegateTooltip &&
    delegatedAddresses.length &&
    smartAddresses.length
  );

  const isManagerReady = status === READY;
  const noSmartAddressesDescriptionContent = [
    t('components.addressBlock.descriptions.description1'),
    t('components.addressBlock.descriptions.description2'),
    t('components.addressBlock.descriptions.description3'),
    t('components.addressBlock.descriptions.description4')
  ];
  const ready = isReady(status, storeType);

  return (
    <Container>
      {ready ? (
        <Address
          isManager={true}
          isActive={isManagerActive}
          balance={balance}
          onClick={() => goToAccount(publicKeyHash, 0)}
        />
      ) : (
        <AddressStatus
          isManager={true}
          isActive={isManagerActive}
          status={accountBlock.get('status')}
          onClick={() => goToAccount(publicKeyHash, 0)}
        />
      )}
      <Fragment>
        <AddDelegateLabel>
          <DelegateTitle>{t('components.addDelegateModal.add_delegate_title')}</DelegateTitle>
          {isManagerReady ? (
            <AddCircleWrapper active={1} onClick={() => setIsDelegateModalOpen(true)} />
          ) : (
            <Tooltip
              position="bottom"
              content={
                <NoFundTooltip>{t('components.addressBlock.not_ready_tooltip')}</NoFundTooltip>
              }
            >
              <IconButton size="small" color="primary">
                <AddCircleWrapper active={0} />
              </IconButton>
            </Tooltip>
          )}
        </AddDelegateLabel>
      </Fragment>
      <Fragment>
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
              onClick={() => goToAccount(addressId, index + 1)}
            />
          ) : (
            <AddressStatus
              key={addressId}
              isContract={true}
              isActive={isDelegatedActive}
              status={address.status}
              onClick={() => goToAccount(addressId, index + 1)}
            />
          );
        })}
      </Fragment>

      <InteractContractLabel>
        <DelegateTitle>{t('components.interactModal.interact_contract')}</DelegateTitle>
        {isManagerReady ? (
          <AddCircleWrapper active={1} onClick={() => onCheckInteractModal()} />
        ) : (
          <Tooltip
            position="bottom"
            content={
              <NoFundTooltip>
                {t('components.addressBlock.not_ready_interact_tooltip')}
              </NoFundTooltip>
            }
          >
            <IconButton size="small" color="primary">
              <AddCircleWrapper active={0} />
            </IconButton>
          </Tooltip>
        )}
      </InteractContractLabel>
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
            onClick={() => goToAccount(addressId, index + 1)}
          />
        ) : (
          <AddressStatus
            key={addressId}
            isActive={isActive}
            status={address.status}
            isContract={true}
            onClick={() => goToAccount(addressId, index + 1)}
          />
        );
      })}
      <AddressLabel>
        <AccountTitle>{t('general.nouns.total_balance')}</AccountTitle>
        {ready || storeType === Mnemonic ? (
          <TezosAmount color="primary" size={ms(0)} amount={balance + smartBalance} format={2} />
        ) : null}
      </AddressLabel>
      {/* <InteractContractModal
        selectedParentHash={publicKeyHash}
        open={isInteractModalOpen}
        onCloseClick={() => setIsInteractModalOpen(false)}
        addresses={regularAddresses}
        t={t}
      />
      <AddDelegateModal
        selectedParentHash={publicKeyHash}
        open={isDelegateModalOpen}
        onCloseClick={() => setIsDelegateModalOpen(false)}
        managerBalance={balance}
        t={t}
      />
      <SecurityNoticeModal
        open={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
        onProceed={onProceedSecurityModal}
      /> */}
      {isDelegateToolTip && (
        <NoSmartAddressesContainer>
          {/* <CloseIconWrapper
            onClick={() => this.props.hideDelegateTooltip('true')}
          /> */}
          <CloseIconWrapper />
          <NoSmartAddressesTitle>
            {t('components.addressBlock.delegation_tips')}
          </NoSmartAddressesTitle>
          {renderNoSmartAddressesDescription(noSmartAddressesDescriptionContent)}
          <NoSmartAddressesButton
            small={true}
            buttonTheme="secondary"
            onClick={() => setIsDelegateModalOpen(true)}
            disabled={!isManagerReady}
          >
            {t('components.addDelegateModal.add_delegate_title')}
          </NoSmartAddressesButton>
        </NoSmartAddressesContainer>
      )}
    </Container>
  );
}

const mapStateToProps = (state: RootState) => ({
  selectedNode: state.settings.selectedNode,
  nodesList: state.settings.nodesList,
  delegateTooltip: state.settings.delegateTooltip,
  selectedAccountHash: state.app.selectedAccountHash
});

const mapDispatchToProps = dispatch => ({
  // hideDelegateTooltip: () => dispatch(hideDelegateTooltip())
});

export default compose(
  withTranslation(),
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(AddressBlock) as React.ComponentType<any>;
