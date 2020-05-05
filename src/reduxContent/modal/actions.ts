import { SET_MODAL_OPEN, SET_MODAL_ACTIVE_TAB, SET_MODAL_VALUE, CLEAR_MODAL } from './types';

export const setModalOpen = (open: boolean, activeModal: string) => ({
    type: SET_MODAL_OPEN,
    open,
    activeModal
});

export const setModalActiveTab = (activeTab: string | null) => ({
    type: SET_MODAL_ACTIVE_TAB,
    activeTab
});

export const setModalValue = (value: object, name: string) => ({
    type: SET_MODAL_VALUE,
    value,
    name
});

export const clearModal = () => ({
    type: CLEAR_MODAL
});
