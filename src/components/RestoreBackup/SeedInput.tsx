import React, { useState, Fragment } from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/lab/Autocomplete';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import Chip from '@mui/material/Chip';
import CloseIcon from '@mui/icons-material/Close';

import seedJson from './seed.json';

const ChipWrapper = styled(Chip)<{ isbad: number }>`
    &&& {
        font-size: 14px;
        border: solid 1px rgba(181, 197, 227, 0.35);
        height: 24px;
        font-weight: 300;
        .MuiChip-label {
            line-height: 20px;
        }
        background-color: ${({ theme: { colors }, isbad }) => (isbad ? '#f6d6d6' : colors.gray2)};
    }
`;

const IndexSpan = styled.span`
    color: ${({ theme: { colors } }) => colors.index0};
    font-size: 13px;
    margin-right: 4px;
`;

const TextfieldWrapper = styled(TextField)`
    &&& {
        &.MuiTextField-root {
            font-weight: 300;
        }
    }
`;

const ChipContent = ({ value, index }) => {
    return (
        <Fragment>
            <IndexSpan>{index + 1}</IndexSpan>
            {value}
        </Fragment>
    );
};

interface Props {
    seeds: string[];
    placeholder: string;
    onChange: (seeds: string[]) => void;
    onError: (isError: boolean) => void;
    expectedWords: number;
}

function SeedInput(props: Props) {
    const { seeds, placeholder, onChange, onError, expectedWords } = props;
    const { t } = useTranslation();
    const [error, setError] = useState('');
    const [badWords, setBadWords] = useState<string[]>([]);
    const [inputVal, setInputVal] = useState('');

    function seedPhraseConvert(seedStr: string): string[] {
        if (seedStr.indexOf('"') > -1 || seedStr.indexOf(',') > -1) {
            const words = seedStr.replace(/["\s]/g, '');
            const seedString = words.replace(/,/g, ' ');
            return seedString.split(/\s+/);
        }
        return seedStr.trim().split(/\s+/);
    }

    function onChangeInput(e, val) {
        const inputWords = seedPhraseConvert(val);
        const invalidWords = inputWords.filter((element) => seedJson.indexOf(element) === -1);

        if (inputWords.length > 1 && inputWords.length > invalidWords.length) {
            // paste multiple
            onChangeItems(null, [...seeds, ...inputWords.filter((w) => !w.match(/[0-9]{1,2}\./))]);
        }

        const matchingWords = seedJson.filter((w) => w.startsWith(inputWords[0]));
        if (inputWords.length === 1 && matchingWords.length === 1) {
            onChangeItems(null, [...seeds, matchingWords[0]]);
        }

        if (invalidWords.length > 0) {
            setBadWords([...badWords, ...invalidWords]); // paint bad words red
        }

        setInputVal(val);
    }

    function onChangeItems(e, items) {
        const newBadWords = badWords.filter((item) => items.indexOf(item) > -1);
        let newError = '';

        if (newBadWords.length > 0) {
            newError = t('containers.homeAddAddress.errors.invalid_words');
        } else if (![12, 15, 18, 21, 24].includes(items.length)) {
            if (expectedWords > 0) {
                newError = t(`containers.homeAddAddress.errors.invalid_length_${expectedWords}`);
            } else {
                newError = t('containers.homeAddAddress.errors.invalid_length');
            }
        } else {
            newError = '';
        }

        setBadWords([...newBadWords]);
        onChange(items);
        onError(!!newError);
        setError(newError);
    }

    return (
        <Autocomplete
            multiple={true}
            id="tags-standard"
            autoComplete={true}
            autoHighlight={true}
            options={seedJson}
            clearIcon=""
            popupIcon=""
            inputValue={inputVal}
            value={seeds}
            onInputChange={onChangeInput}
            onChange={onChangeItems}
            isOptionEqualToValue={() => false}
            filterOptions={(options, state) => {
                const { inputValue } = state;
                if (inputValue.length < 2) {
                    return [];
                }
                return options.filter((option) => {
                    return option.toLowerCase().startsWith(inputValue.toLowerCase());
                });
            }}
            renderTags={(value, getTagProps) =>
                value.map((option, index) => {
                    const isBad = badWords.indexOf(option) > -1 ? 1 : 0;
                    return (
                        <ChipWrapper
                            key={`ac-idx-${index}`}
                            variant="outlined"
                            color="primary"
                            size="small"
                            isbad={isBad}
                            label={<ChipContent value={option} index={index} />}
                            deleteIcon={<CloseIcon />}
                            {...getTagProps({ index })}
                        />
                    );
                })
            }
            renderInput={(params) => (
                <TextfieldWrapper
                    {...params}
                    variant="standard"
                    placeholder={placeholder}
                    margin="normal"
                    fullWidth={true}
                    error={!!error}
                    helperText={error}
                />
            )}
        />
    );
}

export default SeedInput;
