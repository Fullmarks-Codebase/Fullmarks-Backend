const GET_USER_DETAILS = "GET_USER_DETAILS";
const SET_USER_DETAILS = "SET_USER_DETAILS";

export const getUserDetails = () => {
  return {
    type: GET_USER_DETAILS,
  };
};

export const setUserDetails = (payload) => {
  return {
    type: SET_USER_DETAILS,
    payload,
  };
};

export const actionName = {
  GET_USER_DETAILS,
  SET_USER_DETAILS,
};
