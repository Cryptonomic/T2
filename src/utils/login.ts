import { WalletState } from '../types/store';
export function getLoggedIn(wallet: WalletState, isLedger: boolean) {
  const { password, walletFileName, walletLocation } = wallet;
  return (!!password && !!walletFileName && !!walletLocation) || isLedger;
}
