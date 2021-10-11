import React, { useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import Fab from '@mui/material/Fab';
import Modal from '../CustomModal';
import TextField from '../TextField';
import { ms } from '../../styles/helpers';
import TezosIcon from '../TezosIcon';

import { Path } from '../../types/general';

const ActionButton = styled(Fab)`
    &&& {
        width: 194px;
    }
`;

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

interface Props {
    onAdd: (path: Path) => void;
    onClose: () => void;
    isOpen: boolean;
}

function AddPathModal(props: Props) {
    const { isOpen, onAdd, onClose } = props;
    const { t } = useTranslation();
    const [label, setLabel] = useState('');
    const [derivation, setDerivation] = useState('');
    // const [error, setError] = useState('');
    const error = '';

    function handleClose() {
        setLabel('');
        setDerivation('');
        onClose();
    }

    function handleAddPath() {
        onAdd({ label, derivation });
        handleClose();
    }

    function onChangePath(path: string) {
        // todo validation of path
        setDerivation(path);
    }

    const title = t('general.nouns.derivation_path');
    const title1 = t('components.addPathModal.title', { title });

    return (
        <Modal title={title1} open={isOpen} onClose={handleClose}>
            <MainContainer>
                <TextField label={t('components.addPathModal.path_label')} value={label} onChange={(val) => setLabel(val)} />

                <UrlContainer>
                    <TextField label="Derivation Path (e.g m/44'/1729'/0'/0'/1')" value={derivation} onChange={(val) => onChangePath(val)} errorText={error} />
                    {error && <FeedbackIcon iconName="warning" size={ms(0)} color="error1" />}
                </UrlContainer>
                <ActionButton onClick={() => handleAddPath()} color="secondary" variant="extended" disabled={!label || !derivation}>
                    {t('general.verbs.save')}
                </ActionButton>
            </MainContainer>
        </Modal>
    );
}

export default AddPathModal;
