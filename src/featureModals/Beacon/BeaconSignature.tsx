import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { useTranslation, Trans } from 'react-i18next';
import { BeaconMessageType, SignPayloadResponse, BeaconErrorType, BeaconResponseInputMessage, SigningType } from '@airgap/beacon-sdk';
import { TezosMessageUtils } from 'conseiljs';
import { SoftSigner } from 'conseiljs-softsigner';

import { beaconClient } from './BeaconMessageRouter';

import Loader from '../../components/Loader';
import PasswordInput from '../../components/PasswordInput';

import { RootState, ModalState } from '../../types/store';
import { cloneDecryptedSigner } from '../../utils/wallet';

import { setModalOpen } from '../../reduxContent/modal/actions';
import { setBeaconLoading } from '../../reduxContent/app/actions';
import { createMessageAction } from '../../reduxContent/message/actions';

import { ModalWrapper, ModalContainer, Container, ButtonContainer, InvokeButton, WhiteBtn, Footer } from '../style';
import { WrapPassword } from './style';

interface Props {
    open: boolean;
    onClose: () => void;
}

const BeaconSignature = ({ open, onClose }: Props) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { signer, isLedger } = useSelector((rootState: RootState) => rootState.app, shallowEqual);
    const activeModal = useSelector<RootState, string>((state: RootState) => state.modal.activeModal);
    const modalValues = useSelector<RootState, ModalState>((state) => state.modal.values, shallowEqual);
    const beaconLoading = useSelector((state: RootState) => state.app.beaconLoading);

    const [password, setPassword] = useState('');
    const [ledgerModalOpen, setLedgerModalOpen] = useState(false);
    const [parseError, setParseError] = useState('');
    const [content, setContent] = useState('');
    const [signature, setSignature] = useState('');

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
                    if (signingType === SigningType.RAW) {
                        sig = (await signer?.signText(payload)) || '';
                    } else {
                        const signatureBytes = (await signer?.signOperation(Buffer.from(payload, 'hex'))) || Buffer.from('0x0', 'hex');
                        sig = TezosMessageUtils.readSignatureWithHint(signatureBytes, signer?.getSignerCurve() || 'edsig');
                    }
                } finally {
                    setLedgerModalOpen(false);
                }
            } else {
                const plainSigner = await cloneDecryptedSigner(signer as SoftSigner, password);
                if (signingType === SigningType.RAW) {
                    sig = (await plainSigner?.signText(payload)) || '';
                } else {
                    const signatureBytes = (await plainSigner?.signOperation(Buffer.from(payload, 'hex'))) || Buffer.from('0x0', 'hex');
                    sig = TezosMessageUtils.readSignatureWithHint(signatureBytes, plainSigner?.getSignerCurve() || 'edsig');
                }
            }

            setSignature(sig);
        } catch (e) {
            console.log('Transaction.Error', e);
            dispatch(createMessageAction(e.message || e.toString(), true));
            setLedgerModalOpen(false);
        } finally {
            dispatch(setBeaconLoading(false));
        }
    };

    useEffect(() => {
        if (signingType === SigningType.MICHELINE || signingType === SigningType.OPERATION) {
            try {
                const parsedContent = TezosMessageUtils.readPackedData(payload, '').toString();
                setContent(parsedContent);
            } catch {
                setParseError('Could not parse signature request.');
                setContent(payload);
            }
        } else {
            setContent(payload);
        }
    }, [content]);

    useEffect(() => {
        if (!signature || !beaconLoading) {
            return;
        }

        const sendBeaconResponse = async () => {
            try {
                const response: SignPayloadResponse = {
                    type: BeaconMessageType.SignPayloadResponse,
                    id,
                    signingType,
                    signature,
                    senderId: '',
                    version: '',
                };

                await beaconClient.respond(response);

                dispatch(setBeaconLoading(false));
                dispatch(setModalOpen(false, activeModal));
            } catch (e) {
                dispatch(createMessageAction(`Beacon signature failed with "${e.message}"`, true));
            }
        };

        sendBeaconResponse();
    }, [signature, beaconLoading]);

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
                                    <textarea className="inputField" readOnly={true} value={content} />
                                </div>
                            )}

                            {signingType === SigningType.MICHELINE && (
                                <div>
                                    <p className="inputLabel">Code Content</p>
                                    <textarea className="inputField" readOnly={true} value={content} />
                                </div>
                            )}

                            {signingType === SigningType.OPERATION && (
                                <div>
                                    <p className="inputLabel">Operation Content</p>
                                    <textarea className="inputField" readOnly={true} value={content} />
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
                                            <div key={'error' + i}>{p}</div>
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
