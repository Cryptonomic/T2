import { P2PPairingRequest, ExtendedP2PPairingResponse, PostMessagePairingRequest, ExtendedPostMessagePairingResponse } from '@airgap/beacon-types';
// import { toHex, getHexHash, sealCryptobox } from '@airgap/beacon-utils';
import { convertPublicKeyToX25519, convertSecretKeyToX25519, KeyPair } from '@stablelib/ed25519';
import { clientSessionKeys, serverSessionKeys, SessionKeys } from '@stablelib/x25519-session';
/**
 * @internalapi
 *
 *
 */
export abstract class CommunicationClient {
    constructor(protected readonly keyPair: KeyPair) {}

    /**
     * Get the public key
     */
    public async getPublicKey(): Promise<string> {
        // return toHex(this.keyPair.publicKey);
        const res = await window.electron.beacon.utils.toHex(this.keyPair.publicKey);
        return res;
    }

    /**
     * get the public key hash
     */
    public async getPublicKeyHash(): Promise<string> {
        // return getHexHash(this.keyPair.publicKey);
        const res = await window.electron.beacon.utils.getHexHash(this.keyPair.publicKey);
        return res;
    }

    /**
     * Create a cryptobox server
     *
     * @param otherPublicKey
     * @param selfKeypair
     */
    // eslint-disable-next-line class-methods-use-this
    protected async createCryptoBoxServer(otherPublicKey: string, selfKeypair: KeyPair): Promise<SessionKeys> {
        return serverSessionKeys(
            {
                publicKey: convertPublicKeyToX25519(selfKeypair.publicKey),
                secretKey: convertSecretKeyToX25519(selfKeypair.secretKey),
            },
            convertPublicKeyToX25519(window.electron.buffer.from(otherPublicKey, 'hex'))
        );
    }

    /**
     * Create a cryptobox client
     *
     * @param otherPublicKey
     * @param selfKeypair
     */
    // eslint-disable-next-line class-methods-use-this
    protected async createCryptoBoxClient(otherPublicKey: string, selfKeypair: KeyPair): Promise<SessionKeys> {
        return clientSessionKeys(
            {
                publicKey: convertPublicKeyToX25519(selfKeypair.publicKey),
                secretKey: convertSecretKeyToX25519(selfKeypair.secretKey),
            },
            convertPublicKeyToX25519(window.electron.buffer.from(otherPublicKey, 'hex'))
        );
    }

    /**
     * Encrypt a message for a specific publicKey (receiver, asymmetric)
     *
     * @param recipientPublicKey
     * @param message
     */
    // eslint-disable-next-line class-methods-use-this
    protected async encryptMessageAsymmetric(recipientPublicKey: string, message: string): Promise<string> {
        // return sealCryptobox(message, window.electron.buffer.from(recipientPublicKey, 'hex'));
        const res = await window.electron.beacon.core.encryptMessageAsymmetric(recipientPublicKey, message);
        return res;
    }

    abstract unsubscribeFromEncryptedMessages(): Promise<void>;
    abstract unsubscribeFromEncryptedMessage(senderPublicKey: string): Promise<void>;
    // abstract send(message: string, recipient?: string): Promise<void>
    public abstract sendMessage(
        message: string,
        peer?: P2PPairingRequest | ExtendedP2PPairingResponse | PostMessagePairingRequest | ExtendedPostMessagePairingResponse
    ): Promise<void>;
}
