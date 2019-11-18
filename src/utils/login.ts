import { WalletState } from '../types/store';
export function isLoggedIn(wallet: WalletState) {
  const { password, walletFileName, walletLocation } = wallet;
  return password && walletFileName && walletLocation;
}

export function isSetLedger(wallet: WalletState) {
  return wallet.isLedger;
}
