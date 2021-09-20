import styled from 'styled-components';
import { lighten } from 'polished';
import Button from '../Button';
import { ms } from '../../styles/helpers';

import { TabMenuProps, TabProps, TabTextProps } from './types';

/**
 * The tab menu is a container for the tab items.
 *
 * @param {number} [count] - the number of items.
 *
 * It's recommended to combine the TabMenu with the TabPanel.
 * The TabMenu provides a clickable menu and the TabPanel is a container
 * for the content.
 *
 * @example
 * const [activeTab, setActiveTab] = useState(0)
 *
 * <TabMenu count={2}>
 *  <Tab
 *    isActve={activeTab === 0}
 *    ready={ready}
 *    key={'tab-item-0'}
 *    buttonTheme='plain'
 *    onClick={() => {
 *      if (ready) {
 *        setActiveTab(0);
 *      }
 *    }}
 *  >
 *    <TabText ready={ready}>Item 1</TabText>
 *  </Tab>
 *  <Tab
 *    isActve={activeTab === 1}
 *    ready={ready}
 *    key={'tab-item-1'}
 *    buttonTheme='plain'
 *    onClick={() => {
 *      if (ready) {
 *        setActiveTab(1);
 *      }
 *    }}
 *  >
 *    <TabText ready={ready}>Item 2</TabText>
 *  </Tab>
 * </TabMenu>
 *
 * <TabPanel isActive={activeTab === 0}></TabPanel>
 * <TabPanel isActive={activeTab === 1}></TabPanel>
 *
 */
export const TabMenu = styled.div<TabMenuProps>`
    background-color: ${({ theme: { colors } }) => colors.accent};
    display: grid;
    grid-template-columns: ${({ count }) => (count && count > 4 ? `repeat(${count}, 1fr)` : 'repeat(4, 1fr)')};
    grid-column-gap: 50px;
`;

/**
 * The tab menu item style.
 *
 * @param {boolean} [isActive] - make the item active.
 * @param {boolean} [ready] - is the interface ready.
 * @param {() => void} [onClick] - button click.
 * @param {'primary' | 'secondary' | 'plain'} [buttonTheme='primary'] - the theme prop inherited from the Button component.
 *
 * @example
 *  const [activeTab, setActiveTab] = useState(0)
 *
 *  <Tab
 *    isActve={activeTab === 0}
 *    ready={ready}
 *    key={'tab-item-0'}
 *    buttonTheme='plain'
 *    onClick={() => {
 *      if (ready) {
 *        setActiveTab(0);
 *      }
 *    }}
 *  >
 *    <TabText ready={ready}>Item 1</TabText>
 *  </Tab>
 *
 */
export const Tab = styled(Button)<TabProps>`
    background: ${({ isActive, theme: { colors } }) => (isActive !== false ? colors.white : colors.accent)};
    color: ${({ isActive, theme: { colors } }) => (isActive !== false ? colors.primary : lighten(0.4, colors.accent))};
    cursor: ${({ ready }) => (ready !== false ? 'pointer' : 'initial')};
    text-align: center;
    font-weight: 500;
    padding: ${ms(-1)} ${ms(1)};
    border-radius: 0;
`;

/**
 * The text of the tab menu item.
 *
 * @param {boolean} [ready] - is the interface ready.
 *
 * @example
 * <TabText ready={ready}>Item 1</TabText>
 */
export const TabText = styled.span<TabTextProps>`
    opacity: ${({ ready }) => (ready !== false ? '1' : '0.5')};
    cursor: ${({ ready }) => (ready !== false ? 'pointer' : 'initial')};
`;
