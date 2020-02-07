import React, { Fragment, useState, useEffect } from 'react';
import MenuItem from '@material-ui/core/MenuItem';
import { useTranslation, Trans } from 'react-i18next';
import styled from 'styled-components';
import { ms } from '../../styles/helpers';
import TezosIcon from '../../components/TezosIcon';
import Button from './../Button';
import TezosNumericInput from '../TezosNumericInput';
import Modal from '../CustomModal';
import CustomSelect from '../CustomSelect';
import usePrevious from '../../customHooks/usePrevious';

import { formatAmount, tezToUtez } from '../../utils/currancy';

const StyledSaveButton = styled(Button)`
  margin-top: 30px;
  padding-right: ${ms(9)};
  padding-left: ${ms(9)};
  height: 54px;
`;

const ItemWrapper = styled(MenuItem)`
  &&& {
    &.Mui-selected {
      color: ${({ theme: { colors } }) => colors.primary};
    }
    width: 100%;
    font-size: 16px;
    font-weight: 300;
  }
`;

const ModalContent = styled.div`
  padding: 35px 76px 63px 76px;
`;

const MiniFeeTitle = styled.div`
  position: relative;
  font-size: 14px;
  line-height: 21px;
  font-weight: 300;
  color: ${({ theme: { colors } }) => colors.black};
  margin: -30px 0 20px 0;
`;

const BoldSpan = styled.span`
  font-weight: 500;
`;

const ErrorContainer = styled.div`
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: ${({ theme: { colors } }) => colors.error1};
`;

const WarningIcon = styled(TezosIcon)`
  padding: 0 ${ms(-9)} 0 0;
  position: relative;
  top: 1px;
`;

const FeeContentWrapper = styled.div`
  display: flex;
  align-items: center;
`;

interface Props {
  low: number;
  medium: number;
  high: number;
  fee: number;
  miniFee?: number;
  tooltip?: React.ReactNode;
  onChange: (val: number) => void;
}

function Fee(props: Props) {
  const { onChange, low, medium, high, fee, miniFee, tooltip } = props;
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<React.ReactNode>('');
  const [custom, setCustom] = useState('');

  const customAmount = tezToUtez(custom);
  const prevMedium = usePrevious(medium);

  const isNewCustom =
    fee !== low && fee !== medium && fee !== prevMedium && fee !== high && fee !== customAmount;
  const customFeeLabel = t('components.fees.custom_fee');

  useEffect(() => {
    if (isNewCustom) {
      setCustom(formatAmount(fee));
    }
  }, [isNewCustom]);

  function getCustomMenuItem() {
    if (isNewCustom) {
      return (
        <ItemWrapper value={fee}>
          {customFeeLabel}: {formatAmount(fee)} <TezosIcon color="black" iconName="tezos" />
        </ItemWrapper>
      );
    } else if (!!custom) {
      return (
        <ItemWrapper value={customAmount}>
          {customFeeLabel}: {formatAmount(customAmount)}{' '}
          <TezosIcon color="black" iconName="tezos" />
        </ItemWrapper>
      );
    } else {
      return null;
    }
  }

  function renderError() {
    return (
      <ErrorContainer>
        <WarningIcon iconName="warning" size={ms(-1)} color="error1" />
        {t('components.fees.minimum_fee_error')}
      </ErrorContainer>
    );
  }

  function handleCustomChange(val) {
    const newVal = val.replace(/,/g, '.');
    const newError = newVal < formatAmount(miniFee) ? renderError() : '';
    setError(newError);
    setCustom(newVal);
  }
  function handleSetCustom() {
    onChange(tezToUtez(custom));
    setOpen(false);
  }

  function onFeeChange(event) {
    const newFee = event.target.value;
    if (newFee !== 'custom') {
      onChange(newFee);
    } else {
      setOpen(true);
    }
  }

  function onCloseModal() {
    setCustom('');
    setOpen(false);
  }

  return (
    <Fragment>
      <CustomSelect
        label={t('general.nouns.fee')}
        value={fee}
        onChange={onFeeChange}
        renderValue={value => {
          let feeTitle = 'components.fees.low_fee';
          if (value === low) {
            feeTitle = 'components.fees.low_fee';
          } else if (value === medium) {
            feeTitle = 'components.fees.medium_fee';
          } else if (value === high) {
            feeTitle = 'components.fees.high_fee';
          } else {
            feeTitle = 'components.fees.custom_fee';
          }
          return (
            <FeeContentWrapper>
              {t(feeTitle)}: {formatAmount(value)} <TezosIcon color="black" iconName="tezos" />
              {tooltip}
            </FeeContentWrapper>
          );
        }}
      >
        <ItemWrapper value={low}>
          {t('components.fees.low_fee')}: {formatAmount(low)}{' '}
          <TezosIcon color="black" iconName="tezos" />
        </ItemWrapper>
        <ItemWrapper value={medium}>
          {t('components.fees.medium_fee')}: {formatAmount(medium)}{' '}
          <TezosIcon color="black" iconName="tezos" />
        </ItemWrapper>
        <ItemWrapper value={high}>
          {t('components.fees.high_fee')}: {formatAmount(high)}{' '}
          <TezosIcon color="black" iconName="tezos" />
        </ItemWrapper>
        {getCustomMenuItem()}
        <ItemWrapper value="custom">{t('components.fees.custom')}</ItemWrapper>
      </CustomSelect>
      <Modal title={t('components.fees.enter_custom_amount')} open={open} onClose={onCloseModal}>
        <ModalContent>
          <MiniFeeTitle>
            <Trans
              i18nKey="components.fees.required_minium_fee"
              values={{ fee: formatAmount(miniFee) }}
            >
              Please keep in mind that the minimum required fee for this transaction is
              <BoldSpan>{formatAmount(miniFee)} XTZ</BoldSpan>.
            </Trans>
          </MiniFeeTitle>
          <TezosNumericInput
            decimalSeparator={t('general.decimal_separator')}
            label={customFeeLabel}
            amount={custom}
            onChange={handleCustomChange}
            errorText={error}
          />
          <StyledSaveButton
            buttonTheme="primary"
            onClick={() => handleSetCustom()}
            disabled={!!error}
          >
            {t('components.fees.set_custom_fee')}
          </StyledSaveButton>
        </ModalContent>
      </Modal>
    </Fragment>
  );
}

export default Fee;
