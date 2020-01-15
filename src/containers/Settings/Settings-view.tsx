import React from 'react';

import BackButton from '../../components/BackButton';
import { H2 } from '../../components/Heading';
import AddNodeModal from '../../components/AddNodeModal';
import AddPathModal from '../../components/AddPathModal';
import CustomSelect from '../../components/CustomSelect';
import LanguageSelector from '../../components/LanguageSelector';

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

const SettingsView = props => {
  const {
    t,
    backTitle,
    locale,
    changeLocale,
    selectedNode,
    selectedPath,
    isNodeModalOpen,
    isPathModalOpen,
    setIsNodeModalOpen,
    setIsPathModalOpen,
    onAddPath,
    onAddNode,
    onClickBackButton,
    onChangeCustomSelectNodes,
    onChangeCustomSelectDerivationPath,
    renderCustomSelectDerivationPath,
    renderCustomSelectNodesValue,
    renderNodes,
    renderPaths
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
              renderValue={renderCustomSelectNodesValue}
            >
              {renderNodes()}
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
              renderValue={renderCustomSelectDerivationPath}
            >
              {renderPaths()}
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
