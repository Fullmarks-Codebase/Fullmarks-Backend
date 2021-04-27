import React, { lazy, Suspense } from "react";
import { Switch, Route } from "react-router-dom";
import { Header, Sidebar } from "./components/admin";
import Dashboard from "./modules/Admin/Dashboard/Dashboard";
import {
  adminHandle,
  SubjectHandle,
  TopicHandle,
  UserHandle,
  QuestionHandle,
  MockQuestionHandle,
  MockMaster,
  ClassHandle,
  SetHandle,
  allPath,
} from "./modules/Admin";
import ForgotPassword from "./modules/Public/Components/ForgotPassword";
import Login from "./modules/Public/Components/Login";
import { useLocation } from "react-router-dom";
import PrivateRoute from "./PrivateRoute/PrivateRoute";
import NewPassword from "./modules/Public/Components/NewPassword";
import Loading from "./modules/Loading/Loading";
import NotFound from "./modules/NotFound/NotFound";
import Notification from "./modules/Admin/Notification/Notification";
import AddQuestionByExcel from "./modules/Admin/AddQuestionByExcel/AddQuestionByExcel";

function App() {
  let location = useLocation().pathname;
  let locationSplit = location.split("/");
  let locationParent = locationSplit[1];
  let WithoutRouter = ["auth", "error", "utilities", "", "Register"];

  return (
    <div className="App">
      <>
        {console.log(locationParent)}
        {allPath.includes(locationParent) ? (
          <>
            {!WithoutRouter.includes(locationParent) ? (
              <>
                <Sidebar />
                <Header />
              </>
            ) : (
              ""
            )}
            <Switch>
              <Route path="/" exact component={Login} />
              <Route path="/auth/forget-password" component={ForgotPassword} />
              <Route
                path="/auth/NewPassword/:token"
                exact
                component={NewPassword}
              />
              <PrivateRoute path="/Notification" component={Notification} />
              <PrivateRoute
                path="/AddQuestionByExcel"
                component={AddQuestionByExcel}
              />
              <PrivateRoute path="/dashboard" component={Dashboard} />
              {adminHandle.map((i) => (
                <PrivateRoute
                  key={i.path}
                  path={i.path}
                  exact
                  component={i.component}
                />
              ))}

              {SubjectHandle.map((i) => (
                <PrivateRoute
                  key={i.path}
                  path={i.path}
                  exact
                  component={i.component}
                />
              ))}

              {TopicHandle.map((i) => (
                <PrivateRoute
                  key={i.path}
                  path={i.path}
                  exact
                  component={i.component}
                />
              ))}

              {UserHandle.map((i) => (
                <PrivateRoute
                  key={i.path}
                  path={i.path}
                  exact
                  component={i.component}
                />
              ))}

              {QuestionHandle.map((i) => (
                <PrivateRoute
                  key={i.path}
                  path={i.path}
                  exact
                  component={i.component}
                />
              ))}

              {MockQuestionHandle.map((i) => (
                <PrivateRoute
                  key={i.path}
                  path={i.path}
                  exact
                  component={i.component}
                />
              ))}

              {MockMaster.map((i) => (
                <PrivateRoute
                  key={i.path}
                  component={i.component}
                  path={i.path}
                  exact
                />
              ))}

              {ClassHandle.map((i) => (
                <PrivateRoute
                  key={i.path}
                  component={() => {
                    const Class = i.component;
                    return i.mode ? <Class mode={i.mode} /> : <Class />;
                  }}
                  path={i.path}
                  exact
                />
              ))}

              {SetHandle.map((i) => (
                <PrivateRoute
                  key={i.path}
                  component={i.component}
                  path={i.path}
                  exact
                />
              ))}
              <PrivateRoute component={NotFound} />
            </Switch>
          </>
        ) : (
          <NotFound out={true} />
        )}
      </>
    </div>
  );
}

export default App;
