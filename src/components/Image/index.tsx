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
 *
 * @example
 * <ImageStyled src={image} alt={title} ImageFailedBox={
 *   <ImageFailedBox
 *     provider={'Hic et nunc'}
 *      url={'https://google.com'}
 *   />
 * } />
 */
const Image: FunctionComponent<ImageProps> = ({ src, alt, className, ImageFailedBox }) => {
    const [loaded, setLoaded] = useState(false);
    const [failed, setFailed] = useState(false);

    const { t } = useTranslation();

    const onLoad = () => {
        setLoaded(true);
    };

    const onError = () => {
        setFailed(true);
    };

    return (
        <ImageContainer className={className}>
            <ImageLoader className="loader" visible={!loaded && !failed} />
            <ImageStyled src={src} alt={alt} onLoad={onLoad} onError={onError} hidden={!loaded || failed} />
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

export { Image, ImageProps };
