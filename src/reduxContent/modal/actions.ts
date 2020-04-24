import { SET_MODAL_OPEN, SET_MODAL_ACTIVE_TAB, SET_MODAL_TAB, CLEAR_MODAL } from './types';

export const setModalOpen = (open: boolean) => ({
    type: SET_MODAL_OPEN,
    open
});

export const setModalActiveTab = (activeTab: string | null) => ({
    type: SET_MODAL_ACTIVE_TAB,
    activeTab
});

export const setModalTab = (tab: object) => ({
    type: SET_MODAL_TAB,
    tab
});

export const clearModal = () => ({
    type: CLEAR_MODAL
});
