import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import Counter from '../components/Counter';
import { RootState } from '../reduxContent';
import {
  WalletAction,
  setDefaultSetting,
  decrement,
  increment
} from '../reduxContent/wallet/actions';

const mapStateToProps = (state: RootState) => ({
  value: state.wallet.value
});

const mapDispatchToProps = (dispatch: Dispatch<WalletAction>) => ({
  setDefaultSetting: () => dispatch(setDefaultSetting()),
  incrementValue: () => dispatch(increment()),
  decrementValue: () => dispatch(decrement())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Counter);
