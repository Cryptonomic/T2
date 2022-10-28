import React, { Fragment, useState } from 'react';
import Switch from '@mui/material/Switch';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import { importAddressThunk, importSecretKeyThunk } from '../../reduxContent/wallet/thunks';
import * as ADD_ADDRESS_TYPES from '../../constants/AddAddressTypes';

import TextField from '../TextField';
import Button from '../Button';
import SeedInput from './SeedInput';
import PasswordInput from '../PasswordInput';

const MainContainer = styled.div`
    position: relative;
    min-height: 300px;
    padding: 0 10px;
    display: flex;
    flex-direction: column;
`;
const RestoreHeader = styled.div`
    font-size: 18px;
    font-weight: 300;
    display: flex;
    margin-bottom: 30px;
    color: ${({ theme: { colors } }) => colors.gray0};
`;
const RestoreTabContainer = styled.div`
    display: flex;
    border-radius: 35px;
    width: 284px;
    font-size: 12px;
    line-height: 31px;
    text-align: center;
    overflow: hidden;
    margin-left: 10px;
    font-weight: 500;
`;

const RestoreTabItem = styled.div<{ active: boolean }>`
    background-color: ${({ theme: { colors }, active }) => (active ? colors.accent : 'rgba(148, 169, 209, 0.13)')};
    color: ${({ theme: { colors }, active }) => (active ? colors.white : colors.index0)};
    flex: 1;
`;
const ToggleContainer = styled.div`
    max-width: 60%;
    margin-top: 35px;
    display: flex;
    align-items: center;
`;
const ToggleLabel = styled.div`
    font-size: 16px;
    color: ${({ theme: { colors } }) => colors.black2};
    font-weight: 300;
`;

const RestoreFooter = styled.div`
    margin-top: auto;
    display: flex;
    justify-content: flex-end;
    padding-top: 50px;
`;
const RestoreButton = styled(Button)`
    width: 194px;
    height: 50px;
    text-align: center;
    line-height: 50px;
    padding: 0 !important;
`;
interface Props1 {
    type: string;
    changeFunc: (val: string) => void;
    t: any;
}

const RestoreTabs = (props: Props1) => {
    const { type, changeFunc, t } = props;

    return (
        <RestoreTabContainer>
            <RestoreTabItem active={type === 'phrase'} onClick={() => changeFunc('phrase')}>
                {t('components.restoreBackup.seed_phrase')}
            </RestoreTabItem>
            <RestoreTabItem active={type === 'key'} onClick={() => changeFunc('key')}>
                {t('components.restoreBackup.private_key')}
            </RestoreTabItem>
        </RestoreTabContainer>
    );
};

function RestoreBackup() {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const [type, setType] = useState('phrase');
    const [seeds, setSeeds] = useState<string[]>([]);
    const [password, setPassword] = useState('');
    const [hasPassword, setHasPassword] = useState(false);
    const [derivationPath, setDerivationPath] = useState('');
    const [hasDerivationPath, setHasDerivationPath] = useState(false);
    const [key, setKey] = useState('');
    const [error, setError] = useState(false);
    const [restoreDisabled, setRestoreDisabled] = useState(true);

    const importAddress = () => {
        if (type === 'phrase') {
            dispatch(importAddressThunk(ADD_ADDRESS_TYPES.RESTORE, seeds.join(' '), '', '', '', password, derivationPath));
        } else if (type === 'key') {
            dispatch(importSecretKeyThunk(key));
        }
    };

    const onEnterPress = (keyValue, disabled) => {
        if (keyValue === 'Enter' && !disabled) {
            if ([12, 15, 18, 21, 24].includes(seeds.length) && type === 'phrase') {
                importAddress();
            }
        }
    };

    const onTypeChange = (restoreType: string) => {
        setType(restoreType);

        if (restoreType === 'key') {
            setRestoreDisabled(!key || key.trim().length === 0);
        }

        if (restoreType === 'phrase') {
            setRestoreDisabled(![12, 15, 18, 21, 24].includes(seeds.length));
        }
    };

    return (
        <MainContainer onKeyDown={(event) => onEnterPress(event.key, restoreDisabled)}>
            <RestoreHeader>
                {t('components.restoreBackup.restore_from')}
                <RestoreTabs type={type} t={t} changeFunc={(val) => onTypeChange(val)} />
            </RestoreHeader>
            {type === 'phrase' && (
                <Fragment>
                    <SeedInput
                        placeholder={t('containers.homeAddAddress.restore_mnemonic')}
                        seeds={seeds}
                        onChange={(val) => {
                            val = val.map((s) => s.toLowerCase());
                            setSeeds(val);
                            setRestoreDisabled(![12, 15, 18, 21, 24].includes(val.length));
                            setError(false);
                        }}
                        onError={(err) => {
                            setError(err);
                            setRestoreDisabled(err);
                        }}
                        expectedWords={0}
                    />

                    <ToggleContainer>
                        <ToggleLabel>{t('components.restoreBackup.seed_encrypted_label')}</ToggleLabel>
                        <Switch color="secondary" onChange={() => setHasPassword(!hasPassword)} />
                    </ToggleContainer>

                    {hasPassword && (
                        <PasswordInput
                            label={t('components.restoreBackup.seed_phrase_password')}
                            password={password}
                            onChange={(val) => setPassword(val)}
                            containerStyle={{ width: '60%' }}
                        />
                    )}

                    <ToggleContainer>
                        <ToggleLabel>{t('components.restoreBackup.seed_phrase_derived')}</ToggleLabel>
                        <Switch color="secondary" onChange={() => setHasDerivationPath(!hasDerivationPath)} />
                    </ToggleContainer>

                    {hasDerivationPath && (
                        <div style={{ width: '60%' }}>
                            <TextField label="Derivation Path (e.g m/44'/1729'/0'/0'/0')" value={derivationPath} onChange={(val) => setDerivationPath(val)} />
                        </div>
                    )}
                </Fragment>
            )}

            {type === 'key' && (
                <TextField
                    label={t('components.restoreBackup.enter_private_key')}
                    value={key}
                    onChange={(val) => {
                        setKey(val);
                        setRestoreDisabled(!key || key.trim().length === 0);
                        setError(false);
                    }}
                />
            )}

            <RestoreFooter>
                <RestoreButton buttonTheme="primary" disabled={restoreDisabled} onClick={importAddress}>
                    {t('general.verbs.restore')}
                </RestoreButton>
            </RestoreFooter>
        </MainContainer>
    );
}

export default RestoreBackup;
