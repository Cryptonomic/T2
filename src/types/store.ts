import { Signer } from 'conseiljs';
import { BeaconRequestOutputMessage, ConnectionContext } from '@airgap/beacon-sdk';

import { Path, Node, NodeStatus, Identity, Token, AddressType } from './general';
import { NFTCollections, NFTError } from '../contracts/NFT/types';

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
    selectedTokenName: string;
    signer: Signer | null;
    beaconClient: boolean;
    beaconMessage: BeaconRequestOutputMessage | null;
    beaconConnection: ConnectionContext | null;
    beaconLoading: boolean;
    launchUrl: string | null;
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
    activeModal: string;
    activeTab: string;
    tabs: string[];
    values: any;
    id?: string;
    version?: string;
    senderId?: string;
}

export interface NFTState {
    isNFTSyncing: boolean;
    syncEnabled: boolean;
    lastSyncAt: Date | null;
    collections: NFTCollections;
    collectionsAreLoading: boolean;
    getCollectionsErrors: NFTError[];
}

export interface RootState {
    router: any;
    wallet: WalletState;
    message: MessageState;
    settings: SettingsState;
    app: AppState;
    modal: ModalState;
    nft: NFTState;
}
