import axios from "axios";
import { RETRY_URL } from "../util/Constant";

const instance = axios.create({
  baseURL: "https://hoadondientu.gdt.gov.vn:30000/query/invoices",
  headers: { Authorization: `Bearer ${localStorage.getItem("at")}` },
});

instance.interceptors.request.use(
  (config) => {
    document.getElementById("loader-span")?.classList.add("loader");
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (res) => {
    document.getElementById("loader-span")?.classList.remove("loader");
    return res;
  },
  (err) => {
    document.getElementById("loader-span")?.classList.remove("loader");
    if (err.response?.status === 403 && RETRY_URL.includes(err.config.url)) {
      return instance.request(err?.config);
    } else if (err.response?.status === 401) {
      window.location.href = "/login";
      localStorage.clear();
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
