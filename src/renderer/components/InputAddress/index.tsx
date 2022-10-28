import React, { useState } from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import styled from 'styled-components';
import { debounce } from 'throttle-debounce';
import { useTranslation } from 'react-i18next';
import IconButton from '@mui/material/IconButton';

import { ConseilQueryBuilder, ConseilOperator, ConseilSortDirection, ConseilDataClient } from 'conseiljs';

import TextField from '../TextField';
import TezosIcon from '../TezosIcon';
import Tooltip from '../Tooltip';
import { ms } from '../../styles/helpers';

import { queryTezosDomains } from '../../reduxContent/app/thunks';
import { getAddressType } from '../../utils/account';
import { getMainNode } from '../../utils/settings';
import { AddressType } from '../../types/general';
import { RootState } from '../../types/store';

const TooltipContainer = styled.div`
    padding: 10px;
    color: #000;
    font-size: 14px;
    max-width: 312px;
`;

const TooltipTitle = styled.div`
    color: #123262;
    font-weight: bold;
    font-size: 16px;
`;

const TooltipContent1 = styled.div`
    border-bottom: solid 1px #94a9d1;
    padding: 12px 0;
`;

const TooltipContent2 = styled.div`
    padding: 12px 0;
`;

const DelegateContainer = styled.div`
    width: 100%;
    position: relative;
    padding-top: 14px;
`;

const TextfieldTooltip = styled(IconButton)`
    &&& {
        position: absolute;
        right: 0px;
        top: 35px;
    }
`;

interface Props {
    label: string;
    onChange: (val: string) => void;
    tooltip?: boolean;
    address?: string;
    operationType: 'send' | 'delegate' | 'invoke' | 'send_babylon' | 'tz1' | 'addNFT'; // TODO: enum
    onIssue?: (error: boolean) => void;
    onAddressType?: (type: AddressType) => void;
}

function InputAddress(props: Props) {
    const { label, onChange, operationType, address, tooltip, onIssue, onAddressType } = props;
    const { t } = useTranslation();
    const [error, setError] = useState('');
    const [domainName, setDomainName] = useState('');
    const { selectedNode, nodesList } = useSelector((state: RootState) => state.settings, shallowEqual);
    const addressPrefixes = /^(tz1|tz2|tz3|KT1)/;

    async function getAccountFromServer(pkh: string) {
        const mainNode = getMainNode(nodesList, selectedNode);
        const { conseilUrl, apiKey, network, platform } = mainNode;
        const serverInfo = { url: conseilUrl, apiKey, network };

        let query = ConseilQueryBuilder.blankQuery();
        query = ConseilQueryBuilder.addFields(query, 'script');
        query = ConseilQueryBuilder.addPredicate(query, 'account_id', ConseilOperator.EQ, [pkh], false);
        query = ConseilQueryBuilder.addOrdering(query, 'script', ConseilSortDirection.DESC);
        query = ConseilQueryBuilder.setLimit(query, 1);

        const account = await ConseilDataClient.executeEntityQuery(serverInfo, platform, network, 'accounts', query).catch(() => []);
        return account;
    }

    const renderToolTipComponent = () => {
        return (
            <TooltipContainer>
                <TooltipTitle>{t('components.inputAddress.setting_delegate')}</TooltipTitle>
                <TooltipContent1>{t('components.inputAddress.contents.content1')}</TooltipContent1>
                <TooltipContent1>{t('components.inputAddress.contents.content2')}</TooltipContent1>
                <TooltipContent2>{t('components.inputAddress.contents.content3')}</TooltipContent2>
            </TooltipContainer>
        );
    };

    const getRegExState = () => {
        let firstCharactersRegEx = addressPrefixes;
        let regErrorTxt = t('components.inputAddress.errors.send_address');

        if (operationType === 'invoke') {
            firstCharactersRegEx = /^(KT1)/;
            regErrorTxt = t('components.inputAddress.errors.invoke_address');
        } else if (operationType === 'send_babylon') {
            firstCharactersRegEx = /^(tz1|tz2|tz3)/;
            regErrorTxt = t('components.inputAddress.errors.send_babylon');
        } else if (operationType === 'delegate') {
            firstCharactersRegEx = /^(tz1|tz2|tz3)/;
            regErrorTxt = t('components.inputAddress.errors.delegate_address');
        } else if (operationType === 'tz1') {
            firstCharactersRegEx = /^(tz1|edpk)/;
            regErrorTxt = t('components.inputAddress.errors.verify_tz1');
        } else if (operationType === 'addNFT') {
            firstCharactersRegEx = /^(KT1)/;
            regErrorTxt = t('components.nftGallery.errors.invalid_address');
        }

        return { firstCharactersRegEx, regErrorTxt };
    };

    const onValidateAddress = async (addressText) => {
        setDomainName('');
        const charMatch = /[1-9A-HJ-NP-Za-km-z]{36}/;
        const { firstCharactersRegEx, regErrorTxt } = getRegExState();
        let errorState = true;
        let newError = '';
        let addressType;

        if (!firstCharactersRegEx.test(addressText) && addressText !== '') {
            newError = regErrorTxt;
        } else if (addressPrefixes.test(addressText) && addressText.length !== 36) {
            newError = t('components.inputAddress.errors.length');
        } else if (addressPrefixes.test(addressText) && !charMatch.test(addressText)) {
            newError = t('components.inputAddress.errors.special_chars');
        } else if (address === addressText && addressText !== '') {
            newError = t('components.inputAddress.errors.send_funds');
        } else {
            errorState = false;
        }

        if (!errorState && addressText && addressPrefixes.test(addressText)) {
            const account = await getAccountFromServer(addressText);

            if (!account || account.length === 0) {
                newError = t('components.inputAddress.errors.not_exist');
                errorState = false;
            } else {
                addressType = getAddressType(addressText, account[0].script);
                if (addressType === AddressType.Smart && operationType !== ('invoke' && 'addNFT')) {
                    newError = t('components.inputAddress.errors.use_interact');
                    errorState = true;
                }
            }
        }

        onChange(addressText);

        if (onIssue) {
            onIssue(errorState);
        }

        if (onAddressType) {
            onAddressType(addressType);
        }

        setError(newError);

        if (!errorState) {
            const mainNode = getMainNode(nodesList, selectedNode);
            const { tezosUrl } = mainNode;
            const domainResponse = await queryTezosDomains(tezosUrl, String(addressText));
            setDomainName(domainResponse);
        } else {
            setDomainName('');
        }
    };

    const inputDebounce = debounce(300, onValidateAddress);

    return (
        <DelegateContainer>
            <TextField label={label} onChange={(value) => inputDebounce(value)} errorText={error} />
            {tooltip && (
                <Tooltip position="bottom" content={renderToolTipComponent()}>
                    <TextfieldTooltip size="small">
                        <TezosIcon iconName="help" size={ms(1)} color="gray5" />
                    </TextfieldTooltip>
                </Tooltip>
            )}
            {domainName && domainName.length > 0 && <div style={{ marginTop: '-40px' }}>{domainName}</div>}
        </DelegateContainer>
    );
}

export default InputAddress;
