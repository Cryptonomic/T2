import React, { useState } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { goBack as goBackToWallet } from 'react-router-redux';
import { withTranslation, WithTranslation } from 'react-i18next';

import BackCaret from '@material-ui/icons/KeyboardArrowLeft';
import AddCircle from '@material-ui/icons/AddCircle';
import Check from '@material-ui/icons/Check';

import { H2 } from '../../components/Heading/';
import AddNodeModal from '../../components/AddNodeModal';
import AddPathModal from '../../components/AddPathModal';
import CustomSelect from '../../components/CustomSelect/';
import LanguageSelector from '../../components/LanguageSelector';
// import { getNodeUrl } from '../../utils/settings';

// import {
//   syncWallet,
//   goHomeAndClearState
// } from '../../reduxContent/wallet/thunks';
import {
  removePathThunk,
  removeNodeThunk,
  changeLocaleThunk,
  changePathThunk,
  changeNodeThunk,
  addNodeThunk,
  addPathThunk
} from '../../reduxContent/settings/thunks';

import {
  Container,
  BackToWallet,
  Content,
  Content6,
  ContentTitle,
  RowForParts,
  Part,
  SelectOption,
  OptionStatus,
  OptionLabel,
  NodeName,
  NodeUrl,
  NodeUrlSpan,
  ItemWrapper,
  SelectRenderWrapper,
  RemoveIconWrapper,
  RemoveIcon
} from './style';
import { RootState } from '../../types/store';
import { Node, Path } from '../../types/general';
import { ms } from '../../styles/helpers';

interface OwnProps {
  selectedNode: string;
  nodesList: Node[];
  selectedPath: string;
  pathsList: Path[];
  locale: string;
  // syncWallet: () => void,
  // setSelected: () => void,
  changePath: (label: string) => void;
  removeNode: (name: string) => void;
  removePath: (label: string) => void;
  // goBack: () => void,
  changeLocale: (locale: string) => void;
  changeNode: (name: string) => void;
  addNode: (node: Node) => void;
  addPath: (path: Path) => void;
  // goHomeAndClearState: () => void
}

type Props = OwnProps & WithTranslation;

function SettingsPage(props: Props) {
  const {
    t,
    locale,
    changePath,
    removeNode,
    removePath,
    changeLocale,
    addNode,
    addPath,
    changeNode,
    pathsList,
    selectedNode,
    selectedPath,
    nodesList
  } = props;
  const [isNodeModalOpen, setIsNodeModalOpen] = useState(false);
  const [isPathModalOpen, setIsPathModalOpen] = useState(false);
  const [isPathChanged, setIsPathChanged] = useState('');

  async function onRemovePath(event, label) {
    event.stopPropagation();
    await removePath(label);
    if (label === selectedPath) {
      if (pathsList.length > 2) {
        const parser = JSON.parse(localStorage.settings);
        const listLength = parser.pathsList.length;
        const labelToAdd = parser.pathsList[listLength - 1].label;
        await changePath(labelToAdd);
      } else {
        await changePath('Default');
      }
    }
  }

  async function onRemoveNode(event, name) {
    event.stopPropagation();
    // const localStorageSettings = JSON.parse(localStorage.settings);
    // if (conseilNodeToRemove) {
    //   await removeNode(name);
    //   if (name === localStorageSettings.conseilSelectedNode) {
    //     await this.handleConseilChange('Cryptonomic-Conseil');
    //   }
    // }
  }

  function getPath() {
    let path = '';
    const foundPath = pathsList.find(item => item.label === selectedPath);
    if (foundPath) {
      path = foundPath.derivation;
    }
    return path;
  }

  function renderNodes() {
    return nodesList.map((node, index) => {
      const isSelected = selectedNode === node.displayName;
      const option = (
        <SelectOption>
          <OptionStatus>
            {isSelected && (
              <Check
                style={{
                  fill: 'red', // theme.colors.blue1,
                  height: ms(1.5),
                  width: ms(1.5)
                }}
              />
            )}
          </OptionStatus>
          <OptionLabel isActive={isSelected}>
            <NodeName>{name}</NodeName>
          </OptionLabel>
        </SelectOption>
      );
      return (
        <ItemWrapper key={index} value={node.displayName}>
          {option}
          {index > 0 && (
            <RemoveIconWrapper onClick={event => onRemoveNode(event, name)}>
              <RemoveIcon />
            </RemoveIconWrapper>
          )}
        </ItemWrapper>
      );
    });
  }

  function renderPaths() {
    return pathsList.map((path, index) => {
      const isSelected = selectedPath === path.label;
      const option = (
        <SelectOption>
          {isSelected && (
            <OptionStatus>
              <Check
                style={{
                  fill: 'red', // theme.colors.blue1,
                  height: ms(1.5),
                  width: ms(1.5)
                }}
              />
            </OptionStatus>
          )}
          <OptionLabel isActive={isSelected}>
            <NodeName>{path.label}</NodeName>
            <NodeUrl>{path.derivation}</NodeUrl>{' '}
          </OptionLabel>
        </SelectOption>
      );
      return (
        <ItemWrapper key={index} value={path.label}>
          {option}
          {path.label !== 'Default' && (
            <RemoveIconWrapper onClick={event => onRemovePath(event, path.label)}>
              <RemoveIcon />
            </RemoveIconWrapper>
          )}
        </ItemWrapper>
      );
    });
  }

  return (
    <Container>
      <BackToWallet
        onClick={() => {
          if (isPathChanged) {
            // goHomeAndClearState();
          } else {
            // goBack();
            // syncWallet();
          }
        }}
      >
        <BackCaret
          style={{
            fill: '#4486f0',
            height: '28px',
            width: '28px',
            marginRight: '5px',
            marginLeft: '-9px'
          }}
        />
        <span>
          {isPathChanged
            ? t('containers.homeSettings.back_to_login')
            : t('containers.homeSettings.back_to_wallet')}
        </span>
      </BackToWallet>
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
              onChange={event => {
                const newValue = event.target.value;
                if (newValue !== 'add-more') {
                  changeNode(newValue);
                } else {
                  setIsNodeModalOpen(true);
                }
              }}
              // renderValue={value => {
              //   const url = getNodeUrl(conseilNodes, value);
              //   return (
              //     <SelectRenderWrapper>
              //       <span>{value} </span>
              //       <NodeUrlSpan>({url})</NodeUrlSpan>
              //     </SelectRenderWrapper>
              //   );
              // }}
            >
              {renderNodes()}
              <ItemWrapper value="add-more">
                <AddCircle
                  style={{
                    fill: '#7B91C0',
                    height: ms(1),
                    width: ms(1),
                    marginRight: '10px'
                  }}
                />
                {t('containers.homeSettings.add_custom_node')}
              </ItemWrapper>
            </CustomSelect>
          </Part>
        </RowForParts>
      </Content>

      <AddNodeModal
        isOpen={isNodeModalOpen}
        onAdd={newNode => addNode(newNode)}
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
              onChange={event => {
                const newValue = event.target.value;
                if (newValue === 'add-more') {
                  setIsPathModalOpen(true);
                  return true;
                }
                if (newValue !== selectedPath) {
                  // this.onChangedDerivationPath();
                  // this.handlePathChange(newValue);
                  return true;
                }
                return true;
              }}
              renderValue={value => {
                const path = getPath();
                return (
                  <SelectRenderWrapper>
                    <span>{value} </span>
                    <NodeUrlSpan>({path})</NodeUrlSpan>
                  </SelectRenderWrapper>
                );
              }}
            >
              {renderPaths()}
              <ItemWrapper value="add-more">
                <AddCircle
                  style={{
                    fill: '#7B91C0',
                    height: ms(1),
                    width: ms(1),
                    marginRight: '10px'
                  }}
                />
                {t('containers.homeSettings.add_derivation_path')}
              </ItemWrapper>
            </CustomSelect>
          </Part>
        </RowForParts>
      </Content6>

      <AddPathModal
        isOpen={isPathModalOpen}
        onClose={() => setIsPathModalOpen(false)}
        onAdd={newPath => addPath(newPath)}
      />
    </Container>
  );
}

const mapStateToProps = (state: RootState) => ({
  selectedNode: state.settings.selectedNode,
  nodesList: state.settings.nodesList,
  selectedPath: state.settings.selectedPath,
  pathsList: state.settings.pathsList,
  locale: state.settings.locale
});

const mapDispatchToProps = dispatch => ({
  changeLocale: (locale: string) => dispatch(changeLocaleThunk(locale)),
  changePath: (label: string) => dispatch(changePathThunk(label)),
  changeNode: (name: string) => dispatch(changeNodeThunk(name)),
  removePath: (label: string) => dispatch(removePathThunk(label)),
  removeNode: (name: string) => dispatch(removeNodeThunk(name)),
  addNode: (node: Node) => dispatch(addNodeThunk(node)),
  addPath: (path: Path) => dispatch(addPathThunk(path))
});

export default compose(
  withTranslation(),
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(SettingsPage) as React.ComponentType<any>;
