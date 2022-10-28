import { SET_MODAL_OPEN, SET_MODAL_ACTIVE_TAB, SET_MODAL_VALUE, CLEAR_MODAL } from './types';
import { ModalState } from '../../types/store';

const initState = {
    open: false,
    activeModal: '',
    activeTab: 'sign',
    tabs: ['sign', 'verify'],
    values: {}
};

export function modalReducer(state: ModalState = initState, action) {
    switch (action.type) {
        case SET_MODAL_OPEN: {
            return { ...state, open: action.open, activeModal: action.activeModal };
        }
        case SET_MODAL_ACTIVE_TAB: {
            return { ...state, activeTab: action.activeTab };
        }
        case SET_MODAL_VALUE: {
            return { ...state, values: { ...state.values, [action.name]: action.value } };
        }
        case CLEAR_MODAL: {
            return initState;
        }
        default:
            return state;
    }
}
