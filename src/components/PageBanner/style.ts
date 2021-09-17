import styled from 'styled-components';
import { lighten } from 'polished';
import mStyled from '@material-ui/styles/styled';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import { H4 } from '../Heading';
import { ms } from '../../styles/helpers';

/**
 * The blue PageBanner container.
 */
export const PageBanner = styled.header`
    padding: ${ms(0)} ${ms(4)};
    background-color: ${({ theme: { colors } }) => colors.accent};
`;

/**
 * The PageBanner's title style.
 */
export const PageTitle = styled(H4)`
    font-weight: 500;
    color: ${({ theme: { colors } }) => colors.white};
    margin: 0;
    line-height: 1.75;
    font-size: ${ms(2.2)};
`;

/**
 * The basic row.
 */
export const Row = styled.div`
    margin: 0 0 ${ms(3)} 0;
`;

/**
 * Row inside the Page Banner with a flex display.
 *
 * @param {'flex-start' | 'center' | 'flex-end' | 'space-between' | 'stretch'} [justify='flex-start']
 * @param {'flex-start' | 'center' | 'flex-end' | 'stretch'} [alignItems='center']
 * @param {string} [opacity=1]
 * @param {boolean} [lightColor] - use the light color.
 */
export const PageBannerRow = styled(Row)<{
    justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'stretch';
    alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
    opacity?: string;
    lightColor?: boolean;
}>`
    display: flex;
    justify-content: ${({ justify }) => justify || 'flex-start'};
    align-items: ${({ alignItems }) => alignItems || 'center'};
    opacity: ${({ opacity }) => opacity || '1'};
    color: ${({ theme: { colors }, lightColor }) => (lightColor ? lighten(0.3, colors.accent) : colors.white)};
`;

/**
 * The styled link for the PageBanner.
 */
export const Link = styled.div`
    display: flex;
    align-items: center;
    font-size: 14px;
    line-height: 16px;
    cursor: pointer;
`;

/**
 * The SVG link icon.
 */
export const LinkIcon = mStyled(OpenInNewIcon)({
    fontSize: '12px',
    marginLeft: '5px',
    '&:hover': {
        cursor: 'pointer',
    },
});

/**
 * PageBanner's breadcrumbs.
 */
export const Breadcrumbs = styled.div`
    font-size: ${ms(-1)};
`;
