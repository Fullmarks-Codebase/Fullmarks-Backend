import React, { useState } from "react";
import { axiosForAdmin } from "../axiosconfig";
import globalContext from "./globalContext";

const GlobalState = ({ children }) => {
  const [user, setUser] = useState({});
  const [userAccessModules, setUserAccessModules] = useState();
  const [allUserAccessModules, setAllUserAccessModules] = useState({});
  React.useEffect(() => {
    axiosForAdmin.get("/users/userAccessModules").then((response) => {
      if (response?.data) {
        setAllUserAccessModules(response.data);
      }
    });
    // esling-disable-next-line
  }, []);
  return (
    <globalContext.Provider
      value={{
        userAccessModules,
        setUserAccessModules,
        allUserAccessModules,
        user,
        setUser,
      }}
    >
      {children}
    </globalContext.Provider>
  );
};

export default GlobalState;
