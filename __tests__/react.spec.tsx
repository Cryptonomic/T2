import React from 'react';
import { shallow } from 'enzyme';

import NodeStatus from '../src/components/NodesStatus';

describe('component', () => {
    it("renders correctly", () => {
        const tree = shallow(<NodeStatus message="aaa" />);
        expect(tree).toMatchSnapshot();
      });
  });
