import Cookies from "js-cookie";
export const authCheck = () => {
  const token = localStorage.getItem("token") || Cookies.get("token");
  if (token) {
    return true;
  } else {
    return false;
  }
};
