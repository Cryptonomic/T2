import React, { useState } from 'react';
import styled from 'styled-components';
import Modal from '@material-ui/core/Modal';
import Checkbox from '@material-ui/core/Checkbox';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { withTranslation, WithTranslation } from 'react-i18next';
import Button from '../Button';
import TezosIcon from '../TezosIcon';
import noticeImg from '../../../resources/imgs/security-notice.svg';
import { ms } from '../../styles/helpers';
import { openLink } from '../../utils/general';
import { setLocalData } from '../../utils/localData';

const url = 'https://github.com/Cryptonomic/Deployments/wiki/Galleon:-FAQ#smart-contracts';

const ModalWrapper = styled(Modal)`
  &&& {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const ModalContainer = styled.div`
  background-color: ${({ theme: { colors } }) => colors.white};
  outline: none;
  position: relative;
  padding-top: 53px;
  min-width: 672px;
  width: 672px;
`;

const MainContainer = styled.div`
  padding: 0 100px 25px 100px;
`;

const BottomContainer = styled.div`
  display: flex;
  justify-content: space-between;
  height: 102px;
  padding: 28px 127px;
  background-color: ${({ theme: { colors } }) => colors.gray1};
`;

const NoticeSvg = styled.img`
  width: 100%;
  height: 193px;
  flex: none;
`;

const NoticeTitle = styled.div`
  font-size: 24px;
  color: ${({ theme: { colors } }) => colors.blue6};
  margin-top: 10px;
  text-align: center;
`;

const NoticeContent = styled.div`
  color: ${({ theme: { colors } }) => colors.blue6};
  font-size: 18px;
  line-height: 26px;
  font-weight: 300;
`;

const CustomButton = styled(Button)`
  width: 194px;
  height: 50px;
  padding: 0;
`;

const LinkContainer = styled.div`
  color: ${({ theme: { colors } }) => colors.accent};
  font-weight: 300;
  cursor: pointer;
  font-size: 18px;
  display: inline-block;
`;

const LinkIcon = styled(TezosIcon)`
  position: relative;
  top: 1px;
  margin-left: 2px;
`;

const FormGroupWrapper = styled(FormGroup)`
  margin-top: 60px;
`;

interface OwnProps {
  open: boolean;
  onClose: () => void;
  onProceed: () => void;
}

type Props = OwnProps & WithTranslation;

function SecurityNoticeModal(props: Props) {
  const { open, onClose, onProceed, t } = props;
  const [isUnderstand, setIsUnderstand] = useState(false);
  const [isNotShowMessage, setIsNotShowMessage] = useState(false);

  function onProceedFunc() {
    if (isNotShowMessage) {
      setLocalData('isNotShowMessage', true);
    }
    setIsUnderstand(false);
    setIsNotShowMessage(false);
    onProceed();
  }

  function onCloseFunc() {
    setIsUnderstand(false);
    setIsNotShowMessage(false);
    onClose();
  }

  return (
    <ModalWrapper open={open} onClose={onClose}>
      <ModalContainer>
        <MainContainer>
          <NoticeSvg src={noticeImg} />
          <NoticeTitle>{t('components.securityNoticeModal.security_notice')}</NoticeTitle>
          <NoticeContent>{t('components.securityNoticeModal.notice_content')}</NoticeContent>
          <LinkContainer onClick={() => openLink(url)}>
            {t('components.securityNoticeModal.learn_more')}
            <LinkIcon iconName="new-window" size={ms(0)} color="accent" />
          </LinkContainer>
          <FormGroupWrapper>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isUnderstand}
                  onChange={e => setIsUnderstand(e.target.checked)}
                  value="understand"
                />
              }
              label={t('components.securityNoticeModal.understand_check')}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={isNotShowMessage}
                  onChange={e => setIsNotShowMessage(e.target.checked)}
                  value="showmessage"
                />
              }
              label={t('components.securityNoticeModal.dont_message')}
            />
          </FormGroupWrapper>
        </MainContainer>
        <BottomContainer>
          <CustomButton buttonTheme="secondary" onClick={() => onCloseFunc()}>
            {t('general.verbs.cancel')}
          </CustomButton>
          <CustomButton
            buttonTheme="primary"
            disabled={!isUnderstand}
            onClick={() => onProceedFunc()}
          >
            {t('general.verbs.proceed')}
          </CustomButton>
        </BottomContainer>
      </ModalContainer>
    </ModalWrapper>
  );
}

export default withTranslation()(SecurityNoticeModal);
