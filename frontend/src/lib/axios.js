import axios from "axios";

export const axiosInstance = axios.create({
  baseURL:
    import.meta.env.MODE == "production" ? "/" : "http://localhost:5000/",
  withCredentials: true,
});
