import { SET_MODAL_OPEN, SET_MODAL_ACTIVE_TAB, SET_MODAL_TAB, CLEAR_MODAL } from './types';
import { ModalState } from '../../types/store';

const initState = {
    open: false,
    activeTab: 'plain',
    tabs: ['plain', 'verify', 'auth'],
    tabsValues: []
};

export function modalReducer(state: ModalState = initState, action) {
    switch (action.type) {
        case SET_MODAL_OPEN: {
            return { ...state, open: action.open };
        }
        case SET_MODAL_ACTIVE_TAB: {
            return { ...state, activeTab: action.activeTab };
        }
        case SET_MODAL_TAB: {
            return { ...state, tabsValues: [...state.tabsValues, action.tab] };
        }
        case CLEAR_MODAL: {
            return initState;
        }
        default:
            return state;
    }
}
