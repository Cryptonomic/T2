import React, { useState } from 'react';
import { useSelector, shallowEqual } from 'react-redux';

import EmptyState from '../../components/EmptyState';
import PageNumbers from '../../components/PageNumbers';
import Loader from '../../components/Loader';

import { RootState } from '../../types/store';

const Pagination = ({ list, ListComponent, listComponentProps, componentListName, emptyState, emptyStateTitle }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const isLoading = useSelector((rootState: RootState) => rootState.app.isLoading, shallowEqual);
    const isEmpty = !list || list.length === 0;
    const processedList = list.filter(e => e).sort((a, b) => b.timestamp - a.timestamp);
    const itemsCount = 5;
    const pageCount = Math.ceil(processedList.length / itemsCount);
    const firstNumber = (currentPage - 1) * itemsCount;
    const lastNumber = Math.min(currentPage * itemsCount, processedList.length);
    const listSlice = processedList.slice(firstNumber, lastNumber);

    const componentProps = {
        ...listComponentProps,
        [componentListName]: listSlice
    };

    return (
        <>
            {isEmpty && <EmptyState imageSrc={emptyState} title={emptyStateTitle} description={null} />}
            {!isEmpty && (
                <>
                    <ListComponent {...componentProps} />
                    {pageCount > 1 && (
                        <PageNumbers
                            currentPage={currentPage}
                            totalNumber={list.length}
                            firstNumber={firstNumber}
                            lastNumber={lastNumber}
                            onClick={value => setCurrentPage(value)}
                        />
                    )}
                    {isLoading && <Loader />}
                </>
            )}
        </>
    );
};

export default Pagination;
