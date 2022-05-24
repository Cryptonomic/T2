import { CLEAR_MESSAGE_STATE, ADD_MESSAGE, ClearMessageAction, CreateMessageAction } from './types';
import { MessageState } from '../../types/store';

export function clearMessageAction(): ClearMessageAction {
    return {
        type: CLEAR_MESSAGE_STATE,
    };
}

export function createMessageAction(text: string, isError: boolean, hash: string = '', localeParam: number = 0, isBeacon = false): CreateMessageAction {
    const payload: MessageState = { text, isError, hash, localeParam, isBeacon };
    return {
        type: ADD_MESSAGE,
        payload,
    };
}
