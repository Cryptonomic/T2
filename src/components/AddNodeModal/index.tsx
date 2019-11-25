import React, { useState } from 'react';
import styled from 'styled-components';
import { withTranslation, WithTranslation } from 'react-i18next';
import Fab from '@material-ui/core/Fab';
import Modal from '../CustomModal';
import TextField from '../TextField';
import { ms } from '../../styles/helpers';
import TezosIcon from '../TezosIcon';
import { Node } from '../../types/general';

const UrlContainer = styled.div`
  width: 100%;
  min-height: 93px;
  position: relative;
`;

const FeedbackIcon = styled(TezosIcon)`
  position: absolute;
  top: 30px;
  right: 10px;
`;

const MainContainer = styled.div`
  padding: 30px 76px 56px 76px;
`;

const RowContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

const ColContainer = styled.div`
  width: 47%;
`;

const ActionButton = styled(Fab)`
  &&& {
    width: 194px;
  }
`;

interface OwnProps {
  onAdd: (node: Node) => void;
  onClose: () => void;
  isOpen: boolean;
}

type Props = WithTranslation & OwnProps;

function AddNodeModal(props: Props) {
  const { t, isOpen, onAdd, onClose } = props;
  const [name, setName] = useState('');
  const [platform, setPlatform] = useState('');
  const [network, setNetwork] = useState('');
  const [tezosUrl, setTezosUrl] = useState('');
  const [conseilUrl, setConseilUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [tezosError, setTezosError] = useState('');
  const [conseilError, setConseilError] = useState('');

  function handleClose() {
    setName('');
    setPlatform('');
    setNetwork('');
    setTezosUrl('');
    setConseilUrl('');
    setApiKey('');
    onClose();
  }

  function isValidUrl(url) {
    return url.toLowerCase().indexOf('https://') === 0;
  }
  function handleAddNode() {
    const newNode: Node = {
      displayName: name,
      platform,
      network,
      tezosUrl,
      conseilUrl,
      apiKey
    };
    onAdd(newNode);
    handleClose();
  }

  function onChangeTezoUrl(url: string) {
    if (isValidUrl(url)) {
      setTezosUrl(url);
    } else {
      setTezosError(t('components.addNodeModal.error'));
    }
  }

  function onChangeConseilUrl(url: string) {
    if (isValidUrl(url)) {
      setConseilUrl(url);
    } else {
      setConseilError(t('components.addNodeModal.error'));
    }
  }

  const isDisabled =
    !name || !platform || !network || !tezosUrl || !conseilUrl || !!tezosError || !!conseilError;

  return (
    <Modal title={t('components.addNodeModal.title')} open={isOpen} onClose={handleClose}>
      <MainContainer>
        <RowContainer>
          <ColContainer>
            <TextField
              label={t('components.addNodeModal.labels.node_name')}
              value={name}
              onChange={val => setName(val)}
            />
          </ColContainer>
          <ColContainer>
            <TextField
              label={t('general.nouns.platform')}
              value={platform}
              onChange={val => setPlatform(val)}
            />
          </ColContainer>
        </RowContainer>

        <RowContainer>
          <ColContainer>
            <TextField
              label={t('general.nouns.network')}
              value={network}
              onChange={val => setNetwork(val)}
            />
          </ColContainer>
          <ColContainer>
            <TextField
              label={t('components.addNodeModal.labels.api_key')}
              value={apiKey}
              onChange={val => setApiKey(val)}
            />
          </ColContainer>
        </RowContainer>

        <UrlContainer>
          <TextField
            label="Tezos URL (e.g https://127.0.0.1:19731/)"
            value={tezosUrl}
            onChange={val => onChangeTezoUrl(val)}
            errorText={tezosError}
          />
          {tezosError && <FeedbackIcon iconName="warning" size={ms(0)} color="error1" />}
        </UrlContainer>

        <UrlContainer>
          <TextField
            label="Conseil URL (e.g https://127.0.0.1:19731/)"
            value={conseilUrl}
            onChange={val => onChangeConseilUrl(val)}
            errorText={conseilError}
          />
          {conseilError && <FeedbackIcon iconName="warning" size={ms(0)} color="error1" />}
        </UrlContainer>

        <ActionButton
          onClick={() => handleAddNode()}
          color="secondary"
          variant="extended"
          disabled={isDisabled}
        >
          {t('general.verbs.save')}
        </ActionButton>
      </MainContainer>
    </Modal>
  );
}

const mapDispatchToProps = dispatch => ({
  // addNode: () => dispatch(goHomeAndClearState()),
  // setSelected,
});

export default withTranslation()(AddNodeModal);
