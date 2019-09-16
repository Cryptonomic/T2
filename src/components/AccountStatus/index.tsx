// @flow
import React from 'react';
import { compose } from 'redux';
import styled, { withTheme } from 'styled-components';
import { StoreType } from 'conseiljs';
import { ms } from '../../styles/helpers';
import transactionsEmptyState from '../../../resources/transactionsEmptyState.svg';
import LoaderSpinner from '../LoaderSpinner';
import { H4 } from '../Heading/';

import * as statuses from '../../constants/StatusTypes';
import { formatAmount } from '../../utils/currancy';
import Info from './Info';
import i18n from '../../utils/i18n';
const { Mnemonic, Hardware } = StoreType;

const Container = styled.section`
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  align-self: center;
  width: 400px;
  padding-top: ${ms(5)};
  text-align: center;
`;

const Image = styled.img`(
  display: inline-block;
  padding-bottom: ${ms(4)};
)`;

const Icon = styled.div`
  height: 180px;
  width: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Title = styled(H4)`
  font-weight: normal;
  font-size: ${ms(1)};
  padding-bottom: ${ms(-9)};
`;

const Description = styled.div`
  font-weight: 300;
  color: #4a4a4a;
  font-size: ${ms(-0.5)};
`;

type Props = {
  isManager?: boolean;
  isContract?: boolean;
  address?: {
    get: (
      obj
    ) => {
      toJS(): {};
    };
  };

  theme?: {
    colors: {
      accent: string;
    };
  };
  t: () => {};
};

function AccountStatus(props: Props) {
  const { isManager, isContract, address, theme, t } = props;
  let storeType;
  let status;
  let operations;
  if (address) {
    storeType = address.get('storeType');
    status = address.get('status');
    operations = address.get('operations').toJS();
  }

  let icon = (
    <LoaderSpinner
      size="x4"
      styles={{
        color: theme && theme.colors && theme.colors.accent
      }}
    />
  );
  let title = '';
  let description = '';
  let info;
  if (isContract) {
    title = i18n.t('components.addressStatus.deploying_title');
    const opName = operations[statuses.CREATED]
      ? operations[statuses.CREATED]
      : operations[statuses.FOUND];
    info = (
      <Info
        firstIconName="icon-star"
        operationName={i18n.t('components.accountStatus.origination_operation_id')}
        operationId={opName}
        lastIconName="icon-new-window"
      />
    );
  } else {
    const typeText = i18n.t(isManager ? 'general.nouns.account' : 'general.nouns.address');
    switch (status) {
      case statuses.CREATED:
        if (storeType === Mnemonic || storeType === Hardware) {
          icon = (
            <Image
              alt={i18n.t('components.accountStatus.creating_ccount')}
              src={transactionsEmptyState}
            />
          );
          title = i18n.t('components.accountStatus.titles.ready');
          description = i18n.t('components.accountStatus.descriptions.mnemonic_first_transaction');
        } else {
          title = i18n.t('components.accountStatus.titles.retrieving', { typeText });
          if (operations[statuses.CREATED]) {
            const operationName = i18n.t(
              isManager
                ? 'components.accountStatus.activation_operation_id'
                : 'components.accountStatus.origination_operation_id'
            );
            info = (
              <Info
                firstIconName="icon-star"
                operationName={operationName}
                operationId={operations[statuses.CREATED]}
                lastIconName="icon-new-window"
              />
            );
          }
        }
        break;
      case statuses.FOUND:
      case statuses.PENDING:
        title = i18n.t('components.accountStatus.titles.pending', { typeText });
        if (operations[statuses.FOUND]) {
          const operationName = i18n.t('components.accountStatus.public_key_reveal_operation_id');
          info = (
            <Info
              firstIconName="icon-broadcast"
              operationName={operationName}
              operationId={operations[statuses.FOUND]}
              lastIconName="icon-new-window"
            />
          );
        }

        if (storeType === Mnemonic) {
          let transaction;
          if (address) {
            transaction = address.get('transactions').toJS();
          }
          const { amount } = transaction[0];
          const formattedAmount = formatAmount(amount, 2);
          description = i18n.t(
            'components.accountStatus.descriptions.first_transaction_confirmation',
            { formattedAmount }
          );
        }
        break;
      default:
        break;
    }
  }

  return (
    <Container>
      <Icon>{icon}</Icon>
      <Title>{title}</Title>
      {description ? <Description>{description}</Description> : null}
      {info}
    </Container>
  );
}

export default withTheme(AccountStatus);
