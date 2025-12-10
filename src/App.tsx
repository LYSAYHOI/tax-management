import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import InvoiceManagementComponent from "./component/invoice/InvoiceManagement.component";
import LoginComponent from "./component/login/Login.component";
import AppBarComponent from "./component/general-component/appbar/AppBar.component";
import ExcelInvoiceMergeComponent from "./component/invoicefilemerge/ExcelInvoiceMerge.component";
import InvoiceFileListComponent from "./component/invoicefilelist/InvoiceFileList.component";
import InvoiceDetailComponent from "./component/invoiceextract/InvoiceDetail.component";
import SidebarComponent from "./component/general-component/sidebar/Sidebar.component";
import { Box, Toolbar } from "@mui/material";

export default function App() {
  const checkAccessToken = () => {
    return localStorage.getItem("at") !== "";
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBarComponent></AppBarComponent>
      <SidebarComponent></SidebarComponent>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Routes>
          <Route path="/" element={<Navigate to="/login" />}></Route>
          <Route path="/login" element={<LoginComponent />}></Route>
          <Route
            path="/invoice-management"
            element={
              checkAccessToken() ? (
                <InvoiceManagementComponent />
              ) : (
                <Navigate to="/login" />
              )
            }
          ></Route>
          <Route
            path="/invoices-excel-merge"
            element={<ExcelInvoiceMergeComponent />}
          ></Route>
          <Route
            path="/invoices-list"
            element={<InvoiceFileListComponent />}
          ></Route>
          <Route path="/detail" element={<InvoiceDetailComponent />}></Route>
        </Routes>
      </Box>
    </Box>
  );
}
