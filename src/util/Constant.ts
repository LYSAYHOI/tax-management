const ENDPOINT = {
  INVOICE_TAX: {
    INVOICE_LIST_API: "/query/invoices/purchase",
    MTT_INVOICE_LIST_API: "/sco-query/invoices/purchase",
    EXPORT_INVOICE_API: "/query/invoices/export-xml",
    MTT_EXPORT_INVOICE_API: "/sco-query/invoices/export-xml",
  }, 
  EXCEL_MERGE: {
    MERGE: "/excel-merge"
  },
  INVOICE: {
    MERGE_FILE: "/invoice/merge-list",
    DETAIL: "/invoice/extract-xml-data",
  }

};

export { ENDPOINT };
