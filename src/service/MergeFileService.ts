import { ENDPOINT } from "../util/Constant"
import { GetFile, GetFileWithFormData, PostFileWithFormData } from "../util/HttpRequest"

export const mergeFile = (files: File[]) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    return GetFileWithFormData(ENDPOINT.EXCEL_MERGE.MERGE, formData)
}

export const downloadInvoiceMergedFileList = (month: number) => {
    return GetFile(ENDPOINT.INVOICE.MERGE_FILE, {month})
}

export const extractFile = (files: File[]) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    return PostFileWithFormData(ENDPOINT.INVOICE.DETAIL, formData)
}