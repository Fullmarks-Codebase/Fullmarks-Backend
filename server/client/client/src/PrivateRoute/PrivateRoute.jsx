import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { authCheck } from "../utils/authCheck";

const PrivateRoute = ({component: Component, ...rest}) => {
    return (
        <Route {...rest} render={props => (
            authCheck() ?
                <Component {...props} />
            : <Redirect to="/" />
        )} />
    );
};

export default PrivateRoute;