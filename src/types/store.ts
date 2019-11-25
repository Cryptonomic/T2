import { Path, Node } from './general';
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
  selectedNode: string;
  nodesList: Node[];
  delegateTooltip: boolean;
  selectedPath: string;
  pathsList: Path[];
}

export interface RootState {
  router: any;
  wallet: WalletState;
  message: MessageState;
  settings: SettingsState;
}
