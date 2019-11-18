import { SET_SELECTED, SET_LOCALE, SetSelectedAction, SetLocaleAction } from './types';

export function setSelectedAction(selected: string, target): SetSelectedAction {
  return {
    type: SET_SELECTED,
    selected,
    target
  };
}

export function setLocaleAction(locale: string): SetLocaleAction {
  return {
    type: SET_LOCALE,
    locale
  };
}
