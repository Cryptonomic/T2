import { WalletState } from '../types/store';
export function getLoggedIn(wallet: WalletState) {
  const { walletFileName } = wallet;
  return !!walletFileName;
}
