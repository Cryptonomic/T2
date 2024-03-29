import _ from 'lodash';

function minLength(length, name) {
    return `${name} must be at least ${length} characters.`;
}

function hasLength(length, name) {
    return `${name} must be exactly ${length} characters.`;
}

/**
 *
 * @param value { string | string[] }
 * @param validateType { string }
 * @returns { false | string }
 */
const hasError = (value, validateType, name) => {
    switch (validateType) {
        case 'validAmount':
            if (!_.isFinite(value)) {
                return 'components.messageBar.messages.amount_not_valid';
            }
            break;
        case 'posNum':
            if (value < 0) {
                return 'components.messageBar.messages.amount_small';
            }
            break;
        case 'validAddress':
            if (value.length < 36) {
                return 'components.messageBar.messages.address_length_36';
            }

            if (!RegExp('^tz1|^tz2|^tz3|^KT1').test(value)) {
                return 'components.messageBar.messages.address_begin';
            }
            break;
        case 'notEmpty':
            if (!value) {
                return `components.messageBar.messages.${name}_not_empty`;
            }
            break;
        case 'locationFilled':
            if (!value.length) {
                return 'components.messageBar.messages.must_upload';
            }
            break;
        // case 'validJS':
        //   try {
        //       JSON.parse(fs.readFileSync(value));
        //   } catch (e) {
        //       return 'Corrupt .tezwallet file';
        //   }
        //   break;
        case 'minLength8':
            if (value.length < 8) {
                return 'components.messageBar.messages.pass_length_8';
            }
            break;
        case 'samePassPhrase':
            if (!(Array.isArray(value) && value.length === 2)) {
                return 'components.messageBar.messages.err_not_valid';
            }

            if (value[0] !== value[1]) {
                return `${name} must be equal.`;
            }
            break;
        default:
            return false;
    }
    return false;
};

export const displayError = (validations) => {
    for (const item of validations) {
        const error = hasError(item.value, item.type, item.name);
        if (error) {
            return error;
        }
    }
    return false;
};

export default hasError;
