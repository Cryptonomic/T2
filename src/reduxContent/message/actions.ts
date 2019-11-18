import { CLEAR_MESSAGE_STATE, ADD_MESSAGE, ClearMessageAction, CreateMessageAction } from './types';
import { MessageState } from '../../types/store';

export function clearMessage(): ClearMessageAction {
  return {
    type: CLEAR_MESSAGE_STATE
  };
}

export function createMessage(payload: MessageState): CreateMessageAction {
  return {
    type: ADD_MESSAGE,
    payload
  };
}
