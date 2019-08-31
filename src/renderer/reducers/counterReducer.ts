import { Reducer } from 'redux';
import { setData, getData } from '../../localData';
import { SETTING, DECREMENT, INCREMENT, CounterAction } from '../actions/counterActions';

export interface CounterState {
    value: number;
}

const defaultState: CounterState = {
    value: 0
};

export const counterReducer: Reducer<CounterState> = (
    state = defaultState,
    action: CounterAction
) => {
    switch (action.type) {
        case SETTING:
            const countNumber = getData('setting.number');
            return {
                ...state,
                value: Number(countNumber) || 0
            };
        case INCREMENT:
            setData({ setting: { number: state.value + 1 } });
            return {
                ...state,
                value: state.value + 1
            };
        case DECREMENT:
            setData({ setting: { number: state.value - 1 } });
            return {
                ...state,
                value: state.value - 1
            };
        default:
            return state;
    }
};
