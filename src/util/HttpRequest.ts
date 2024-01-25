import axios from "axios";
import { RETRY_URL } from "../util/Constant";

const instance = axios.create({
  // baseURL: `https://tax-management-proxy-service-sxxvb4l3sq-as.a.run.app/query/invoices`,
  // baseURL: `https://hoadondientu.gdt.gov.vn:30000/query/invoices`,
  baseURL: "https://tax-management-server-sxxvb4l3sq-as.a.run.app/query",
  timeout: 1000 * 5
});

instance.interceptors.request.use(
  (config) => {
    document.getElementById("loader-span")?.classList.add("loader");
    config.headers.Authorization = `Bearer ${localStorage.getItem("at")}`;
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
