import { Signer } from 'conseiljs';
import { SoftSigner } from 'conseiljs-softsigner';

let globalSigner;

export function onGetSigner() {
    return globalSigner;
}

export function onSetSigner(si) {
    globalSigner = si;
}

export async function cloneDecryptedSigner(signer: SoftSigner, password: string): Promise<Signer> {
    return SoftSigner.createSigner(await signer.getKey(password));
}
