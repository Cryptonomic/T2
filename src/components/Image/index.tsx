import React, { FunctionComponent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ImageProps } from './types';
import { ImageStyled, ImageContainer, ImageLoader, ImageFailed, FailedIcon, FailedMessage } from './style';

/**
 * The Image component supports the 'onLoad' and 'onError' states.
 * The component renders the loader while the image is being loaded
 * and renders the Failed message on error.
 *
 * @param {string} src - the img src.
 * @param {string} alt - the img alt property.
 * @param {JSX.Element | React.ReactNode} [ImageFailedBox] - the custom component displayed on error.
 * @param {() => void} [onLoad] - on image load.
 * @param {() => void} [onError] - on video fail.
 *
 * @example
 * <ImageStyled src={image} alt={title} ImageFailedBox={
 *   <ImageFailedBox
 *     provider={'Hic et nunc'}
 *      url={'https://google.com'}
 *   />
 * } />
 */
const Image: FunctionComponent<ImageProps> = ({ src, alt, type, className, ImageFailedBox, onError, onLoad }) => {
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

    return (
        <ImageContainer className={className}>
            <ImageLoader className="loader" visible={!loaded && !failed} />
            <ImageStyled src={src} alt={alt} onLoad={onElementLoad} onError={onElementError} hidden={!loaded || failed} />
            {failed && ImageFailedBox ? ImageFailedBox : null}
            {failed && !ImageFailedBox ? (
                <ImageFailed>
                    <FailedIcon />
                    <FailedMessage>{t('components.image.errors.file_cannot_load')}</FailedMessage>
                </ImageFailed>
            ) : null}
        </ImageContainer>
    );
};

export default Image;
export { ImageProps };
