import styled from 'styled-components';
import { MenuItem, FormControl, InputLabel } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

export const ItemWrapper = styled(MenuItem)`
    &&& {
        &[class*='selected'] {
            color: ${({ theme: { colors } }) => colors.primary};
        }
        width: 100%;
        height: 40px;
        box-sizing: border-box;
        font-size: 16px;
        font-weight: 300;
        background-color: ${({ theme: { colors } }) => colors.white};
    }
`;

export const SelectContainer = styled(FormControl)`
    width: 100%;
`;

export const LabelWrapper = styled(InputLabel)`
  &&& {
    &[class*='focused'] {    
      color: ${({ theme: { colors } }) => colors.gray3};
    }
    color: rgba(0, 0, 0, 0.38);
    font-size: 16px;
    transform: translate(0, 1.5px) scale(0.75);
    transform-origin: top left;
    transition: transform 200ms cubic-bezier(0.0, 0, 0.2, 1) 0ms;
  }
}`;

export const SelectWrapper = styled.div`
    width: 100%;
    height: 32px;
    color: #123262;
    font-size: 16px;
    font-weight: 300;
    margin-top: 16px;
    display: inline-flex;
    position: relative;
    border-bottom: solid 1px rgba(0, 0, 0, 0.12);
    &:hover {
        border-bottom: solid 2px #2c7df7;
    }
    &:active {
        border-bottom: solid 2px #2c7df7;
    }
`;

export const SelectContent = styled.div`
    width: auto;
    overflow: hidden;
    min-height: 1.1875em;
    white-space: nowrap;
    text-overflow: ellipsis;
    cursor: pointer;
    user-select: none;
    padding: 0 32px 0 0;
    -webkit-appearance: none;
    display: flex;
    align-items: center;
    flex-grow: 1;
`;

export const SelectIcon = styled(ArrowDropDownIcon)`
    top: calc(50% - 12px);
    right: 0;
    color: rgba(0, 0, 0, 0.54);
    position: absolute;
    pointer-events: none;

    fill: currentColor;
    width: 1em;
    height: 1em;
    display: inline-block;
    font-size: 24px;
    transition: fill 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
    user-select: none;
    flex-shrink: 0;
`;

export const GroupContainerWrapper = styled.div`
    width: 100%;
    height: 200px;
    position: relative;
`;

export const ScrollContainer = styled.div`
    &&& {
        width: 100%;
        height: 100%;
        overflow: auto;
        display: block;
        &::-webkit-scrollbar {
            width: 4px;
        }
        &::-webkit-scrollbar-track {
            background: ${({ theme: { colors } }) => colors.gray2};
        }

        &::-webkit-scrollbar-thumb {
            background: ${({ theme: { colors } }) => colors.accent};
            border-radius: 4px;
        }
    }
`;

const FadeOut = styled.div`
    position: absolute;
    width: 92%;
    height: 30px;
    pointer-events: none;
    z-index: 100;
`;

export const FadeTop = styled(FadeOut)`
    top: 0;
    background-image: linear-gradient(to top, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 50%);
`;

export const FadeBottom = styled(FadeOut)`
    bottom: 0;
    background-image: linear-gradient(rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 50%);
`;
