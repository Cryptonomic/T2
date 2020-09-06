import React, { Fragment, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import SeedInput from './SeedInput';
import { DescriptionContainer, ValidFormContainer } from './style';

interface Seed {
    dataSpectron?: number;
    index: number;
    value: string;
}

interface Props {
    dataSpectron?: string;
    seed: string;
    onValid: (isVal: boolean) => void;
}

function BackUpSeedPhrase(props: Props) {
    const { dataSpectron, seed, onValid } = props;
    const { t } = useTranslation();
    const [randomSeeds, setRandomSeeds] = useState<Seed[]>([]);
    const [validationStatus, setValidationStatus] = useState<boolean[]>([]);

    function checkValidation(index, status) {
        const localStatus = validationStatus;
        localStatus[index] = status;
        setValidationStatus(localStatus);
        onValid(localStatus.indexOf(false) > -1);
    }

    function generateRandomSeeds() {
        const seeds = seed.split(' ');
        const seedsArrObj = seeds.map((item, index) => ({ index, value: item }));
        const resultObj: Seed[] = [];
        for (let ii = 0; ii < 4; ii += 1) {
            const rndNum = Math.floor(Math.random() * (seeds.length - ii));
            resultObj.push(seedsArrObj[rndNum]);
            seedsArrObj.splice(rndNum, 1);
        }

        return resultObj;
    }

    useEffect(() => {
        setRandomSeeds(generateRandomSeeds());
        setValidationStatus([false, false, false, false]);
    }, [seed]);

    return (
        <Fragment>
            <DescriptionContainer>{t('components.createAccountSlide.descriptions.description3')}</DescriptionContainer>
            <ValidFormContainer data-spectron="valid-format-container-seed-input">
                {randomSeeds.map((item, index) => (
                    <SeedInput
                        key={index}
                        value={item.value}
                        index={item.index + 1}
                        onValidate={(val) => checkValidation(index, val)}
                        data-spectron="random-seeds"
                    />
                ))}
            </ValidFormContainer>
        </Fragment>
    );
}

export default BackUpSeedPhrase;
