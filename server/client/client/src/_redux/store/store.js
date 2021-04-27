import { userReducer } from "../reducers/user.reducer";
import { createStore } from "redux";

const store = createStore(userReducer);

export default store;
