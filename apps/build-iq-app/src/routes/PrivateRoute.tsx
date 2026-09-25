import React from 'react'
import {
    Route,
    Navigate
} from 'react-router-dom';

type Props = {
    children: JSX.Element
    isAuthenticated: boolean;
}

const PrivateRoute = ({ children, isAuthenticated, ...rest }: Props) => {
    if (!isAuthenticated) {
        // Redirect them to the /login page, but save the current location they were
        // trying to go to when they were redirected. This allows us to send them
        // along to that page after they login, which is a nicer user experience
        // than dropping them off on the home page.
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
}

export default PrivateRoute;