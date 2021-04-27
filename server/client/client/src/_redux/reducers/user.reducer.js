import { actionName } from "../actions/user.action";
import { axiosForAdmin } from "../../axiosconfig";

const initialState = {
  id: "",
  name: "",
};

const getUserFromServer = async () => {
  let token = localStorage.getItem("token");
  // return await axiosForAdmin.post("/users", { token });
  console.log("qweqwe");
};

export const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionName.SET_USER_DETAILS:
      const adminDetail = getUserFromServer();
      return {
        id: adminDetail.id,
        name: adminDetail.name,
        ...state,
      };
    case actionName.GET_USER_DETAILS:
      return state;
    default:
      return state;
  }
};
