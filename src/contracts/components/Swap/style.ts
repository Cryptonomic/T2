import styled from 'styled-components';

export const SegmentedControlContainer = styled.div`
    font-size: 18px;
    font-weight: 300;
    display: flex;
    margin-bottom: 30px;
    color: ${({ theme: { colors } }) => colors.gray0};
`;

export const SegmentedControl = styled.div`
    display: flex;
    border-radius: 35px;
    width: 284px;
    font-size: 12px;
    line-height: 31px;
    text-align: center;
    overflow: hidden;
    margin-left: 10px;
    font-weight: 500;
`;

export const SegmentedControlItem = styled.div<{ active: boolean }>`
    background-color: ${({ theme: { colors }, active }) => (active ? colors.accent : 'rgba(148, 169, 209, 0.13)')};
    color: ${({ theme: { colors }, active }) => (active ? colors.white : colors.index0)};
    flex: 1;
`;
