/**
 * @internalapi
 *
 * The Serializer is used to serialize / deserialize JSON objects and encode them with bs58check
 */
export class Serializer {
    /**
     * Serialize and bs58check encode an object
     *
     * @param message JSON object to serialize
     */
    // eslint-disable-next-line class-methods-use-this
    public async serialize(message: unknown): Promise<string> {
        const str = JSON.stringify(message);

        const res = await window.electron.bs58check.encodeToString(str);
        return res;
    }

    /**
     * Deserialize a bs58check encoded string
     *
     * @param encoded String to be deserialized
     */
    // eslint-disable-next-line class-methods-use-this
    public async deserialize(encoded: string): Promise<unknown> {
        if (typeof encoded !== 'string') {
            throw new Error('Encoded payload needs to be a string');
        }

        return JSON.parse(await window.electron.bs58check.decodeToString(encoded));
    }
}
