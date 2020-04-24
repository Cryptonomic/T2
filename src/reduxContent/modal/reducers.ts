import { SET_MODAL_OPEN, SET_MODAL_ACTIVE_TAB, SET_MODAL_DEFAULT_MESSAGE } from './types';

const initState = {
    open: false,
    activeTab: 0,
    defaultMessage: ''
};

export function modalReducer(state = initState, action) {
    switch (action.type) {
        case SET_MODAL_OPEN: {
            return { ...state, open: action.open };
        }
        case SET_MODAL_ACTIVE_TAB: {
            return { ...state, activeTab: action.activeTab };
        }
        case SET_MODAL_DEFAULT_MESSAGE: {
            return { ...state, defaultMessage: action.defaultMessage };
        }
        default:
            return state;
    }
}
