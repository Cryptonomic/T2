import React, { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import { GalleryProps } from './types';
import { GalleryContainer, StyledMasonry, EmptyStateContainer } from './style';

import transactionsEmptyState from '../../../resources/transactionsEmptyState.svg';

import EmptyState from '../EmptyState';

/**
 * Gallery provides the layout for the Gallery items.
 * It is built with the Masonry library providing vertical ordering of items and the responsivness.
 *
 * It's recommended to combine with the GalleryItem.
 *
 * @param {number} [cols = 3] - number of columns.
 * @param {string} [containerPadding= '0 12px'] - the padding of the gallery container wrapping the grid.
 * @param {string} [itempadding= '0 16px'] - the padding of the grid items. It gives the gap between "columns".
 * @param {GalleryContainerBreakpointProps} [breakpoints] - add responsivness to the gallery.
 * @param {boolean} [isEmpty] - set 'true' if the collection is empty to display the empty state.
 *
 * By using the `breakpoints` property, you can make the gallery responsive.
 * The `breakpoints` property is a hash:
 *
 * ```
 * {
 *   'sm': {                // any human-friendly breakpoint name
 *      breakpoint: '500px', // (used with min-width media query)
 *      cols: 2,
 *      itempadding: '0 20px' // (optional - the gap between columns)
 *   },
 *   'md': {
 *      breakpoint: '768px',
 *      cols: 3
 *   }
 * }
 * ```
 *
 * For the screens smaller than the smallest breakpoint, the base Gallery props (cols etc.) will be used.
 *
 * @example
 * <Gallery
 *   cols={1}
 *   containerPadding='0 20px'
 *   itempadding='0 8px'
 *   breakpoints={{
 *       'md': {
 *           breakpoint: '768px',
 *           cols: 2,
 *           itempadding: '0 16px'
 *       },
 *       'lg': {
 *           breakpoint: '967px',
 *           cols: 3,
 *           }
 *   }}
 * >
 *   {items.map(item => (
 *       <GalleryItem>
 *           (...)
 *       </GalleryItem>
 *   ))}
 * </Gallery>
 */
export const Gallery: FunctionComponent<GalleryProps> = ({ children, cols, breakpoints, containerPadding = '0 12px', itempadding = '0 16px', isEmpty }) => {
    const { t } = useTranslation();

    return (
        <GalleryContainer padding={containerPadding}>
            {isEmpty ? (
                <EmptyStateContainer>
                    <EmptyState imageSrc={transactionsEmptyState} title={t('components.actionPanel.empty-gallery')} description={null} />
                </EmptyStateContainer>
            ) : (
                <StyledMasonry cols={cols} breakpoints={breakpoints} itempadding={itempadding}>
                    {children}
                </StyledMasonry>
            )}
        </GalleryContainer>
    );
};
