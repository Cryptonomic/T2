import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { openBlockExplorerForAccount } from '../../../../utils/general';
import PaginationList from '../../../../components/PaginationList';

import { transferThunk } from '../../thunks';

import ArtGallery from './gallery';
import { Container } from './style';

interface Props {
    collection: any[];
}

export default function CollectionContainer(props: Props) {
    const { collection } = props;
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const [transferModalVisible, setTransferModalVisible] = useState(false);
    const [transferDestination, setTransferDestination] = useState('');
    const [transferTokenId, setTransferTokenId] = useState(0);
    const [transferAmount, setTransferAmount] = useState(1);
    const [password, setPassword] = useState('');

    const onClick = (account: string) => {
        openBlockExplorerForAccount(account);
    };

    function showTransferModal(tokenId: number) {
        setTransferTokenId(tokenId);
        setTransferModalVisible(true);
    }

    async function onTransfer() {
        await dispatch(transferThunk(transferDestination, transferAmount, transferTokenId, password));
        setTransferModalVisible(false);
    }

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
            {transferModalVisible && (
                <>
                    <></>
                </>
            )}
        </Container>
    );
}
