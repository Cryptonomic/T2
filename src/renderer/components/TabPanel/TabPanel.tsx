import React from 'react';

import { TabPanelProps } from './types';

const TabPanel = ({ children, value, index, ...other }: TabPanelProps) => (
    <div role="tabpanel" hidden={value !== index} id={`nav-tabpanel-${index}`} aria-labelledby={`nav-tab-${index}`} {...other}>
        {value === index && children}
    </div>
);

export default TabPanel;
