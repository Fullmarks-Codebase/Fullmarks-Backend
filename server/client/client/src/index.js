import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "bootstrap/dist/css/bootstrap.min.css";
import "./assets/css/style.css";
import { Provider } from "react-redux";
import * as serviceWorker from "./serviceWorker";
import store from "./_redux/store/store";

require("popper.js/dist/popper.min");
require("jquery/dist/jquery.min");
require("jquery-ui-dist/jquery-ui.min.js");

require("bootstrap/dist/js/bootstrap.min");
require("jquery.nicescroll/dist/jquery.nicescroll.js");

require("./js/js/scripts");
require("./js/js/custom");

ReactDOM.render(
  <Provider store={store}>
    <BrowserRouter>
      <React.StrictMode>
        <App />
      </React.StrictMode>
    </BrowserRouter>
  </Provider>,
  document.getElementById("root")
);
serviceWorker.unregister();
