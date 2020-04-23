import { SET_MODAL_OPEN, SET_MODAL_ACTIVE_TAB } from './types';

export const setModalOpen = open => ({
    type: SET_MODAL_OPEN,
    open
});

export const setModalActiveTab = activeTab => ({
    type: SET_MODAL_ACTIVE_TAB,
    activeTab
});
