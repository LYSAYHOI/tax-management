import axios from "axios";
import { useNavigate } from "react-router-dom";
import { RETRY_URL } from "../util/Constant";

const instance = axios.create({
  baseURL: "http://localhost:5000/query/invoices",
  headers: { Authorization: `Bearer ${localStorage.getItem("at")}` },
});

instance.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 403 && RETRY_URL.includes(err.config.url)) {
      console.log("download again ", err?.config);
      console.log(
        "download again ",
        `${err?.config.params.khhdon}-${err?.config.params.shdon}`
      );
      return instance.request(err?.config);
    } else if (err.response?.status === 401) {
      window.location.href = "/login";
      return;
    } else {
      return Promise.reject(err);
    }
  }
);

const get = (url: string, params: any) => {
  return instance.get(url, { params });
};

const getFile = (url: string, params: any) => {
  return instance.get(url, { params, responseType: "arraybuffer" });
};

export { get, getFile };
