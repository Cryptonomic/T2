export interface WalletState {
  identities: any[];
  isLoading: boolean;
  isWalletSyncing: boolean;
  walletFileName: string;
  walletLocation: string;
  password: string;
  nodesStatus: any;
  time: any;
  isLedger: boolean;
  isLedgerConnecting: boolean;
  newVersion: string;
}

export interface MessageState {
  message: string;
  isError: boolean;
  hash: string;
  localeParam: number;
}

export interface SettingsState {
  locale: string;
  tezosSelectedNode: string;
  conseilSelectedNode: string;
  nodesList: any[];
  delegateTooltip: boolean;
  selectedPath: string;
  pathsList: any[];
  network: string;
  platform: string;
}

export interface RootState {
  router: any;
  wallet: WalletState;
  message: MessageState;
  settings: SettingsState;
}
