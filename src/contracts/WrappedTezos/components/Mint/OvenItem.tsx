import React from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import AmountView from '../../../../components/AmountView';
import { ms } from '../../../../styles/helpers';
import Button from '../../../../components/Button';

const Container = styled.div`
    width: 100%;
    padding-bottom: 20px;
`;

const AddressContainer = styled.div`
    background-color: ${({ theme: { colors } }) => colors.gray1};
    height: 42px;
    display: flex;
    padding: 0 25px;
    align-items: center;
    justify-content: space-between;
    color: ${({ theme: { colors } }) => colors.secondary};
    line-height: 1.63;
    font-weight: 500;
`;

const OvenInfoBar = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: ${({ theme: { colors } }) => colors.gray5};
    font-size: 12px;
    line-height: 30px;
`;

const OvenDelegate = styled.div`
    color: ${({ theme: { colors } }) => colors.gray5};
`;

const AmountContainer = styled.div<{ color: string }>`
    color: ${({ theme: { colors }, color }) => colors[color]};
    font-size: ${ms(-1)};
`;

export const ContentDiv = styled.div`
    display: flex;
    align-items: baseline;
    line-height: 14px;
    flex: 1;
    padding-top: 5px;
`;

const InvokeButton = styled(Button)`
    width: 194px;
    height: 50px;
    margin-bottom: 0px;
    margin-left: 20px;
    padding: 0;
`;

interface Props {
    address: string;
    balance: number;
    delegate?: string;

    // Functions to call to open action modals.
    deposit: (ovenAddress: string) => void;
    withdraw: (ovenAddress: string) => void;
    setDelegate: (ovenAddress: string) => void;
}

function OvenItem(props: Props) {
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const { address, delegate, balance } = props;

    return (
        <Container>
            <AddressContainer>{address}</AddressContainer>
            <OvenInfoBar>
                <OvenDelegate>
                    <b>Delegate</b>: {delegate ?? 'None'}
                </OvenDelegate>
                <AmountContainer color="check">
                    <AmountView color={'check'} size={ms(-1)} amount={balance} scale={6} precision={6} round={6} symbol={'XTZ'} />
                </AmountContainer>
            </OvenInfoBar>
            <ContentDiv>
                <InvokeButton buttonTheme="primary" onClick={() => props.deposit(address)}>
                    {/* TODO(keefertaylor): Use translations here */}
                    Deposit
                </InvokeButton>
                {balance > 0 && (
                    <InvokeButton buttonTheme="primary" onClick={() => props.withdraw(address)}>
                        {/* TODO(keefertaylor): Use translations here */}
                        Withdraw
                    </InvokeButton>
                )}
                {balance > 0 && (
                    <InvokeButton buttonTheme="primary" onClick={() => props.setDelegate(address)}>
                        {/* TODO(keefertaylor): Use translations here */}
                        Set Delegate
                    </InvokeButton>
                )}
            </ContentDiv>
        </Container>
    );
}

export default OvenItem;
