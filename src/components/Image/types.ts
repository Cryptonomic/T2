import React from 'react';

export interface ImageProps {
    className?: string;
    src: string;
    alt: string;
    ImageFailedBox?: React.ReactElement | JSX.Element;
}
