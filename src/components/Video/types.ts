import React from 'react';

export interface VideoProps {
    className?: string;
    src?: string;
    alt?: string;
    type: string;
    autoplay?: boolean;
    controls?: boolean;
    loop?: boolean;
    thumbnailUri?: string;
    VideoFailedBox?: React.ReactElement | JSX.Element;
    onLoad?: () => void;
    onError?: () => void;
}
