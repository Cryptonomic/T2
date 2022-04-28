import styled from 'styled-components';

export const MainContainer = styled.div`
    width: 100%;
`;

export const TopContainer = styled.div`
    display: flex;
`;

export const EsFeeContainer = styled.div`
    width: 72%;
`;
export const ButtonContainer = styled.div`
    padding-top: 18px;
    padding-left: 8px;
    width: 28%;
`;

export const BottomContainer = styled.div`
    display: flex;
    justify-content: space-between;
`;

export const FieldContainer = styled.div`
    width: 30%;
`;

export const LabelText = styled.span`
    display: block;
    margin-bottom: 0px;
    font-size: 12px;
    color: ${({ theme: { colors } }) => colors.gray5};
    font-weight: 400;
`;
