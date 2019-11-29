import { CLEAR_MESSAGE_STATE, ADD_MESSAGE, ClearMessageAction, CreateMessageAction } from './types';
import { MessageState } from '../../types/store';

export function clearMessageAction(): ClearMessageAction {
  return {
    type: CLEAR_MESSAGE_STATE
  };
}

export function createMessageAction(
  message,
  isError,
  hash = '',
  localeParam = 0
): CreateMessageAction {
  const payload: MessageState = { message, isError, hash, localeParam };
  return {
    type: ADD_MESSAGE,
    payload
  };
}
