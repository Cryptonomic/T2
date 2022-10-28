import { TAB_SIZES } from './constants';

export interface TabMenuProps {
    count?: number;
}

export type TabSizeType = typeof TAB_SIZES[keyof typeof TAB_SIZES];

export interface TabProps {
    isActive?: boolean;
    ready?: boolean;
    size?: TabSizeType;
}

export interface TabTextProps {
    ready?: boolean;
}
