import { CLEAR_MESSAGE_STATE, ADD_MESSAGE, MessageActionTypes } from './types';

import { MessageState } from '../../types/store';

const initState = {
  text: '',
  isError: false,
  hash: '',
  localeParam: 0
};

export function messageReducer(state = initState, action: MessageActionTypes): MessageState {
  switch (action.type) {
    case ADD_MESSAGE: {
      return { ...state, ...action.payload };
    }
    case CLEAR_MESSAGE_STATE: {
      return { ...state, ...initState };
    }
    default:
      return state;
  }
}
