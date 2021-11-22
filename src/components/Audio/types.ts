import React from 'react';

export interface AudioProps {
    className?: string;
    src?: string;
    alt?: string;
    type: string;
    autoplay?: boolean;
    controls?: boolean;
    loop?: boolean;
    thumbnailUri?: string;
    AudioFailedBox?: React.ReactElement | JSX.Element;
    onLoad?: () => void;
    onError?: () => void;
}
