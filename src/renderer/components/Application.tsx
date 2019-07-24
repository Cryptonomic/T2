import { hot } from 'react-hot-loader/root';
import * as React from 'react';

import CounterContainer from '../containers/CounterContainer';

const Application = () => (
    <div>
        <CounterContainer />
    </div>
);

export default hot(Application);
