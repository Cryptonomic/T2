import React, { useState } from 'react';
import styled from 'styled-components';
import { Document, Page } from 'react-pdf/dist/entry.webpack';
import 'react-pdf/dist/Page/AnnotationLayer.css';

import { ms } from '../../styles/helpers';

interface Props {
    pdfUrl: string;
}

const Container = styled.div`
    flex-grow: 1;
    padding: ${ms(5)} 0;
`;

function PdfReader(props: Props) {
    const { pdfUrl } = props;
    const [numPages, setNumPages] = useState(1);

    return (
        <Container>
            <Document file={pdfUrl} onLoadSuccess={doc => setNumPages(doc.numPages)}>
                {Array.from(new Array(numPages), (el, index) => (
                    <Page key={`page_${index + 1}`} pageNumber={index + 1} />
                ))}
            </Document>
        </Container>
    );
}

export default PdfReader;
