import axios, { AxiosError } from "axios";

const instance = axios.create({
  baseURL: `https://${window.location.host}/query/invoices`,
  // baseURL: `https://hoadondientu.gdt.gov.vn:30000/query/invoices`,
  // baseURL: "http://localhost:8080/query/invoices",
  headers: {
    Authorization: `Bearer ${localStorage.getItem("at")}`
  }
});

const handleUnauthorizationError = (err: AxiosError) => {
  if (err.status === 401) {
    localStorage.clear();
    window.location.href = "/login";
  }
  return Promise.reject(err);
}

const get = (url: string, params: any) => {
  return instance.get(url, { params }).catch((err: AxiosError) =>
    handleUnauthorizationError(err)
  );
};

const getFile = (url: string, params: any) => {
  return instance.get(url, { params, responseType: "arraybuffer" }).catch((err: AxiosError) =>
    handleUnauthorizationError(err)
  );
};

export { get, getFile };
