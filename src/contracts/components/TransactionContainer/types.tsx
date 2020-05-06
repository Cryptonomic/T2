import { Token, TokenTransaction } from '../../../types/general';

export interface Props {
    transactions: TokenTransaction[];
    selectedParentHash: string;
    token: Token;
}
