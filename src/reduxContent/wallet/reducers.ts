import { Reducer } from 'redux';
import { setData, getData } from '../../localData';
import { SETTING, INCREMENT, DECREMENT } from './types';
import { WalletAction } from './actions';

export interface WalletState {
  value: number;
}

const defaultState: WalletState = {
  value: 0
};

export const walletReducer: Reducer<WalletState> = (state = defaultState, action: WalletAction) => {
  switch (action.type) {
    case SETTING:
      const countNumber = getData('setting.number');
      return {
        ...state,
        value: Number(countNumber) || 0
      };
    case INCREMENT:
      setData({ setting: { number: state.value + 1 } });
      return {
        ...state,
        value: state.value + 1
      };
    case DECREMENT:
      setData({ setting: { number: state.value - 1 } });
      return {
        ...state,
        value: state.value - 1
      };
    default:
      return state;
  }
};
