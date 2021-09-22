export interface GalleryBreakpointsProps {
    breakpoint: string;
    cols: number;
    itemPadding?: string;
}

export interface GalleryProps {
    cols?: number;
    breakpoints?: Record<string, GalleryBreakpointsProps>;
    containerPadding?: string;
    itemPadding?: string;
    isEmpty?: boolean;
}
