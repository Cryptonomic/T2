import { Path, Node, NodeStatus, Identity } from './general';

export interface AppState {
  isLoading: boolean;
  isWalletSyncing: boolean;
  nodesStatus: NodeStatus;
  time: any;
  isLedger: boolean;
  isLedgerConnecting: boolean;
  newVersion: string;
  selectedAccountHash: string;
  selectedParentHash: string;
  selectedParentIndex: number;
  selectedAccountIndex: number;
  isManager: boolean;
}
export interface WalletState {
  identities: Identity[];
  walletFileName: string;
  walletLocation: string;
  password: string;
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
  selectedPath: string;
  pathsList: Path[];
}

export interface RootState {
  router: any;
  wallet: WalletState;
  message: MessageState;
  settings: SettingsState;
  app: AppState;
}
