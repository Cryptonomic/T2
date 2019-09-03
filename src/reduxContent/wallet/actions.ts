import { Action, ActionCreator } from 'redux';

import { SETTING, INCREMENT, DECREMENT } from './types';

export interface SettingAction extends Action {
  type: 'SETTING';
}
export interface IncrementAction extends Action {
  type: 'INCREMENT';
}
export interface DecrementAction extends Action {
  type: 'DECREMENT';
}

export const setDefaultSetting: ActionCreator<SettingAction> = () => ({
  type: SETTING
});

export const increment: ActionCreator<IncrementAction> = () => ({
  type: INCREMENT
});

export const decrement: ActionCreator<DecrementAction> = () => ({
  type: DECREMENT
});

export type WalletAction = SettingAction | IncrementAction | DecrementAction;
