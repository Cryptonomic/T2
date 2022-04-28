import React, { Fragment, useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

import TezosNumericInput from '../TezosNumericInput';
import TextField from '../TextField';
import { LabelText, MainContainer, TopContainer, EsFeeContainer, ButtonContainer, BottomContainer, FieldContainer } from './style';
import { formatAmount, tezToUtez } from '../../utils/currency';

const EstimatedFee = () => {
    const { t } = useTranslation();
    const [fee, setFee] = useState('0');
    const [feeError, setFeeError] = useState('');
    const [useCustomFee, setCustomFeeFlag] = useState(false);
    const [customFee, setCustomFee] = useState('0');
    const [customGasLimit, setCustomGasLimit] = useState('0');
    const [customStorageLimit, setCustomStorageLimit] = useState('0');
    // const estimates = estimateOperationGroupFee(selectedParentHash, operationDetails);
    const estimates = {
        estimatedFee: 2100,
        estimatedStorage: 300,
        estimatedGas: 500,
    };
    const estimatedMinimumFee = estimates.estimatedFee;
    return (
        <MainContainer>
            <TopContainer>
                <EsFeeContainer>
                    <TezosNumericInput
                        decimalSeparator={t('general.decimal_separator')}
                        label={'Estimated Fee'}
                        amount={fee}
                        onChange={setFee}
                        errorText={feeError}
                        disabled={useCustomFee}
                        readOnly={true}
                    />
                </EsFeeContainer>
                <ButtonContainer>
                    <IconButton size="small" color="primary" onClick={() => setCustomFeeFlag(!useCustomFee)}>
                        {!useCustomFee && <AddIcon />}
                        {useCustomFee && <RemoveIcon />}
                        <LabelText>{useCustomFee ? t('components.fees.use_estimated_fee') : t('components.fees.set_custom_fee')}</LabelText>
                    </IconButton>
                </ButtonContainer>
            </TopContainer>
            {useCustomFee && (
                <BottomContainer>
                    <FieldContainer>
                        <TezosNumericInput
                            decimalSeparator={t('general.decimal_separator')}
                            label={t('components.fees.custom_fee')}
                            amount={customFee}
                            onChange={setCustomFee}
                            errorText={tezToUtez(customFee) - estimatedMinimumFee < 0 ? 'below estimated value' : ''}
                        />
                    </FieldContainer>
                    <FieldContainer>
                        <TextField
                            type="number"
                            label={t('components.interactModal.storage_limit')}
                            onChange={setCustomStorageLimit}
                            value={customStorageLimit}
                            errorText={parseInt(customStorageLimit, 10) - estimates.estimatedStorage < 0 ? 'below estimated value' : ''}
                        />
                    </FieldContainer>
                    <FieldContainer>
                        <TextField
                            type="number"
                            label={t('components.interactModal.gas_limit')}
                            onChange={setCustomGasLimit}
                            value={customGasLimit}
                            errorText={parseInt(customGasLimit, 10) - estimates.estimatedGas < 0 ? 'below estimated value' : ''}
                        />
                    </FieldContainer>
                </BottomContainer>
            )}
        </MainContainer>
    );
};

export default EstimatedFee;
