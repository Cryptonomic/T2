import styled from 'styled-components';

export const SegmentedControlContainer = styled.div`
    margin-bottom: 30px;
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

export const ColumnContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    width: 100%;
`;

export const MessageContainer = styled.div`
    display: flex;
    justify-content: left;
    align-items: flex-start;
    height: 80px;
    width: 100%;
    margin: 10px
    margin-bottom: 50px;
    color: #4e71ab;
    font-weight: 300;
`;
