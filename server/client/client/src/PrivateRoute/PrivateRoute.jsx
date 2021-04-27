import React, { useContext } from "react";
import { Route, Redirect } from "react-router-dom";
import globalContext from "../context/globalContext";
import { authCheck } from "../utils/authCheck";
import { Data } from "../components/admin/sidebar/data";

const PrivateRoute = ({ component: Component, ...rest }) => {
  // eslint-disable-next-line
  const [module, setModule] = React.useState(
    Data.menus.find((item) => rest.path.includes(item.url))
  );

  const { user } = useContext(globalContext);

  if (
    user &&
    user.userAccessModules &&
    module &&
    !user.userAccessModules.includes(module.id)
  ) {
    return <Redirect to='/dashboard' />;
  }

  return (
    <Route
      {...rest}
      render={(props) =>
        authCheck() ? <Component {...props} /> : <Redirect to='/' />
      }
    />
  );
};

export default PrivateRoute;
