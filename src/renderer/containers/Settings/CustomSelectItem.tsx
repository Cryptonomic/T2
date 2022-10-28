import React from 'react';
import { SelectRenderWrapper, NodeUrlSpan } from './styles';

interface Props {
  value: string;
  url?: string;
}

const SettingsCustomSelectItem = ({ value, url }: Props) => (
  <SelectRenderWrapper>
    <span>{value} </span>
    {url && <NodeUrlSpan>({url})</NodeUrlSpan>}
  </SelectRenderWrapper>
);

export default SettingsCustomSelectItem;
