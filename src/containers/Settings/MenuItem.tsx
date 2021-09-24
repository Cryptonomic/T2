import React from 'react';
import Close from '@mui/icons-material/Close';

import { OptionLabel, NodeName, NodeUrl, RemoveIconBtn, CheckIcon } from './styles';

interface Props {
    isRemove: boolean;
    name: string;
    selected: string;
    url?: string;
    onClick: (event: React.MouseEvent, name: string) => void;
}

const SettingsMenuItem = (props: Props) => {
    const { isRemove, name, selected, url, onClick } = props;
    const itemSelected = selected === name;
    return (
        <>
            {itemSelected && <CheckIcon />}
            <OptionLabel isActive={itemSelected}>
                <NodeName>{name}</NodeName>
                {url && <NodeUrl>{url}</NodeUrl>}
            </OptionLabel>
            {isRemove && (
                <RemoveIconBtn aria-label="delete" onClick={(event) => onClick(event, name)}>
                    <Close />
                </RemoveIconBtn>
            )}
        </>
    );
};

export default SettingsMenuItem;
