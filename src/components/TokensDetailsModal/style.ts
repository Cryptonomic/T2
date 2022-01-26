import styled from 'styled-components';
import IconButton from '@mui/material/IconButton';
import { ModalBox } from '../../contracts/components/style';

export const StyledModalBox = styled(ModalBox)`
    position: relative;

    overflow: auto;
    min-height: 560px;
    max-height: calc(100vh - 80px);
    &::-webkit-scrollbar {
        width: 6px;
    }
    &::-webkit-scrollbar-track {
        background: ${({ theme: { colors } }) => colors.gray2};
    }

    &::-webkit-scrollbar-thumb {
        background: ${({ theme: { colors } }) => colors.accent};
        border-radius: 4px;
    }
`;

export const ModalHeader = styled.h2`
    background: ${({ theme: { colors } }) => colors.accent};
    font-weight: 500;
    color: ${({ theme: { colors } }) => colors.white};
    margin: 0;
    padding: 15px 30px;
`;

export const ActionsContainer = styled.div`
    display: flex;
    padding: 16px 0;
`;

export const CloseButton = styled(IconButton)`
    &&& {
        color: ${({ theme: { colors } }) => colors.white};
        position: absolute;
        top: 5px;
        right: 5px;
        z-index: 1301;
        cursor: pointer !important;

        span,
        svg,
        path {
            cursor: pointer !important;
        }

        :hover {
            opacity: 0.7;
        }

        @media all and (min-width: 768px) {
            display: block;
        }
    }
`;

export const TokensList = styled.ul`
    list-style: none;
    padding: 0;
    margin: 5px 0;
`;

export const TokenItem = styled.li`
    padding: 16px 30px;

    :nth-child(even) {
        background: ${({ theme: { colors } }) => colors.gray19};
    }
`;

export const TokenItemHeader = styled.div`
    display: flex;
    align-items: center;
    padding-top: 4px;
    padding-bottom: 4px;
    margin-bottom: 4px;
`;

export const TokenItemName = styled.h3`
    margin: 0;
    font-weight: 500;
    font-size: 22px;
`;

export const TokenItemActiveBadge = styled.div`
    display: flex;
    align-items: center;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 12px;
    background: ${({ theme: { colors } }) => colors.success};
    color: ${({ theme: { colors } }) => colors.white};
`;

export const BadgeText = styled.span`
    margin-left: 4px;
`;

export const TokenDetailsContainer = styled.div`
    display: flex;
    flex-direction: row;
`;

export const DetailsCol = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1;
`;

export const RightCol = styled.div`
    max-width: 200px;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: center;
`;

export const TokenDetail = styled.span`
    padding: 2px 0;
    color: ${({ theme: { colors } }) => colors.gray18};
`;

export const AmountsList = styled.ul`
    list-style: none;
    padding: 0;
    margin: 5px 0;
`;

export const AmountItem = styled.li``;
