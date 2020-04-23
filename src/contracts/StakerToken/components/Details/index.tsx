import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
    padding: 0 20px 20px 20px;
    position: relative;
`;

const ItemContainer = styled.div`
    width: 100%;
    height: 57px;
    border-bottom: solid 1px rgba(148, 169, 209, 0.27);
    display: flex;
    align-items: center;
`;

const ItemTitle = styled.div`
    font-size: 12px;
    color: rgba(0, 0, 0, 0.38);
    line-height: 18px;
    width: 70px;
    padding-right: 15px;
`;

const ItemContent = styled.div`
    font-size: 16px;
    line-height: 24px;
    color: ${({ theme: { colors } }) => colors.primary};
    font-weight: 300;
    display: flex;
    align-items: center;
`;

const ITEM_LIST = ['council', 'stage', 'phase', 'supply', 'paused'];

interface Props {
    pkh: string;
    details?: any;
}

export default function Details(props: Props) {
    const { details, pkh } = props;
    const { t } = useTranslation();

    return (
        <Container>
            {!!details &&
                ITEM_LIST.map(item => {
                    let content = '';
                    if (item === 'council') {
                        content = `[${details[item].toString()}]`;
                    } else if (item === 'paused') {
                        content = details[item].toString();
                    } else {
                        content = details[item];
                    }
                    return (
                        <ItemContainer key={item}>
                            <ItemTitle>{t(`general.nouns.${item}`)}:</ItemTitle>
                            {<ItemContent>{content}</ItemContent>}
                        </ItemContainer>
                    );
                })}
        </Container>
    );
}
