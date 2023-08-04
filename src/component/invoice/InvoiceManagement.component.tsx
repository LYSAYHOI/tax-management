import { AxiosError, AxiosResponse } from "axios";
import moment from "moment";
import { useEffect, useState } from "react";
import { ENDPOINT } from "../../util/Constant";
import { get, getFile } from "../../util/HttpRequest";
import "./InvoiceManagement.style.css";

type Invoice = {
  nbmst: string;
  khhdon: number;
  shdon: number;
  khmshdon: number;
};

type InvoiceData = {
  datas?: [];
  total?: number;
  state?: string;
  time?: number;
};

export default function InvoiceManagementComponent() {
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({});
  const [stateList, setStateList] = useState<(string | undefined)[]>([
    undefined,
  ]);
  const [currentPage, setCurrentPage] = useState(0);
  const [fromDate, setFromDate] = useState(
    moment().subtract(1, "months").format("yyyy-MM-DD")
  );
  const [toDate, setToDate] = useState(moment().format("yyyy-MM-DD"));
  const [ttxly, setTtxly] = useState<number>(5);

  const fetchInvoiceData = (state: string | undefined) => {
    const from = moment(fromDate, "yyyy-MM-DD");
    const to = moment(toDate, "yyyy-MM-DD");
    return get(ENDPOINT.INVOICE_LIST_API, {
      sort: "tdlap:desc,khmshdon:asc,shdon:desc",
      size: 50,
      search: `tdlap=ge=${from.format(
        "DD/MM/yyyy"
      )}T00:00:00;tdlap=le=${to.format("DD/MM/yyyy")}T23:59:59;ttxly==${ttxly}`,
      state,
    });
  };

  const getInvoiceData = async (state: string | undefined) => {
    try {
      const invoiceListRes: AxiosResponse<InvoiceData> = await fetchInvoiceData(
        state
      );
      setInvoiceData(invoiceListRes.data);
      if (currentPage + 1 === stateList.length) {
        setStateList([...stateList, invoiceListRes.data.state]);
      }
    } catch (error) {
      const err = error as AxiosError<any>;
      if (err.response?.status === 500 || err.response?.status === 400) {
        alert(err?.response?.data?.message);
      }
    }
  };

  useEffect(() => {
    getInvoiceData(stateList[currentPage]);
  }, [currentPage, stateList]);

  const downloadFile = (fileContent: any, filename: string) => {
    const blob = new Blob([fileContent], { type: "application/zip" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAllFileInAllPages = async (state: string | undefined) => {
    const res = await fetchInvoiceData(state);
    const invoiceDataRes = res.data as InvoiceData;
    downloadAllFile(invoiceDataRes.datas || []);
    if (invoiceDataRes.state) {
      downloadAllFileInAllPages(invoiceDataRes.state);
    } else {
      return;
    }
  };

  const downloadAllFile = (invoiceList: Invoice[]) => {
    invoiceList.forEach((invoice: any) => {
      getFile(ENDPOINT.EXPORT_INVOICE_API, {
        nbmst: invoice.nbmst,
        khhdon: invoice.khhdon,
        shdon: invoice.shdon,
        khmshdon: invoice.khmshdon,
      }).then((res) => {
        downloadFile(res.data, `${invoice.khhdon}-${invoice.shdon}`);
      });
    });
  };

  const handleNextPage = () => {
    setCurrentPage(currentPage + 1);
  };
  const handlePrevPage = () => {
    const page = currentPage - 1;
    setCurrentPage(page);
  };

  const onChangeFromDate = (e: any) => {
    setFromDate(e.target.value);
  };

  const onChangeToDate = (e: any) => {
    setToDate(e.target.value);
  };

  const handleSearch = () => {
    setStateList([undefined]);
    setCurrentPage(0);
    getInvoiceData(undefined);
  };

  const onRadioButtonChange = (e: any) => {
    console.log(e.target.value);
    setTtxly(e.target.value);
  };

  return (
    <>
      <div className="control-pane">
        <button
          className="download-file"
          type="button"
          onClick={() => downloadAllFileInAllPages(undefined)}
        >
          Download all XML file
        </button>
        <div>
          <label htmlFor="from">Từ Ngày:</label>
          <input
            type="date"
            name="from"
            value={fromDate}
            onChange={onChangeFromDate}
          />
          <span className="no-wrap">{`     `}</span>
          <label htmlFor="to">Tới Ngày:</label>
          <input
            type="date"
            name="to"
            value={toDate}
            onChange={onChangeToDate}
          ></input>
        </div>
        <div onChange={onRadioButtonChange}>
          <input type="radio" id="coma" name="ttxly" value={5} defaultChecked />
          <label htmlFor="coma">Có Mã</label>
          <br />
          <input type="radio" id="koma" name="ttxly" value={6} />
          <label htmlFor="koma">Không Mã</label>
        </div>
        <div>
          <button className="brown" type="button" onClick={handleSearch}>
            Tìm Kiếm
          </button>
          <button
            type="button"
            onClick={handlePrevPage}
            disabled={currentPage === 0}
          >
            Prev
          </button>
          <span className="page">{currentPage + 1}</span>
          <button
            type="button"
            onClick={handleNextPage}
            disabled={!invoiceData.state}
          >
            Next
          </button>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>STT</th>
            <th>MST người bán</th>
            <th>Ký Hiệu Hóa Đơn</th>
            <th>Số hóa đơn</th>
            <th>Ký Hiệu Mẫu Số</th>
            <th>Ngày Lập</th>
          </tr>
        </thead>
        <tbody>
          {(invoiceData.datas || []).map((invoice: any, index) => (
            <tr key={`${invoice.khhdon}-${invoice.shdon}`}>
              <td>{index + 1 + currentPage * 50}</td>
              <td>{invoice.nbmst}</td>
              <td>{invoice.khhdon}</td>
              <td>{invoice.shdon}</td>
              <td>{invoice.khmshdon}</td>
              <td>{new Date(invoice.tdlap).toDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
