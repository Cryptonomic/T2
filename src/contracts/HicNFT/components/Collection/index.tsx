import React from 'react';
import { useTranslation } from 'react-i18next';

import { openBlockExplorerForAccount } from '../../../../utils/general';
import PaginationList from '../../../../components/PaginationList';

import ArtGallery from './gallery';
import { Container } from './style';

interface Props {
    collection: any[];
}

export default function CollectionContainer(props: Props) {
    const { collection } = props;
    const { t } = useTranslation();

    const onClick = (account: string) => {
        openBlockExplorerForAccount(account);
    };

    const emptyGallery = <></>; // TODO: show number of active auctions, link to site

    return (
        <Container>
            <PaginationList
                list={collection}
                ListComponent={ArtGallery}
                listComponentProps={{}}
                componentListName="collection"
                emptyState={emptyGallery}
                emptyStateTitle={t('components.actionPanel.empty-title')}
            />
        </Container>
    );
}
