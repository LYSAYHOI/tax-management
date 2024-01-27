import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import InvoiceManagementComponent from "./component/invoice/InvoiceManagement.component";
import LoginComponent from "./component/login/Login.component";
import AppBarComponent from "./component/appbar/AppBar.component";
import ExcelInvoiceMergeComponent from "./component/invoicefilemerge/ExcelInvoiceMerge.component";

export default function App() {
  const checkAccessToken = () => {
    return localStorage.getItem("at") !== "";
  };

  return (
    <>
      <AppBarComponent></AppBarComponent>
      <div className="page-container">
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
        </Routes>
      </div>
    </>
  );
}
