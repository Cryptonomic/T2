import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { BeaconMessageType, SignPayloadResponse, BeaconErrorType, BeaconResponseInputMessage, SigningType } from '@airgap/beacon-sdk';

import { beaconClient } from './BeaconMessageRouter';

import Loader from '../../components/Loader';
import PasswordInput from '../../components/PasswordInput';

import { RootState, ModalState } from '../../types/store';

import { setModalOpen } from '../../reduxContent/modal/actions';
import { setBeaconLoading } from '../../reduxContent/app/actions';
import { createMessageAction } from '../../reduxContent/message/actions';

import { ModalWrapper, ModalContainer, Container, ButtonContainer, InvokeButton, WhiteBtn, Footer } from '../style';
import { WrapPassword } from './style';

interface Props {
    open: boolean;
    onClose: () => void;
}

function BeaconSignature({ open, onClose }: Props) {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { isLedger } = useSelector((rootState: RootState) => rootState.app, shallowEqual);
    const activeModal = useSelector<RootState, string>((state: RootState) => state.modal.activeModal);
    const modalValues = useSelector<RootState, ModalState>((state) => state.modal.values, shallowEqual);
    const beaconLoading = useSelector((state: RootState) => state.app.beaconLoading);

    const [password, setPassword] = useState('');
    const [ledgerModalOpen, setLedgerModalOpen] = useState(false);
    const [parseError, setParseError] = useState('');
    const [content, setContent] = useState('');

    const { id, payload, website, appMetadata, signingType } = modalValues[activeModal];

    const onCancel = async () => {
        try {
            const response: BeaconResponseInputMessage = {
                id,
                type: BeaconMessageType.Error,
                errorType: BeaconErrorType.ABORTED_ERROR,
                // senderId:
            };
            await beaconClient.respond(response);
        } finally {
            onClose();
        }
    };

    const onSignature = async () => {
        try {
            dispatch(setBeaconLoading(true));

            if (isLedger) {
                setLedgerModalOpen(true);
            }

            let sig = '';
            if (isLedger) {
                try {
                    setLedgerModalOpen(true);
                    sig = await window.electron.beacon.getSignature(true, payload, signingType, password);
                } finally {
                    setLedgerModalOpen(false);
                }
            } else {
                sig = await window.electron.beacon.getSignature(false, payload, signingType, password);
            }

            try {
                const response: SignPayloadResponse = {
                    type: BeaconMessageType.SignPayloadResponse,
                    id,
                    signingType,
                    signature: sig,
                    senderId: '',
                    version: '',
                };

                await beaconClient.respond(response);

                dispatch(setModalOpen(false, activeModal));
            } catch (e: any) {
                dispatch(createMessageAction(`Beacon signature failed with "${e.message}"`, true));
            }
        } catch (e: any) {
            console.log('Error generating signature for Beacon request', e);
            dispatch(createMessageAction(e.message || e.toString(), true));
            setLedgerModalOpen(false);
        } finally {
            dispatch(setBeaconLoading(false));
        }
    };

    useEffect(() => {
        const onInit = async () => {
            if (signingType === SigningType.MICHELINE || signingType === SigningType.OPERATION) {
                try {
                    const parsedContent = await window.conseiljs.TezosMessageUtils.readPackedData(payload, '');
                    const convertedContent = typeof parsedContent === 'number' ? String(parsedContent) : parsedContent;
                    setContent(convertedContent);
                } catch {
                    setParseError('Could not parse signature request.');
                    setContent(payload);
                }
            } else {
                setContent(payload);
            }
        };
        onInit();
    }, [content]);

    return (
        <ModalWrapper open={open}>
            {open ? (
                <ModalContainer>
                    <Container>
                        <div className="modal-holder">
                            <h3>{t('components.Beacon.signature.title')}</h3>

                            <p className="linkAddress">{website}</p>
                            <p>
                                {appMetadata.name} is requesting a signature of <strong>{signingType}</strong> content.
                            </p>

                            {signingType === SigningType.RAW && (
                                <div>
                                    <p className="inputLabel">Plain Text Content</p>
                                    <textarea className="inputField" readOnly value={content} />
                                </div>
                            )}

                            {signingType === SigningType.MICHELINE && (
                                <div>
                                    <p className="inputLabel">Code Content</p>
                                    <textarea className="inputField" readOnly value={content} />
                                </div>
                            )}

                            {signingType === SigningType.OPERATION && (
                                <div>
                                    <p className="inputLabel">Operation Content</p>
                                    <textarea className="inputField" readOnly value={content} />
                                </div>
                            )}

                            {parseError !== '' && (
                                <div className="feeContainer">
                                    <p className="inputLabel">Validation Error</p>
                                    <p className="subtitleText">
                                        Could not estimate fee due to operation validation failure. Please contact the dApp developer for resolution.
                                    </p>
                                    <p className="inputLabel">Error Details</p>
                                    <p className="subtitleText" style={{ height: '40px', overflow: 'scroll' }}>
                                        {parseError.split(',').map((p, i) => (
                                            <div key={`error${i}`}>{p}</div>
                                        ))}
                                    </p>
                                </div>
                            )}

                            {!isLedger && parseError === '' && (
                                <WrapPassword>
                                    <PasswordInput label={t('general.nouns.wallet_password')} password={password} onChange={(pwd) => setPassword(pwd)} />
                                </WrapPassword>
                            )}

                            {parseError === '' && (signingType === SigningType.OPERATION || signingType === SigningType.MICHELINE) && (
                                <p className="subtitleText">
                                    Signing this content may allow an attacker to execute operations on chain on your behalf. Always make sure you trust the
                                    sites you interact with.
                                </p>
                            )}

                            {parseError === '' && signingType === SigningType.RAW && (
                                <p className="subtitleText">
                                    Signing this text may allow an attacker to impersonate you. Always make sure you trust the sites you interact with.
                                </p>
                            )}
                        </div>
                    </Container>
                    {beaconLoading && <Loader />}
                    <Footer>
                        {!ledgerModalOpen && (
                            <ButtonContainer>
                                <WhiteBtn buttonTheme="secondary" onClick={onCancel}>
                                    {t('general.verbs.cancel')}
                                </WhiteBtn>
                                {parseError === '' && (
                                    <InvokeButton buttonTheme="primary" onClick={onSignature}>
                                        {t('general.verbs.sign')}
                                    </InvokeButton>
                                )}
                            </ButtonContainer>
                        )}

                        {isLedger && ledgerModalOpen && parseError === '' && (
                            <ButtonContainer>
                                <>Please confirm the operation on the Ledger device</>
                            </ButtonContainer>
                        )}
                    </Footer>
                </ModalContainer>
            ) : (
                <ModalContainer />
            )}
        </ModalWrapper>
    );
};

export default BeaconSignature;
