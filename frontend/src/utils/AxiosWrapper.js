import axios from "axios";
import { baseApiURL } from "../baseUrl";
const axiosWrapper = axios.create({
  baseURL: baseApiURL(),
});

axiosWrapper.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message;
    if (
      message === "Invalid or expired token" ||
      message === "Session invalidated. Please log in again."
    ) {
      localStorage.clear();
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default axiosWrapper;
