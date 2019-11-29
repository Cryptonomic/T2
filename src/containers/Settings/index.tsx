import React, { useState } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withTranslation, WithTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import Close from '@material-ui/icons/Close';

import BackButton from '../../components/BackButton';
import { H2 } from '../../components/Heading/';
import AddNodeModal from '../../components/AddNodeModal';
import AddPathModal from '../../components/AddPathModal';
import CustomSelect from '../../components/CustomSelect/';
import LanguageSelector from '../../components/LanguageSelector';

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
  BackButtonContainer,
  Content,
  Content6,
  ContentTitle,
  RowForParts,
  Part,
  OptionLabel,
  NodeName,
  NodeUrl,
  NodeUrlSpan,
  ItemWrapper,
  SelectRenderWrapper,
  RemoveIconBtn,
  AddIcon,
  CheckIcon
} from './style';
import { RootState } from '../../types/store';
import { Node, Path } from '../../types/general';

interface OwnProps {
  selectedNode: string;
  nodesList: Node[];
  selectedPath: string;
  pathsList: Path[];
  locale: string;
  changePath: (label: string) => void;
  removeNode: (name: string) => void;
  removePath: (label: string) => void;
  changeLocale: (locale: string) => void;
  changeNode: (name: string) => void;
  addNode: (node: Node) => void;
  addPath: (path: Path) => void;
}

type Props = OwnProps & WithTranslation;

function SettingsPage(props: Props) {
  const history = useHistory();
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
  const [isPathChanged, setIsPathChanged] = useState(false);

  function onRemovePath(event, label) {
    event.stopPropagation();
    if (label === selectedPath) {
      setIsPathChanged(true);
    }
    removePath(label);
  }

  function onRemoveNode(event, name) {
    event.stopPropagation();
    if (name === selectedNode) {
      setIsPathChanged(true);
    }
    removeNode(name);
  }

  function onAddNode(node: Node) {
    setIsPathChanged(true);
    addNode(node);
  }

  function onAddPath(path: Path) {
    setIsPathChanged(true);
    addPath(path);
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
      return (
        <ItemWrapper key={index} value={node.displayName}>
          {isSelected && <CheckIcon />}
          <OptionLabel isActive={isSelected}>
            <NodeName>{node.displayName}</NodeName>
          </OptionLabel>
          {index > 0 && (
            <RemoveIconBtn onClick={event => onRemoveNode(event, name)}>
              <Close />
            </RemoveIconBtn>
          )}
        </ItemWrapper>
      );
    });
  }

  function renderPaths() {
    return pathsList.map((path, index) => {
      const isSelected = selectedPath === path.label;
      return (
        <ItemWrapper key={index} value={path.label}>
          {isSelected && <CheckIcon />}
          <OptionLabel isActive={isSelected}>
            <NodeName>{path.label}</NodeName>
            <NodeUrl>{path.derivation}</NodeUrl>{' '}
          </OptionLabel>
          {path.label !== 'Default' && (
            <RemoveIconBtn aria-label="delete" onClick={event => onRemovePath(event, path.label)}>
              <Close />
            </RemoveIconBtn>
          )}
        </ItemWrapper>
      );
    });
  }

  const backTitle = isPathChanged
    ? t('containers.homeSettings.back_to_login')
    : t('containers.homeSettings.back_to_wallet');

  return (
    <Container>
      <BackButtonContainer>
        <BackButton
          label={backTitle}
          onClick={() => {
            history.goBack();
            // if (isPathChanged) {
            //   // goHomeAndClearState();
            // } else {
            //   // goBack();
            //   // syncWallet();
            // }
          }}
        />
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
              onChange={event => {
                const newValue = event.target.value;
                if (newValue === 'add-more') {
                  setIsNodeModalOpen(true);
                  return true;
                }
                if (newValue !== selectedPath) {
                  // todo syncwallet
                  setIsPathChanged(true);
                  changeNode(newValue);
                  return true;
                }
                return true;
              }}
              renderValue={value => (
                <SelectRenderWrapper>
                  <span>{value}</span>
                </SelectRenderWrapper>
              )}
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
        onAdd={newNode => onAddNode(newNode)}
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
                  setIsPathChanged(true);
                  changePath(newValue);
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
        onAdd={newPath => onAddPath(newPath)}
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
