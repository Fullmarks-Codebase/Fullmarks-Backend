import axios from "axios";
const token = localStorage.getItem("token");
const axiosForAdmin = axios.create({
  baseURL: process.env.REACT_APP_NODE_URL,
  withCredentials: true,
  headers: {
    Authorization: `${token}`,
  },
});

export { axiosForAdmin };
