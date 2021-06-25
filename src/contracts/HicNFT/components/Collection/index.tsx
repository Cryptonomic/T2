import React from 'react';
import { useTranslation } from 'react-i18next';

import PaginationList from '../../../../components/PaginationList';

import ArtGallery from './gallery';
import { Container } from './style';

interface Props {
    collection: any[];
}

export default function CollectionContainer(props: Props) {
    const { collection } = props;
    const { t } = useTranslation();

    return (
        <Container>
            <PaginationList
                list={collection}
                ListComponent={ArtGallery}
                listComponentProps={{}}
                componentListName="collection"
                emptyState={''}
                emptyStateTitle={'No OBJKTs found.'}
            />
        </Container>
    );
}
