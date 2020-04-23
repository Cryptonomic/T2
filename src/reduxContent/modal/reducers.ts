import { SET_MODAL_OPEN } from './types';

const initState = {
    open: false
};

export function modalReducer(state = initState, action) {
    switch (action.type) {
        case SET_MODAL_OPEN: {
            return { ...state, open: action.open };
        }
        default:
            return state;
    }
}
