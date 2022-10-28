import React from 'react';
import styled from 'styled-components';
import { KeyStoreType } from 'conseiljs';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { ms } from '../../styles/helpers';
import transactionsEmptyState from '../../../resources/transactionsEmptyState.svg';
import LoaderSpinner from '../LoaderSpinner';
import { H4 } from '../Heading/';

import * as statuses from '../../constants/StatusTypes';
import { formatAmount } from '../../utils/currency';
import Info from './Info';
import { RootState } from '../../types/store';
import { AddressType } from '../../types/general';
const { Mnemonic, Hardware } = KeyStoreType;

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

interface Props {
    address: any;
}

function AccountStatus(props: Props) {
    const { t } = useTranslation();
    const selectedAccountType = useSelector<RootState, AddressType>((state) => state.app.selectedAccountType);
    const { address } = props;
    let storeType;
    let status;
    let operations;
    if (address) {
        storeType = address.storeType;
        status = address.status;
        operations = address.operations;
    } else {
        return null;
    }

    let icon = <LoaderSpinner size="x4" />;
    let title = '';
    let description = '';
    let info;
    if (selectedAccountType === AddressType.Delegated || selectedAccountType === AddressType.Smart) {
        title = t('components.addressStatus.deploying_title');
        const opName = operations[statuses.CREATED] ? operations[statuses.CREATED] : operations[statuses.FOUND];
        info = (
            <Info
                firstIconName="icon-star"
                operationName={t('components.accountStatus.origination_operation_id')}
                operationId={opName}
                lastIconName="icon-new-window"
            />
        );
    } else {
        const typeText = t(selectedAccountType === AddressType.Manager ? 'general.nouns.account' : 'general.nouns.address');
        switch (status) {
            case statuses.CREATED:
                if (storeType === Mnemonic || storeType === Hardware) {
                    icon = <Image alt={t('components.accountStatus.creating_ccount')} src={transactionsEmptyState} />;
                    title = t('components.accountStatus.titles.ready');
                    description = t('components.accountStatus.descriptions.mnemonic_first_transaction');
                } else {
                    title = t('components.accountStatus.titles.retrieving', { typeText });
                    if (operations[statuses.CREATED]) {
                        const operationName = t(
                            selectedAccountType === AddressType.Manager
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
                title = t('components.accountStatus.titles.pending', { typeText });
                if (operations[statuses.FOUND]) {
                    const operationName = t('components.accountStatus.public_key_reveal_operation_id');
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
                    description = t('components.accountStatus.descriptions.first_transaction_confirmation', {
                        formattedAmount,
                    });
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

export default AccountStatus;
