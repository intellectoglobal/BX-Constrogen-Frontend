import React from 'react';
import { Routes, Route, Navigate, useRouteError } from "react-router-dom";

// import "@fontsource/roboto"
// import theme from '@igblsln/themes';

// import "primereact/resources/themes/fluent-light/theme.css";  //theme
import "primereact/resources/primereact.min.css";                  //core css
import "primeicons/primeicons.css";                                //icons
import 'primeflex/primeflex.css';

import './App.scss';
import { NoMatch, ToastProvider } from '@igblsln/control';
import routes from './routes';
import Login from './pages/Login';
import PrivateOutlet from './controls/PrivateOutlet';
import Register from './pages/Register';

export function RootErrorBoundary() {
  let error = useRouteError() as Error;
  return (
    <div>
      <h1>Uh oh, something went terribly wrong 😩</h1>
      <pre>{error.message || JSON.stringify(error)}</pre>
      <button onClick={() => (window.location.href = "/")}>
        Click here to reload the app
      </button>
    </div>
  );
}

function App() {
  return (
    <div className="App">
      <ToastProvider>
        <Routes>
          <Route path="/" element={<PrivateOutlet />} errorElement={<RootErrorBoundary />} >
            <Route path="" element={<Navigate to="dashboard" replace />} />
            {routes.map((mod, i) => <Route key={i} path={`${mod.name}/*`} element={<mod.Component />} />)}
            <Route path="*" element={<NoMatch />} />
          </Route>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Routes>
      </ToastProvider>
    </div>
  );
}

export default App;
