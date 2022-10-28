import React, { FunctionComponent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ModerationMessageContainer, Message, MessageIcon, TopRow, StyledButton } from './style';
import { NFTMediaProps } from './types';

import Media from '../Media';

/**
 * Renders the Media (image, video), unless the `artifactModerationMessage` is not empty.
 * Then, it renders the message instead of media.
 *
 * @param {NFTMediaProps} props
 */
const NFTMedia: FunctionComponent<NFTMediaProps> = (props) => {
    const { t } = useTranslation();

    const { artifactModerationMessage } = props;

    const [showContent, setShowContent] = useState(false);

    if (artifactModerationMessage && artifactModerationMessage !== '' && !showContent) {
        return (
            <ModerationMessageContainer>
                <TopRow>
                    <MessageIcon />
                    <Message>{artifactModerationMessage}</Message>
                </TopRow>
                <StyledButton buttonTheme="secondary" onClick={() => setShowContent(true)}>
                    {t('general.verbs.show')}
                </StyledButton>
            </ModerationMessageContainer>
        );
    }

    return <Media {...props} />;
};

export default NFTMedia;
