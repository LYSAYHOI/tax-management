import axios, { AxiosError } from "axios";

// baseURL: `https://tax-management-proxy-service-sxxvb4l3sq-as.a.run.app/query/invoices`,
// baseURL: `https://hoadondientu.gdt.gov.vn:30000/query/invoices`,
// baseURL: "https://tax-management-server-sxxvb4l3sq-as.a.run.app",
const BASE_URL = "http://51.79.173.142:30001/api";

const instance = axios.create({
  baseURL: BASE_URL,
  timeout: 1000 * 15
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
const GetFileNew = (payload: any) => {
  return axios.post("http://localhost:8080/invoice-api/download-all", payload, { responseType: "arraybuffer", headers: { ...getAuthorizationHeader() } }).catch((err: AxiosError) =>
    handleUnauthorizationError(err)
  );
};

const GetFileWithFormData = (url: string, formData: FormData) => {
  return instance.post(url, formData, {responseType: "arraybuffer", headers: { "Content-Type": "blob" } });
}

const GetFormData = (url: string, formData: FormData) => {
  return instance.get(url, {data: formData,  headers: { "Content-Type": "multipart/form-data" }})
}

export { Get, GetFile, GetFileWithFormData, BASE_URL, GetFileNew };
