import { Token } from '../types/general';

export function findToken(tokens: Token[], pkh: string, tokenName: string = ''): Token {
    return (tokens || []).find((token) => token.address === pkh && (tokenName === '' || token.displayName === tokenName)) || tokens[0];
}

export function findTokenIndex(tokens: Token[], pkh: string, tokenName: string = ''): number {
    return (tokens || []).findIndex((token) => token.address === pkh && (tokenName === '' || token.displayName === tokenName));
}
