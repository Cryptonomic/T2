import * as React from 'react';

require('./Counter.scss');

export interface Props {
    value: number;

    setDefaultSetting: () => any;
    incrementValue: () => any;
    decrementValue: () => any;
}

class Counter extends React.Component<Props> {
    componentWillMount() {
        const { setDefaultSetting } = this.props;
        setDefaultSetting();
    }

    public render() {
        const { value, incrementValue, decrementValue } = this.props;

        return (
            <div className="counter">
                <p id="counter-value">Current value: {value}</p>
                <p>
                    <button id="increment" onClick={incrementValue}>
                        Increment
                    </button>
                    <button id="decrement" onClick={decrementValue}>
                        Decrement
                    </button>
                </p>
            </div>
        );
    }
}

export default Counter;
