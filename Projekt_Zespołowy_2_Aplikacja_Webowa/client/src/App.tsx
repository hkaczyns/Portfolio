import { Provider } from "react-redux";
import { persistor, store } from "./store/store";
import { PersistGate } from "redux-persist/lib/integration/react";
import "./utils/i18n";
import { Router } from "./components/Router/Router";
import { AlertProvider } from "./components/Alert/AlertContext";
import { Alert } from "./components/Alert/Alert";

function App() {
    return (
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <AlertProvider>
                    <Router />
                    <Alert />
                </AlertProvider>
            </PersistGate>
        </Provider>
    );
}

export default App;
