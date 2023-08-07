/**
 * The exception for failed NFT transfers performed with the Conseil.js.
 * @extends Error
 */
export class TransferNFTError extends Error {
    transfers?: {
        address: string;
        tokenid: number | string;
        amount: number;
    }[];

    /**
     * Create the TransferNFTError
     * @param {string} message - the message.
     * @param {TransferPair[]} transfers - transfers of the failed transaction.
     */
    constructor(
        message: string,
        transfers?: {
            address: string;
            tokenid: number | string;
            amount: number;
        }[]
    ) {
        super(message);

        this.name = 'TransferNFTError';
        this.message = message;
        this.transfers = transfers;

        Object.setPrototypeOf(this, TransferNFTError.prototype);
    }
}
