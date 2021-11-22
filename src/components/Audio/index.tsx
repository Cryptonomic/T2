import React, { FunctionComponent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AudioProps } from './types';
import { AudioStyled, AudioContainer, AudioLoader, IconContainer, FailedIcon, FailedMessage, DefaultAudioIcon } from './style';

/**
 * The Audio component supports the 'onLoad' and 'onError' states.
 * The component renders the loader while the audio is being loaded
 * and renders the Failed message on error.
 *
 * @param {string} src - the img src.
 * @param {string} alt - the img alt property.
 * @param {JSX.Element | React.ReactNode} [AudioFailedBox] - the custom component displayed on error.
 * @param {() => void} [onLoad] - on video load.
 * @param {() => void} [onError] - on video fail.
 * @param {boolean} [autoplay] - autoplay the video.
 * @param {boolean} [controls] - show video controls.
 * @param {boolean} [loop] - loop the video.
 *
 * @example
 * <Audio src={image} alt={title} AudioFailedBox={
 *   <AudioFailedBox
 *     provider={'Hic et nunc'}
 *     url={'https://google.com'}
 *   />
 * } />
 */
const Audio: FunctionComponent<AudioProps> = ({ src, thumbnailUri, onLoad, onError, type, className, AudioFailedBox, controls, autoplay, loop }) => {
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

    const audioElementProps: {
        autoPlay?: boolean;
        controls?: boolean;
        loop?: boolean;
    } = {};

    if (autoplay) audioElementProps.autoPlay = autoplay;
    if (controls) audioElementProps.controls = controls;
    if (loop) audioElementProps.loop = loop;

    return (
        <AudioContainer className={className}>
            <AudioLoader className="loader" visible={!loaded && !failed} />
            <IconContainer>
                <DefaultAudioIcon />
            </IconContainer>{' '}
            {/*TODO: if thumbnailUri, show that instead */}
            <AudioStyled
                onError={onElementError}
                onLoadStart={onElementLoad}
                {...audioElementProps}
                hidden={!loaded || failed}
                controls={controls && loaded && !failed}
            >
                <source src={src} type={type} />
            </AudioStyled>
            {failed && AudioFailedBox ? AudioFailedBox : null}
            {failed && !AudioFailedBox ? (
                <IconContainer>
                    <FailedIcon />
                    <FailedMessage>{t('components.image.errors.file_cannot_load')}</FailedMessage>
                </IconContainer>
            ) : null}
        </AudioContainer>
    );
};

export default Audio;
export { AudioProps };
