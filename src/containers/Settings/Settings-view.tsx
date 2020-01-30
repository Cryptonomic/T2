import React from 'react';

import BackButton from '../../components/BackButton';
import { H2 } from '../../components/Heading';
import AddNodeModal from '../../components/AddNodeModal';
import AddPathModal from '../../components/AddPathModal';
import CustomSelect from '../../components/CustomSelect';
import LanguageSelector from '../../components/LanguageSelector';
import SettingsMenuItem from './SettingsMenuItem-view';
import SettingsCustomSelectItem from './SettingsCustomSelectItem-view';

import {
  Container,
  BackButtonContainer,
  Content,
  Content6,
  ContentTitle,
  RowForParts,
  Part,
  ItemWrapper,
  AddIcon
} from './Settings-styles';

import { SettingsViewProps } from './Settings-types';

const SettingsView = (props: SettingsViewProps) => {
  const {
    t,
    backTitle,
    locale,
    pathName,
    changeLocale,
    selectedNode,
    selectedPath,
    isNodeModalOpen,
    isPathModalOpen,
    setIsNodeModalOpen,
    setIsPathModalOpen,
    pathsList,
    nodesList,
    onRemovePath,
    onRemoveNode,
    onAddPath,
    onAddNode,
    onClickBackButton,
    onChangeCustomSelectNodes,
    onChangeCustomSelectDerivationPath
  } = props;

  return (
    <Container>
      <BackButtonContainer>
        <BackButton label={backTitle} onClick={onClickBackButton} />
      </BackButtonContainer>
      <H2>{t('containers.homeSettings.general_settings')}</H2>

      <Content6>
        <ContentTitle>{t('containers.homeSettings.select_display_language')}</ContentTitle>
        <RowForParts>
          <Part>
            <LanguageSelector locale={locale} changeLocale={changeLocale} />
          </Part>
        </RowForParts>
      </Content6>

      <Content>
        <ContentTitle>{t('containers.homeSettings.choose_different_node')}</ContentTitle>
        <RowForParts>
          <Part>
            <CustomSelect
              label="Nodes"
              value={selectedNode}
              onChange={onChangeCustomSelectNodes}
              renderValue={value => <SettingsCustomSelectItem value={value} />}
            >
              {nodesList.map(({ displayName }, index: number) => (
                <ItemWrapper key={displayName} value={displayName}>
                  <SettingsMenuItem
                    index={index}
                    name={displayName}
                    selected={selectedNode}
                    onClick={onRemoveNode}
                  />
                </ItemWrapper>
              ))}
              <ItemWrapper value="add-more">
                <AddIcon />
                {t('containers.homeSettings.add_custom_node')}
              </ItemWrapper>
            </CustomSelect>
          </Part>
        </RowForParts>
      </Content>

      <AddNodeModal
        isOpen={isNodeModalOpen}
        onAdd={onAddNode}
        onClose={() => setIsNodeModalOpen(false)}
      />

      <H2 style={{ marginTop: '30px' }}>{t('containers.homeSettings.hardware_settings')}</H2>

      <Content6>
        <ContentTitle>{t('containers.homeSettings.choose_derivation_path')}</ContentTitle>
        <RowForParts>
          <Part>
            <CustomSelect
              label="Derivation Path"
              value={selectedPath}
              onChange={onChangeCustomSelectDerivationPath}
              renderValue={value => <SettingsCustomSelectItem value={value} url={pathName} />}
            >
              {pathsList.map(({ label, derivation }, index: number) => (
                <ItemWrapper key={label} value={label}>
                  <SettingsMenuItem
                    index={index}
                    name={label}
                    url={derivation}
                    selected={selectedPath}
                    onClick={onRemovePath}
                  />
                </ItemWrapper>
              ))}
              <ItemWrapper value="add-more">
                <AddIcon />
                {t('containers.homeSettings.add_derivation_path')}
              </ItemWrapper>
            </CustomSelect>
          </Part>
        </RowForParts>
      </Content6>

      <AddPathModal
        isOpen={isPathModalOpen}
        onClose={() => setIsPathModalOpen(false)}
        onAdd={onAddPath}
      />
    </Container>
  );
};

export default SettingsView;
