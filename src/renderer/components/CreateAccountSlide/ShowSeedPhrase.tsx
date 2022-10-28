import React, { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../CopyButton';

import {
  DescriptionContainer,
  IconContainer,
  RefreshButton,
  RefreshIconWrapper,
  SeedsContainer,
  SeedColume,
  SeedItem,
  SeedIndex
} from './style';

interface Props {
  seed: string;
  onUpdate: () => void;
}

function ShowSeedPhrase(props: Props) {
  const { seed, onUpdate } = props;
  const { t } = useTranslation();

  function setupSeedColumns() {
    const seedWords = seed.split(' ');
    const seedsTable: any[] = [];
    let seedColums: string[] = [];

    seedWords.forEach((item, index) => {
      seedColums.push(item);
      if ((index + 1) % 6 === 0) {
        seedsTable.push(seedColums);
        seedColums = [];
      }
    });

    return seedsTable;
  }
  const seeds = setupSeedColumns();
  const processedSeed = seed
    .split(' ')
    .map((item, index) => {
      return `${index + 1}. ${item}`;
    })
    .join(' ');
  return (
    <Fragment>
      <DescriptionContainer>
        {t('components.createAccountSlide.descriptions.description1')}
      </DescriptionContainer>
      <SeedsContainer>
        {seeds.map((items, index) => {
          return (
            <SeedColume key={index}>
              {items.map((item, index1) => (
                <SeedItem key={index1}>
                  <SeedIndex>{index * 6 + index1 + 1}</SeedIndex>
                  {item}
                </SeedItem>
              ))}
            </SeedColume>
          );
        })}
      </SeedsContainer>
      <IconContainer>
        <div>
          <CopyButton
            title={t('components.createAccountSlide.copy_seed')}
            text={processedSeed}
            color="#2c7df7"
          />
        </div>
        <div>
          <RefreshButton
            color="secondary"
            disableRipple={true}
            onClick={() => onUpdate()}
            startIcon={<RefreshIconWrapper />}
          >
            {t('components.createAccountSlide.generate_other_seed')}
          </RefreshButton>
        </div>
      </IconContainer>
    </Fragment>
  );
}

export default ShowSeedPhrase;
