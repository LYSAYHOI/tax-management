import { ENDPOINT } from "../util/Constant"
import { GetFileWithFormData } from "../util/HttpRequest"

export const mergeFile = (files: File[]) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    return GetFileWithFormData(ENDPOINT.EXCEL_MERGE.MERGE, formData)
}