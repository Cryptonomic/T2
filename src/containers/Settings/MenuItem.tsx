import React from 'react';
import Close from '@material-ui/icons/Close';

import { OptionLabel, NodeName, NodeUrl, RemoveIconBtn, CheckIcon } from './styles';

interface Props {
  index: number;
  name: string;
  selected: string;
  url?: string;
  onClick: (event: React.MouseEvent, name: string) => void;
}

const SettingsMenuItem = (props: Props) => {
  const { index, name, selected, url, onClick } = props;
  const itemSelected = selected === name;
  return (
    <>
      {itemSelected && <CheckIcon />}
      <OptionLabel isActive={itemSelected}>
        <NodeName>{name}</NodeName>
        {url && <NodeUrl>{url}</NodeUrl>}
      </OptionLabel>
      {index > 0 && (
        <RemoveIconBtn aria-label="delete" onClick={event => onClick(event, name)}>
          <Close />
        </RemoveIconBtn>
      )}
    </>
  );
};

export default SettingsMenuItem;
