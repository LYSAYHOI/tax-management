import axios, { AxiosError } from "axios";

const instance = axios.create({
  // baseURL: `https://tax-management-proxy-service-sxxvb4l3sq-as.a.run.app/query/invoices`,
  // baseURL: `https://hoadondientu.gdt.gov.vn:30000/query/invoices`,
  // baseURL: `http://localhost:8080`,
  // baseURL: "https://tax-management-server-sxxvb4l3sq-as.a.run.app",
  baseURL: "http://51.79.173.142:30001",
  timeout: 1000 * 15,
});

const getAuthorizationHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("at")}`,
});

const handleUnauthorizationError = (err: AxiosError) => {
  if (err.response?.status === 401) {
    localStorage.clear();
    window.location.href = "/login";
  }
  return Promise.reject(err);
};

const Get = (url: string, params: any) => {
  return instance
    .get(url, { params, headers: { ...getAuthorizationHeader() } })
    .catch((err: AxiosError) => handleUnauthorizationError(err));
};

const GetFile = (url: string, params: any) => {
  return instance
    .get(url, {
      params,
      responseType: "arraybuffer",
      headers: { ...getAuthorizationHeader() },
    })
    .catch((err: AxiosError) => handleUnauthorizationError(err));
};

const GetFileWithFormData = (url: string, formData: FormData) => {
  return instance.post(url, formData, {
    responseType: "arraybuffer",
    headers: { "Content-Type": "blob" },
  });
};

const PostFileWithFormData = (url: string, formData: FormData) => {
  return instance
    .post(url, formData, {
      responseType: "arraybuffer",
      headers: {
        "Content-Type": "multipart/form-data",
        ...getAuthorizationHeader(),
      },
    })
    .catch((err: AxiosError) => {
      // Handle error responses that might be JSON instead of ArrayBuffer
      if (err.response?.data) {
        // Convert ArrayBuffer to string to check if it's JSON
        const decoder = new TextDecoder();
        const responseText = decoder.decode(err.response.data as ArrayBuffer);

        try {
          const jsonError = JSON.parse(responseText);
          // Modify the original error object instead of creating a new one
          err.response.data = jsonError;
          throw err;
        } catch {
          // If parsing fails, throw original error
          throw err;
        }
      }
      return handleUnauthorizationError(err);
    });
};

const GetFormData = (url: string, formData: FormData) => {
  return instance.get(url, {
    data: formData,
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export { Get, GetFile, GetFileWithFormData, PostFileWithFormData };
