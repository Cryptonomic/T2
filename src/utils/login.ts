import { WalletState } from '../types/store';
export function getLoggedIn(wallet: WalletState) {
  const { password, walletFileName, walletLocation, isLedger } = wallet;
  return (!!password && !!walletFileName && !!walletLocation) || isLedger;
}
