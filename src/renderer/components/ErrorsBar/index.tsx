import React, { FunctionComponent, ReactElement, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import CloseIcon from '@mui/icons-material/Close';

import { ErrorsBar as Bar, ErrorsList, ErrorMessage, CloseButton } from './style';
import { ErrorsBarProps } from './types';

/**
 * Renders the bar containing the list of errors.
 * If the "errors" list is empty, it renders nothing.
 * If the "errors" list contains only one element, the plain message is rendered.
 * If the "errors" list contains more than one element, it renders the bullet list.
 *
 * If the "renderLimit" is set, the component renders only the first N errors
 * and adds the message that X more errors exist.
 *
 * @param {string[]} [errors] - the list of the errors.
 * The strings should be already translated if needed, because the component won't translate them by itself.
 * @param {number} [renderLimit] - the max number of errors rendered.
 *
 * @example
 * import { ErrorsBar } from './components/ErrorsBar';
 *
 * const errors = [
 *   t('components.someComponent.errorA'),
 *   t('components.someComponent.errorB'),
 *   t('components.someComponent.errorC', { someVar: someValue})
 * ];
 *
 * <ErrorsBar errors={errors} renderLimit={2} />
 */
export const ErrorsBar: FunctionComponent<ErrorsBarProps> = ({ errors, renderLimit, clearErrors }): ReactElement => {
    const { t } = useTranslation();

    if (!errors || errors.length === 0) {
        return <div />;
    }

    if (errors && errors.length === 1) {
        return (
            <Bar>
                <ErrorMessage>{errors[0]}</ErrorMessage>
            </Bar>
        );
    }

    let errorsToRender = errors;
    let moreErrorsCount = 0;

    if (renderLimit && errors.length > renderLimit) {
        errorsToRender = errors.slice(0, renderLimit);
        moreErrorsCount = errors.length - renderLimit;
    }

    return (
        <Bar>
            <ErrorsList>
                {errorsToRender.map((error, index) => (
                    <li key={`error-li-${index}`}>{error}</li>
                ))}
            </ErrorsList>
            {moreErrorsCount > 0 ? <ErrorMessage>{t('components.errorsBar.more_errors', { counter: moreErrorsCount })}</ErrorMessage> : null}
            <CloseButton onClick={clearErrors}>
                <CloseIcon fontSize="inherit" />
            </CloseButton>
        </Bar>
    );
};
