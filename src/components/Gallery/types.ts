export interface GalleryBreakpointsProps {
    breakpoint: string;
    cols: number;
    itempadding?: string;
}

export interface GalleryProps {
    cols?: number;
    breakpoints?: Record<string, GalleryBreakpointsProps>;
    containerPadding?: string;
    itempadding?: string;
    isEmpty?: boolean;
}
