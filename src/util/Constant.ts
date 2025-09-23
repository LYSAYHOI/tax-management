const ENDPOINT_VERSION = {
  V1: "/api",
  V2: "/api-v2",
}
const ENDPOINT = {
  INVOICE_TAX: {
    INVOICE_LIST_API: ENDPOINT_VERSION.V1 + "/query/invoices/purchase",
    MTT_INVOICE_LIST_API: ENDPOINT_VERSION.V1 + "/sco-query/invoices/purchase",
    EXPORT_INVOICE_API: ENDPOINT_VERSION.V1 + "/query/invoices/export-xml",
    MTT_EXPORT_INVOICE_API: ENDPOINT_VERSION.V1 + "/sco-query/invoices/export-xml",
  }, 
  EXCEL_MERGE: {
    MERGE: "/excel-merge"
  },
  INVOICE: {
    MERGE_FILE: "/invoice/merge-list",
    DETAIL: ENDPOINT_VERSION.V2 +  "/invoice/extract-xml-data",
  }

};

export { ENDPOINT };
