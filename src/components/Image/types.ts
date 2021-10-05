import React from 'react';

export interface ImageProps {
    className?: string;
    src?: string;
    alt?: string;
    type?: string;
    ImageFailedBox?: React.ReactElement | JSX.Element;
    onLoad?: () => void;
    onError?: () => void;
}
