import React, { Fragment, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import SeedInput from './SeedInput';

import { DescriptionContainer, ValidFormContainer } from './style';

interface Seed {
  index: number;
  value: string;
}

interface Props {
  seed: string;
  onValid: (isVal: boolean) => void;
}

function BackUpSeedPhrase(props: Props) {
  const { seed, onValid } = props;
  const { t } = useTranslation();
  const [randomSeeds, setRandomSeeds] = useState<Seed[]>([]);

  const validationStatus = [false, false, false, false];

  function checkValidation(index, status) {
    validationStatus[index] = status;
    const isNotValid = validationStatus.indexOf(false) > -1;
    onValid(isNotValid);
  }

  function generateRndNum(num) {
    return Math.floor(Math.random() * num);
  }

  function generateRandomSeeds() {
    const seeds = seed.split(' ');
    const seedsArrObj = seeds.map((item, index) => ({ index, value: item }));
    const resultObj: Seed[] = [];
    for (let ii = 0; ii < 4; ii += 1) {
      const rndNum = generateRndNum(seeds.length - ii);
      resultObj.push(seedsArrObj[rndNum]);
      seedsArrObj.splice(rndNum, 1);
    }
    return resultObj;
  }

  useEffect(() => {
    setRandomSeeds(generateRandomSeeds());
  }, [seed]);

  return (
    <Fragment>
      <DescriptionContainer>
        {t('components.createAccountSlide.descriptions.description3')}
      </DescriptionContainer>
      <ValidFormContainer>
        {randomSeeds.map((item, index) => (
          <SeedInput
            key={index}
            value={item.value}
            index={item.index + 1}
            onValidate={val => checkValidation(index, val)}
          />
        ))}
      </ValidFormContainer>
    </Fragment>
  );
}

export default BackUpSeedPhrase;
