import { Signer, SignerCurve, TezosMessageUtils } from 'conseiljs';

/**
 * Softsigner is a wrapper for libsodium. It leverages the ED25519 curve to perform cryptographic operations relevant for the Tezos blockchain.
 */
export class SoftSigner implements Signer {
    readonly _secretKey: Buffer;

    private _isEncrypted: boolean;

    private _salt: Buffer;

    /**
     *
     * @param secretKey Secret key for signing.
     * @param isEncrypted Specifies if the provided key material is encrypted
     * @param salt If the key was encrypted, this parameter contains the salt that would then be combined with a password to decrypt the key.
     */
    private constructor(secretKey: Buffer, isEncrypted = false, salt?: Buffer) {
        this._secretKey = secretKey;
        this._isEncrypted = isEncrypted;
        // this._salt = salt ? salt : Buffer.alloc(0);
        this._salt = salt || window.electron.buffer.alloc(0);
    }

    // eslint-disable-next-line class-methods-use-this
    public getSignerCurve(): SignerCurve {
        return SignerCurve.ED25519;
    }

    /**
     *
     * @param secretKey Plain key material
     * @param password Password to optionally encrypt the key in memory
     */
    public static async createSigner(secretKey: Buffer, password = ''): Promise<Signer> {
        if (password.length > 0) {
            const salt = await window.conseiljsSoftSigner.CryptoUtils.generateSaltForPwHash();
            const encryptedKey = await window.conseiljsSoftSigner.CryptoUtils.encryptMessage(secretKey, password, salt);
            return new SoftSigner(encryptedKey, true, salt);
        }

        return new SoftSigner(secretKey);
    }

    public async getKey(password = '') {
        if (this._isEncrypted && password.length > 0) {
            const val = await window.conseiljsSoftSigner.CryptoUtils.decryptMessage(this._secretKey, password, this._salt);
            return window.electron.buffer.from(val, 'utf8');
        }

        return this._secretKey;
    }

    /**
     * This method in intended to sign Tezos operations. It produces a 32-byte blake2s hash prior to signing the buffer.
     *
     * @param {Buffer} bytes Bytes to sign
     * @param {string} password Optional password to decrypt the key if necessary
     * @returns {Buffer} Signature
     */
    public async signOperation(bytes: Buffer, password = ''): Promise<Buffer> {
        const res = await window.conseiljsSoftSigner.CryptoUtils.signDetached(
            await window.conseiljs.TezosMessageUtils.simpleHash(bytes, 32),
            await this.getKey(password)
        );
        return res;
    }

    /**
     * Convenience function that uses Tezos nomenclature to sign arbitrary text.
     *
     * @param message UTF-8 text
     * @param {string} password Optional password to decrypt the key if necessary
     * @returns {Promise<string>} base58check-encoded signature prefixed with 'edsig'
     */
    public async signText(message: string, password = ''): Promise<string> {
        const messageSig = await window.conseiljsSoftSigner.CryptoUtils.signDetached(window.electron.buffer.from(message, 'utf8'), await this.getKey(password));

        return TezosMessageUtils.readSignatureWithHint(messageSig, 'edsig');
    }

    /**
     * * Convenience function that uses Tezos nomenclature to sign arbitrary text. This method produces a 32-byte blake2s hash prior to signing.
     *
     * @param message UTF-8 text
     * @param {string} password Optional password to decrypt the key if necessary
     * @returns {Promise<string>} base58check-encoded signature prefixed with 'edsig'
     */
    public async signTextHash(message: string, password = ''): Promise<string> {
        const messageSig = await this.signOperation(Buffer.from(message, 'utf8'), password);

        return TezosMessageUtils.readSignatureWithHint(messageSig, 'edsig');
    }
}
