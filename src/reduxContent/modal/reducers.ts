import { SET_MODAL_OPEN, SET_MODAL_ACTIVE_TAB } from './types';

const initState = {
    open: false,
    activeTab: 0
};

export function modalReducer(state = initState, action) {
    switch (action.type) {
        case SET_MODAL_OPEN: {
            return { ...state, open: action.open };
        }
        case SET_MODAL_ACTIVE_TAB: {
            return { ...state, activeTab: action.activeTab };
        }
        default:
            return state;
    }
}
