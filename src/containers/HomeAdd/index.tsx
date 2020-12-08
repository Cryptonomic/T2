import React, { Fragment, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation, Trans } from 'react-i18next';
import Tooltip from '../../components/Tooltip';
import { ms } from '../../styles/helpers';
import TextField from '../../components/TextField';
import TezosIcon from '../../components/TezosIcon';

import * as ADD_ADDRESS_TYPES from '../../constants/AddAddressTypes';

import RestoreBackup from '../../components/RestoreBackup';

import CreateAccountSlide from '../../components/CreateAccountSlide';
import { importAddressThunk } from '../../reduxContent/wallet/thunks';
import { openLink } from '../../utils/general';

import SeedInput from '../../components/RestoreBackup/SeedInput';
import { RootState } from '../../types/store';

import {
    Container,
    InputWithTooltip,
    FormTitle,
    TooltipContainer,
    TooltipTitle,
    RowInputs,
    ImportButton,
    TooltipBtn,
    Link,
    TitleContainer,
    TabContainer,
    Tab,
    AddAddressBodyContainer,
    ShowHidePwd,
} from './style';

const PasswordTooltip = (t) => {
    return (
        <TooltipContainer>
            <TooltipTitle>{t('containers.homeAddAddress.fundraiser_password')}</TooltipTitle>
            {t('containers.homeAddAddress.tooltips.password_tooltip')}
        </TooltipContainer>
    );
};

const EmailTooltip = (t) => {
    return (
        <TooltipContainer>
            <TooltipTitle>{t('containers.homeAddAddress.fundraiser_email_address')}</TooltipTitle>
            {t('containers.homeAddAddress.tooltips.email_tooltip')}
        </TooltipContainer>
    );
};

const ActivationTooltip = (t) => {
    const openALink = () => openLink('https://verification.tezos.com/');

    return (
        <TooltipContainer>
            <TooltipTitle>{t('containers.homeAddAddress.activation_code')}</TooltipTitle>
            <Trans i18nKey="containers.homeAddAddress.tooltips.activation_code_tooltip">
                This is the activation code that you received after completing the KYC/AML process. An activation code corresponds to a public key hash and is
                required if you participated in the Fundraiser. You may complete the process at <Link onClick={openALink}>verification.tezos.com</Link> if you
                have not done so already.
            </Trans>
        </TooltipContainer>
    );
};

const PkhTooltip = (t) => {
    return (
        <TooltipContainer>
            <TooltipTitle>{t('containers.homeAddAddress.public_key_hash')}</TooltipTitle>
            {t('containers.homeAddAddress.tooltips.public_key_hash_tooltip')}
        </TooltipContainer>
    );
};

function AddAddress() {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const [activeTab, setActiveTab] = useState(ADD_ADDRESS_TYPES.FUNDRAISER);
    const [pkh, setPkh] = useState('');
    const [activationCode, setActivationCode] = useState('');
    const [username, setUsername] = useState('');
    const [passPhrase, setPassPhrase] = useState('');
    const [isShowedPwd, setIsShowedPwd] = useState(false);
    const [seeds, setSeeds] = useState<string[]>([]);
    const [isError, setIsError] = useState(false);

    const onImport = () => {
        const input = seeds.toString();
        const words = input.replace(/["\s]/g, '');
        const inputVal = words.replace(/,/g, ' ');
        dispatch(importAddressThunk(activeTab, inputVal, pkh, activationCode, username, passPhrase));
    };

    function renderAddBody() {
        const isDisabled = isError || passPhrase === '' || username === '' || pkh === '' || seeds.length < 15;
        switch (activeTab) {
            case ADD_ADDRESS_TYPES.GENERATE_MNEMONIC:
                return <CreateAccountSlide />;
            case ADD_ADDRESS_TYPES.RESTORE:
                return <RestoreBackup />;
            case ADD_ADDRESS_TYPES.FUNDRAISER:
            default:
                return (
                    <Fragment>
                        <FormTitle>{t('containers.homeAddAddress.refer_pdf_title')}</FormTitle>
                        <SeedInput
                            placeholder={t('containers.homeAddAddress.secret_key_15')}
                            seeds={seeds}
                            onChange={(val) => setSeeds(val)}
                            onError={(err) => setIsError(err)}
                            expectedWords={15}
                        />
                        <RowInputs>
                            <InputWithTooltip>
                                <TextField
                                    label={t('containers.homeAddAddress.fundraiser_password')}
                                    type={isShowedPwd ? 'text' : 'password'}
                                    value={passPhrase}
                                    onChange={(val) => setPassPhrase(val)}
                                    right={65}
                                />

                                <ShowHidePwd onClick={() => setIsShowedPwd(!isShowedPwd)} style={{ cursor: 'pointer' }}>
                                    {t(isShowedPwd ? 'general.verbs.hide' : 'general.verbs.show')}
                                </ShowHidePwd>

                                <Tooltip position="bottom" content={PasswordTooltip(t)}>
                                    <TooltipBtn size="small" color="primary">
                                        <TezosIcon iconName="help" size={ms(0)} color="secondary" />
                                    </TooltipBtn>
                                </Tooltip>
                            </InputWithTooltip>

                            <InputWithTooltip>
                                <TextField label={t('containers.homeAddAddress.public_key_hash')} value={pkh} onChange={(val) => setPkh(val)} right={30} />
                                <Tooltip position="bottom" content={PkhTooltip(t)}>
                                    <TooltipBtn size="small" color="primary">
                                        <TezosIcon iconName="help" size={ms(0)} color="secondary" />
                                    </TooltipBtn>
                                </Tooltip>
                            </InputWithTooltip>
                        </RowInputs>

                        <RowInputs>
                            <InputWithTooltip>
                                <TextField
                                    label={t('containers.homeAddAddress.fundraiser_email_address')}
                                    value={username}
                                    onChange={(val) => setUsername(val)}
                                    right={30}
                                />

                                <Tooltip position="top" content={EmailTooltip(t)}>
                                    <TooltipBtn size="small" color="primary">
                                        <TezosIcon iconName="help" size={ms(0)} color="secondary" />
                                    </TooltipBtn>
                                </Tooltip>
                            </InputWithTooltip>

                            <InputWithTooltip>
                                <TextField
                                    label={t('containers.homeAddAddress.activation_code')}
                                    value={activationCode}
                                    onChange={(val) => setActivationCode(val)}
                                    right={30}
                                />
                                <Tooltip position="top" content={ActivationTooltip(t)}>
                                    <TooltipBtn size="small" color="primary">
                                        <TezosIcon iconName="help" size={ms(0)} color="secondary" />
                                    </TooltipBtn>
                                </Tooltip>
                            </InputWithTooltip>
                        </RowInputs>
                        <ImportButton onClick={() => onImport()} color="secondary" variant="extended" disabled={isDisabled}>
                            {t('general.verbs.import')}
                        </ImportButton>
                    </Fragment>
                );
        }
    }

    return (
        <Container>
            <TitleContainer>{t('containers.homeAddAddress.add_account')}</TitleContainer>
            <TabContainer>
                {Object.values(ADD_ADDRESS_TYPES).map((tabName) => (
                    <Tab key={tabName} isActive={tabName === activeTab} onClick={() => setActiveTab(tabName)}>
                        {t(tabName)}
                    </Tab>
                ))}
            </TabContainer>
            <AddAddressBodyContainer>{renderAddBody()}</AddAddressBodyContainer>
        </Container>
    );
}

export default AddAddress;
