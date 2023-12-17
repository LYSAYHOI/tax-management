import axios, { AxiosError } from "axios";

const instance = axios.create({
  baseURL: `https://${window.location.host}/query/invoices`,
  // baseURL: `https://hoadondientu.gdt.gov.vn:30000/query/invoices`,
  // baseURL: "http://localhost:8080/query/invoices",
  timeout: 1000 * 5
});

const getAuthorizationHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("at")}`
})

const handleUnauthorizationError = (err: AxiosError) => {
  if (err.response?.status === 401) {
    localStorage.clear();
    window.location.href = "/login";
  }
  return Promise.reject(err);
}

const Get = (url: string, params: any) => {
  return instance.get(url, { params, headers: { ...getAuthorizationHeader() } }).catch((err: AxiosError) =>
    handleUnauthorizationError(err)
  );
};

const GetFile = (url: string, params: any) => {
  return instance.get(url, { params, responseType: "arraybuffer", headers: { ...getAuthorizationHeader() } }).catch((err: AxiosError) =>
    handleUnauthorizationError(err)
  );
};

export { Get, GetFile };
