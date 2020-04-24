import { SET_MODAL_OPEN, SET_MODAL_ACTIVE_TAB, SET_MODAL_DEFAULT_MESSAGE } from './types';

export const setModalOpen = open => ({
    type: SET_MODAL_OPEN,
    open
});

export const setModalActiveTab = activeTab => ({
    type: SET_MODAL_ACTIVE_TAB,
    activeTab
});

export const setModalDefaultMessage = defaultMessage => ({
    type: SET_MODAL_DEFAULT_MESSAGE,
    defaultMessage
});
