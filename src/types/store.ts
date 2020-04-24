import { Path, Node, NodeStatus, Identity, Token, AddressType } from './general';

export interface AppState {
    isLoading: boolean;
    isWalletSyncing: boolean;
    nodesStatus: NodeStatus;
    time: Date;
    isLedger: boolean;
    isLedgerConnecting: boolean;
    newVersion: string;
    selectedAccountHash: string;
    selectedParentHash: string;
    selectedParentIndex: number;
    selectedAccountIndex: number;
    selectedAccountType: AddressType;
}
export interface WalletState {
    identities: Identity[];
    walletFileName: string;
    walletLocation: string;
    walletPassword: string;
    tokens: Token[];
}

export interface MessageState {
    text: string;
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

export interface ModalState {
    open: boolean;
    activeTab: string;
    tabs: string[];
    tabsValues: Array<Record<string, string>>;
}

export interface RootState {
    router: any;
    wallet: WalletState;
    message: MessageState;
    settings: SettingsState;
    app: AppState;
    modal: ModalState;
}
