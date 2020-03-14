import { Token } from '../types/general';

export function findToken(tokens: Token[], pkh: string): Token {
  return (tokens || []).find(token => token.address === pkh) || tokens[0];
}

export function findTokenIndex(tokens: Token[], pkh: string): number {
  return (tokens || []).findIndex(token => token.address === pkh);
}
