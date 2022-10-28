import React, { FunctionComponent, ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import { NFT_ERRORS } from '../../constants';
import { NFTErrorsProps, NFTError } from '../../types';

import { ErrorsBar } from '../../../../components/ErrorsBar';

/**
 * Renders the bar containing the list of errors.
 * The component uses the error's "code" and "data" properties to evaluate
 * the error message from translations.
 *
 * @param {NFTError[] | null} [errors] - the list of the errors.
 *
 * @returns {ReactElement} returns <NFTErrors /> component
 *
 * @example
 * import { NFTErrors } from './components';
 *
 * const errors = [
 *  // Uses the "components.nftGallery.errors.something_went_wrong" translation
 *  {
 *    code: NFT_ERRORS.SOMETHING_WENT_WRONG
 *  },
 *
 *  // Uses the "components.nftGallery.errors.unsupported" translation:
 *  //   "The {{provider}} data format is invalid."
 *  // ...and inserts the "Hic et nunc" into the {{provider}}.
 *  {
 *    code: NFT_ERRORS.UNSUPPORTED_PROVIDER,
 *    data: [
 *      {
 *        key: 'provider',
 *        value: 'Hic et nunc'
 *      }
 *    ]
 *  },
 *
 * // If you want to translate also the variable, use "translate_value" field
 * // instead of "value":
 *  {
 *    code: NFT_ERRORS.UNSUPPORTED_DATA_FORMAT,
 *    data: [
 *      {
 *        key: 'field',
 *        translate_value: 'components.nftGallery.fields.artifactUrl'
 *      }
 *    ]
 *  }
 * ]
 *
 * <NFTErrors errors={errors} />
 */
export const NFTErrors: FunctionComponent<NFTErrorsProps> = ({ errors, clearErrors }): ReactElement => {
    const { t } = useTranslation();

    /**
     * Build the message inserting error's "data" fields into the translation.
     * @param {NFTError} error
     */
    const interpolateMessage = (error) => {
        if (error.data && error.data.length > 0) {
            const valuesMap = {};
            error.data.map((d) => {
                if (d.value) {
                    valuesMap[d.key] = d.value;
                } else if (d.translate_value) {
                    valuesMap[d.key] = t(d.translate_value);
                }
            });
            return t(`components.nftGallery.errors.${error.code.toLocaleLowerCase()}`, valuesMap);
        }
        return t(`components.nftGallery.errors.${error.code.toLocaleLowerCase()}`);
    };

    /**
     * Humanize the error message using the translations.
     * @param {NFTError} error
     */
    const errorMessage = (error: NFTError) => {
        switch (error.code.toUpperCase()) {
            case NFT_ERRORS.UNSUPPORTED_DATA_FORMAT:
            case NFT_ERRORS.UNSUPPORTED_PROVIDER:
                return interpolateMessage(error);
            default:
                return t(`components.nftGallery.errors.${error.code.toLocaleLowerCase()}`);
        }
    };

    return <ErrorsBar errors={errors ? errors?.map((e) => errorMessage(e)) : []} renderLimit={2} clearErrors={clearErrors} />;
};
