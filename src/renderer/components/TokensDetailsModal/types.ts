import { Token } from '../../types/general';

export interface TokensDetailsModalProps {
    open: boolean;
    tokens: Token[];
    onClose?: () => void;
    onBrowseObjects?: (token: Token) => void;
}
