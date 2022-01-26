import React from 'react';
import { useTranslation } from 'react-i18next';
import { BigNumber } from 'bignumber.js';
import CloseIcon from '@mui/icons-material/Close';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';

import { ActionsContainer, CloseButton, ModalHeader, StyledModalBox, TokensList, TokenItem, TokenItemHeader, TokenItemName, TokenItemActiveBadge, BadgeText, TokenDetailsContainer, DetailsCol, RightCol, TokenDetail, AmountsList, AmountItem } from './style';
import { TokensDetailsModalProps } from './types';

import AmountView from '../AmountView';
import Button from '../Button';
import TezosAddress from '../TezosAddress';

import { ModalWrapper } from '../../contracts/components/style';

import { Token } from '../../types/general';
import { openLink } from '../../utils/general';

function formatAmount(amount: number): string {
    return new BigNumber(amount)
        .dividedBy(10 ** 6)
        .toNumber()
        .toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 });
}

const TokenDetails = ({ token, onBrowseObjects }: { token: Token; onBrowseObjects?: (token: Token) => void }) => {
    const { t } = useTranslation();

    const renderStatusBadge = () => {
        if (token.details && 'paused' in token.details) {
            if (token.details.paused === false) {
                return (
                    <TokenItemActiveBadge>
                        <CheckRoundedIcon fontSize="inherit" />
                        <BadgeText>{t('components.tokensDetailsModal.status.active')}</BadgeText>
                    </TokenItemActiveBadge>
                );
            }
        }

        return <div />;
    };

    return (
        <TokenItem>
            <TokenItemHeader>
                <TokenItemName>{token.displayName}</TokenItemName>
                {token.helpLink && (
                    <div onClick={() => openLink(token.helpLink || '')} style={{ marginLeft: 5 }}>
                        {token.displayHelpLink}
                    </div>
                )}
                {renderStatusBadge()}
            </TokenItemHeader>
            <TokenDetailsContainer>
                <DetailsCol>
                    <TezosAddress address={token.address} text={token.address} weight={400} color="gray18" size="16px" shorten={true} />
                    {token && token.details && token.details.supply ? <TokenDetail>{t('components.tokensDetailsModal.tokenSupplyDetail', { counter: formatAmount(token.details.supply) })}</TokenDetail> : null}
                    {token && token.details && token.details.holders ? <TokenDetail>{t('components.tokensDetailsModal.tokenHoldersDetail', { counter: Number(token.details.holders) })}</TokenDetail> : null}
                    {token.balance && token.balance > 0 && onBrowseObjects ? (
                        <ActionsContainer>
                            <Button buttonTheme="secondary" small={true} onClick={() => onBrowseObjects(token)}>
                                Browse objects
                            </Button>
                        </ActionsContainer>
                    ) : null}
                </DetailsCol>
                <RightCol>
                    {token.balance && token.balance > 0 ? (
                        <AmountsList>
                            <AmountItem>
                                <AmountView color={token.balance && token.balance > 0 ? 'black3' : 'gray18'} size="20px" amount={token.balance} weight="normal" symbol={token.symbol} showTooltip={true} scale={token.scale} precision={token.precision} round={token.round} />
                            </AmountItem>
                        </AmountsList>
                    ) : null}
                </RightCol>
            </TokenDetailsContainer>
        </TokenItem>
    );
};

/**
 * Render the modal breaking down the collections data.
 *
 * @param {boolean} open - is modal open?
 * @param {() => void} onClose - close modal.
 * @param {Token[]} tokens - tokens config with details.
 * @param {(token: Token) => void} [onBrowseObjects] - on token click.
 */
export const TokensDetailsModal = ({ open, onClose, tokens, onBrowseObjects }: TokensDetailsModalProps) => {
    const { t } = useTranslation();

    /**
     * Sort tokens by balance and name
     */
    const sortedTokens = tokens.sort((a, b) => b.balance - a.balance || a.displayName.localeCompare(b.displayName));

    return (
        <ModalWrapper open={open} onClose={onClose} aria-labelledby="Tokens" aria-describedby="See more about tokens.">
            <StyledModalBox>
                <ModalHeader>{t('components.tokensDetailsModal.modalTitle')}</ModalHeader>
                <TokensList>
                    {sortedTokens.map((token, index) => (
                        <TokenDetails key={`token-item-${index}`} token={token} onBrowseObjects={onBrowseObjects} />
                    ))}
                </TokensList>
                <CloseButton onClick={onClose}>
                    <CloseIcon />
                </CloseButton>
            </StyledModalBox>
        </ModalWrapper>
    );
};
