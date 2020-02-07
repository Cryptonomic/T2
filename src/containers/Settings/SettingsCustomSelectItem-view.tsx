import React from 'react';

import { SelectRenderWrapper, NodeUrlSpan } from './Settings-styles';

import { SettingsCustomSelectItemProps } from './Settings-types';

const SettingsCustomSelectItem = ({ value, url }: SettingsCustomSelectItemProps) => (
  <SelectRenderWrapper>
    <span>{value} </span>
    {url && <NodeUrlSpan>({url})</NodeUrlSpan>}
  </SelectRenderWrapper>
);

export default SettingsCustomSelectItem;
