import styled from 'styled-components';
import Masonry from 'react-masonry-component';
// import Masonry from '@mui/lab/Masonry';
import { ms } from '../../styles/helpers';

import { GalleryProps } from './types';

/**
 * The GalleryContainer is a styled div adding an optional padding to the container
 * that wraps the masonry.
 *
 * @param {string} [padding = 0]
 */
export const GalleryContainer = styled.div<{ padding?: string }>`
    padding: ${({ padding }) => padding || '0'};
`;

/**
 * The StyledMasonry is a styled Masonry component.
 *
 * To make a component responsive, use the `breakpoints` property.
 *
 * @param {number} [cols = 3] - number of columns.
 * @param {string} [itempadding= '0 34px'] - the horizontal/vertical gap between gallery items.
 * @param {GalleryContainerBreakpointProps} [breakpoints] - add the responsivness to the gallery.
 */
export const StyledMasonry = styled(Masonry)<GalleryProps>`
    padding: 0;
    margin: 0;

    & > li {
        width: ${({ cols }) => (cols && cols > 0 ? `${100 / cols}%` : '33.3333%')};
        padding: ${({ itempadding }) => itempadding || '0'};

        ${({ breakpoints }) => {
            if (!breakpoints) {
                return null;
            }

            return Object.keys(breakpoints)
                .map(
                    (x) =>
                        `
                @media all and (min-width: ${breakpoints[x].breakpoint}) {
                    width: ${breakpoints[x].cols && breakpoints[x].cols > 0 ? `${100 / breakpoints[x].cols}%` : '100%'};
                    ${
                        breakpoints[x].itempadding
                            ? `
                        padding: ${breakpoints[x].itempadding};
                    `
                            : ''
                    }
                }
                `
                )
                .join(' ');
        }}
    }
`;

/**
 * The wrapper for the gallery item.
 */
export const GalleryItem = styled.li`
    list-style: none;
`;

/**
 * Styling the EmptyState component within the Gallery.
 */
export const EmptyStateContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    padding-bottom: ${ms(11)};
`;
