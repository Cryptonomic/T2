import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';

import BackButton from '../../components/BackButton';
import { H2 } from '../../components/Heading';
import AddNodeModal from '../../components/AddNodeModal';
import AddPathModal from '../../components/AddPathModal';
import CustomSelect from '../../components/CustomSelect';
import LanguageSelector from '../../components/LanguageSelector';

import CustomSelectItem from './CustomSelectItem';
import SettingsMenuItem from './MenuItem';

import { getMainPath, getInitWalletSettings } from '../../utils/settings';
import { Node, Path } from '../../types/general';

import { changeLocaleThunk, changeNodeThunk, addNodeThunk, removeNodeThunk, changePathThunk, addPathThunk, removePathThunk } from './duck/thunk';
import { goHomeAndClearState } from '../../reduxContent/wallet/thunks';
import { RootState, SettingsState } from '../../types/store';

import { name, version, LocalVersionIndex } from '../../config.json';

import { Container, BackButtonContainer, Content, Content6, ContentTitle, RowForParts, Part, ItemWrapper, AddIcon } from './styles';
const defaultNodeList = getInitWalletSettings().nodesList;

const SettingsContainer = () => {
    const history = useHistory();
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { locale, pathsList, selectedPath, selectedNode, nodesList } = useSelector<RootState, SettingsState>((state) => state.settings, shallowEqual);
    const [isNodeModalOpen, setIsNodeModalOpen] = useState(false);
    const [isPathModalOpen, setIsPathModalOpen] = useState(false);
    const [isPathChanged, setIsPathChanged] = useState(false);

    const onRemovePath = (event: React.MouseEvent, label: string) => {
        event.stopPropagation();
        if (label === selectedPath) {
            setIsPathChanged(true);
        }
        dispatch(removePathThunk(label));
    };

    const onRemoveNode = (event: React.MouseEvent, nodeName: string) => {
        event.stopPropagation();
        if (nodeName === selectedNode) {
            setIsPathChanged(true);
        }
        dispatch(removeNodeThunk(nodeName));
    };

    const onAddNode = (node: Node) => {
        setIsPathChanged(true);
        dispatch(addNodeThunk(node));
    };

    const onAddPath = (path: Path) => {
        setIsPathChanged(true);
        dispatch(addPathThunk(path));
    };

    const onClickBackButton = () => {
        if (isPathChanged) {
            dispatch(goHomeAndClearState());
        } else {
            history.goBack();
        }
    };

    const onChangeLocale = (newLocale: string) => {
        dispatch(changeLocaleThunk(newLocale));
    };

    const onChangeCustomSelectNodes = (event: React.ChangeEvent<{ value: string }>): boolean => {
        const newValue = event.target.value;
        if (newValue === 'add-more') {
            setIsNodeModalOpen(true);
            return true;
        }
        if (newValue !== selectedPath) {
            // todo syncwallet
            setIsPathChanged(true);
            dispatch(changeNodeThunk(newValue));
            return true;
        }
        return true;
    };

    const onChangeCustomSelectDerivationPath = (event: React.ChangeEvent<{ value: string }>): boolean => {
        const newValue = event.target.value;
        if (newValue === 'add-more') {
            setIsPathModalOpen(true);
            return true;
        }
        if (newValue !== selectedPath) {
            setIsPathChanged(true);
            dispatch(changePathThunk(newValue));
            return true;
        }
        return true;
    };

    const backTitle = isPathChanged ? t('containers.homeSettings.back_to_login') : t('containers.homeSettings.back_to_wallet');

    const pathName = getMainPath(pathsList, selectedPath);

    return (
        <Container>
            <BackButtonContainer>
                <BackButton label={backTitle} onClick={onClickBackButton} />
            </BackButtonContainer>

            <H2>{`${t('containers.homeSettings.general_settings')}, ${name} ${version} (${LocalVersionIndex})`}</H2>

            <Content6>
                <ContentTitle>{t('containers.homeSettings.select_display_language')}</ContentTitle>
                <RowForParts>
                    <Part>
                        <LanguageSelector locale={locale} changeLocale={onChangeLocale} />
                    </Part>
                </RowForParts>
            </Content6>

            <Content>
                <ContentTitle>{t('containers.homeSettings.choose_different_node')}</ContentTitle>
                <RowForParts>
                    <Part>
                        <CustomSelect label="Nodes" value={selectedNode} onChange={onChangeCustomSelectNodes} renderValue={(value) => <CustomSelectItem value={value} />}>
                            {nodesList.map(({ displayName, network }, index: number) => {
                                const foundIndexed = defaultNodeList.findIndex((node) => node.network === network);

                                return (
                                    <ItemWrapper key={displayName} value={displayName}>
                                        <SettingsMenuItem isRemove={foundIndexed < 0 && index > 0} name={displayName} selected={selectedNode} onClick={onRemoveNode} />
                                    </ItemWrapper>
                                );
                            })}
                            <ItemWrapper value="add-more">
                                <AddIcon />
                                {t('containers.homeSettings.add_custom_node')}
                            </ItemWrapper>
                        </CustomSelect>
                    </Part>
                </RowForParts>
            </Content>

            <AddNodeModal isOpen={isNodeModalOpen} onAdd={onAddNode} onClose={() => setIsNodeModalOpen(false)} />

            <H2 style={{ marginTop: '30px' }}>{t('containers.homeSettings.hardware_settings')}</H2>

            <Content6>
                <ContentTitle>{t('containers.homeSettings.choose_derivation_path')}</ContentTitle>
                <RowForParts>
                    <Part>
                        <CustomSelect label="Derivation Path" value={selectedPath} onChange={onChangeCustomSelectDerivationPath} renderValue={(value) => <CustomSelectItem value={value} url={pathName} />}>
                            {pathsList.map(({ label, derivation }, index: number) => (
                                <ItemWrapper key={label} value={label}>
                                    <SettingsMenuItem isRemove={index > 0} name={label} url={derivation} selected={selectedPath} onClick={onRemovePath} />
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

            <AddPathModal isOpen={isPathModalOpen} onClose={() => setIsPathModalOpen(false)} onAdd={onAddPath} />
        </Container>
    );
};

export default SettingsContainer;
