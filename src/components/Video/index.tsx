import React, { FunctionComponent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { VideoProps } from './types';
import { VideoStyled, VideoContainer, VideoLoader, VideoFailed, FailedIcon, FailedMessage } from './style';

/**
 * The Video component supports the 'onLoad' and 'onError' states.
 * The component renders the loader while the video is being loaded
 * and renders the Failed message on error.
 *
 * @param {string} src - the img src.
 * @param {string} alt - the img alt property.
 * @param {JSX.Element | React.ReactNode} [VideoFailedBox] - the custom component displayed on error.
 * @param {() => void} [onLoad] - on video load.
 * @param {() => void} [onError] - on video fail.
 * @param {boolean} [autoplay] - autoplay the video.
 * @param {boolean} [controls] - show video controls.
 * @param {boolean} [loop] - loop the video.
 *
 * @example
 * <Video src={image} alt={title} VideoFailedBox={
 *   <VideoFailedBox
 *     provider={'Hic et nunc'}
 *     url={'https://google.com'}
 *   />
 * } />
 */
const Video: FunctionComponent<VideoProps> = ({ src, thumbnailUri, onLoad, onError, type, className, VideoFailedBox, controls, autoplay, loop }) => {
    const [loaded, setLoaded] = useState(false);
    const [failed, setFailed] = useState(false);

    const { t } = useTranslation();

    const onElementLoad = (_e) => {
        setLoaded(true);

        if (onLoad) {
            onLoad();
        }
    };

    const onElementError = (_e) => {
        setFailed(true);

        if (onError) {
            onError();
        }
    };

    const videoElementProps: {
        poster?: string;
        autoPlay?: boolean;
        controls?: boolean;
        loop?: boolean;
    } = {};

    if (thumbnailUri) videoElementProps.poster = thumbnailUri;
    if (autoplay) videoElementProps.autoPlay = autoplay;
    if (controls) videoElementProps.controls = controls;
    if (loop) videoElementProps.loop = loop;

    return (
        <VideoContainer className={className}>
            <VideoLoader className="loader" visible={!loaded && !failed} />
            <VideoStyled width="100%" onError={onElementError} onLoadStart={onElementLoad} {...videoElementProps} hidden={!loaded || failed}>
                <source src={src} type={type}/>
            </VideoStyled>
            {failed && VideoFailedBox ? VideoFailedBox : null}
            {failed && !VideoFailedBox ? (
                <VideoFailed>
                    <FailedIcon />
                    <FailedMessage>{t('components.image.errors.file_cannot_load')}</FailedMessage>
                </VideoFailed>
            ) : null}
        </VideoContainer>
    );
};

export default Video;
export { VideoProps };
