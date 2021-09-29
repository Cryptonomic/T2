import styled from 'styled-components';
import { lighten } from 'polished';
import Modal from '@material-ui/core/Modal';

/**
 * The wrapper positioning the loader on the center
 */
export const LoaderWrapper = styled.div`
    width: 100%;
    padding: 80px 20px;
    position: relative;
`;

/**
 * The modal wrapper.
 */
export const ModalWrapper = styled(Modal)`
    display: flex;
    justify-content: center;
    align-items: center;
`;

/**
 * The NFT modal box
 */
export const ModalBox = styled.div`
    background: ${({ theme: { colors } }) => colors.white};
    box-shadow: 0 2px 16px -4px ${({ theme: { colors } }) => lighten(0.4, colors.black3)};
    width: 1000px;
    max-width: calc(100% - 16px);
    overflow: auto;
`;
