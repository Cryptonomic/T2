import { MessageState } from '../../types/store';
export const ADD_MESSAGE = 'ADD_MESSAGE';
export const CLEAR_MESSAGE_STATE = 'CLEAR_MESSAGE_STATE';

export interface ClearMessageAction {
  type: typeof CLEAR_MESSAGE_STATE;
}

export interface CreateMessageAction {
  type: typeof ADD_MESSAGE;
  payload: MessageState;
}

export type MessageActionTypes = ClearMessageAction | CreateMessageAction;
