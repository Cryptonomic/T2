import Root from './containers/Root';
import { configureStore, history } from './store/configureStore';
import './utils/i18n';
import './styles/app.global.scss';

const store = configureStore();

export default function App() {
    return <Root store={store} history={history} />;
}
