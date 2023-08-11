import moment from "moment";
import { useEffect, useState } from "react";
import { ENDPOINT } from "../../util/Constant";
import { get, getFile } from "../../util/HttpRequest";
import "./InvoiceManagement.style.css";
import JSZip, { loadAsync } from "jszip";
import { useNavigate } from "react-router";

type Invoice = {
  index?: number;
  nbmst: string;
  khhdon: number;
  shdon: number;
  khmshdon: number;
};

type InvoiceData = {
  datas?: any[];
  total?: number;
  state?: string;
};

export default function InvoiceManagementComponent() {
  const navigate = useNavigate();
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({});
  const [downloadResult, setDownloadResult] = useState<any>({});
  const [hasAnyDownloadFail, setHasAnyDownloadFail] = useState<boolean>(false);
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

  useEffect(() => {
    fetchAllInvoice([], undefined, 0);
  }, []);

  const downloadFile = (fileContent: any, filename: string) => {
    const blob = new Blob([fileContent], { type: "application/zip" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fetchAllInvoice = async (
    invoiceList: any[],
    state: string | undefined,
    page: number // page start from 0
  ) => {
    const res = await fetchInvoiceData(state);
    const {
      datas: dataRes,
      state: stateRes,
      total: totalRes,
    } = res.data as InvoiceData;
    const dataResMapIndex = dataRes?.map((data, index) => ({
      ...data,
      index: page * 50 + index + 1,
    }));
    invoiceList.push(...(dataResMapIndex || []));
    if (stateRes) {
      fetchAllInvoice(invoiceList, stateRes, page + 1);
    } else {
      setInvoiceData({
        datas: [...invoiceList],
        total: totalRes,
      });
    }
  };

  const downloadAllFileInAllPages = () => {
    downloadAllFile(invoiceData.datas || []);
  };

  const downloadAllFile = (invoiceList: Invoice[]) => {
    setDownloadResult({});
    const zipFile = new JSZip();
    const promiseList = invoiceList.map((invoice: any) => {
      return getFile(ENDPOINT.EXPORT_INVOICE_API, {
        nbmst: invoice.nbmst,
        khhdon: invoice.khhdon,
        shdon: invoice.shdon,
        khmshdon: invoice.khmshdon,
      })
        .then((res) => {
          return {
            [`${invoice.khhdon}-${invoice.shdon}`]: true,
            fileData: res.data,
            invoice,
          };
        })
        .catch((err) => {
          setHasAnyDownloadFail(true);
          return { [`${invoice.khhdon}-${invoice.shdon}`]: false };
        });
    });
    Promise.all(promiseList).then((res) => {
      // handle download result and set to state
      let downloadResultRes = {};
      const fileDataList: any[] = [];
      res.forEach(({ fileData, invoice, ...others }) => {
        if (fileData) fileDataList.push({ fileData, invoice });
        downloadResultRes = { ...downloadResultRes, others };
      });
      const finalDownloadResult = { ...downloadResult, ...downloadResultRes };
      const failList = Object.values(finalDownloadResult).filter(
        (result) => !result
      );
      if (failList.length === 0) {
        setHasAnyDownloadFail(false);
      }
      setDownloadResult(finalDownloadResult);
      // download all file
      downloadBase64File(fileDataList);
    });
  };

  const downloadBase64File = (base64FileList: any[]) => {
    const zipFile = new JSZip();
    const base64FilePromise = base64FileList.map(({ fileData, invoice }) =>
      loadAsync(fileData, { base64: true }).then((invoiceFileContent) => {
        return Promise.resolve({ invoiceFileContent, invoice });
      })
    );
    Promise.all(base64FilePromise).then((res) => {
      const hasInvoiceXml: { content: JSZip; invoice: any }[] = [];
      const noInvoiceXml: { content: JSZip; invoice: any }[] = [];
      res.forEach(({ invoiceFileContent, invoice }) => {
        if (invoiceFileContent.files["invoice.xml"]) {
          hasInvoiceXml.push({ content: invoiceFileContent, invoice });
        } else {
          noInvoiceXml.push({ content: invoiceFileContent, invoice });
        }
      });
      const base64FileHasXmlPromise = hasInvoiceXml.map(
        ({ content, invoice }) =>
          content.files["invoice.xml"].async("base64").then((fileXmlRes) => {
            return Promise.resolve({ content: fileXmlRes, invoice });
          })
      );
      Promise.all(base64FileHasXmlPromise).then((xmlResList) => {
        xmlResList.forEach((element) => {
          zipFile.file(
            `${element.invoice?.index}-${element.invoice?.khhdon}-${element.invoice?.shdon}.xml`,
            element.content,
            {
              base64: true,
            }
          );
        });
        zipFile.generateAsync({ type: "blob" }).then(function (content) {
          downloadFile(content, "all-invoice.zip");
        });
      });
    });
  };

  const downloadAllFailed = () => {
    const downloadFailInvoiceList = invoiceData.datas?.filter(
      (invoice) =>
        downloadResult[`${invoice.khhdon}-${invoice.shdon}`] === false
    );
    downloadAllFile(downloadFailInvoiceList || []);
  };

  const onChangeFromDate = (e: any) => {
    setFromDate(e.target.value);
  };

  const onChangeToDate = (e: any) => {
    setToDate(e.target.value);
  };

  const handleSearch = () => {
    setDownloadResult({});
    setHasAnyDownloadFail(false);
    setInvoiceData({});
    fetchAllInvoice([], undefined, 0);
  };

  const onRadioButtonChange = (e: any) => {
    setTtxly(e.target.value);
  };

  const onDownloadSingleFile = (invoice: Invoice) => {
    downloadAllFile([invoice]);
  };

  return (
    <>
      <div className="control-pane">
        <button
          className="download-file"
          type="button"
          onClick={() => downloadAllFileInAllPages()}
        >
          Tải Tất Cả Hóa Đơn
        </button>
        {hasAnyDownloadFail && (
          <div>
            <button
              className="download-file"
              type="button"
              onClick={() => downloadAllFailed()}
            >
              Tải Lại Hóa Đơn Lỗi
            </button>
          </div>
        )}
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
            className="red"
            type="button"
            onClick={() => {
              localStorage.clear();
              navigate("/login");
            }}
          >
            Đăng Xuất
          </button>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>STT</th>
            <th>MST người bán</th>
            <th>Người bán</th>
            <th>Ký Hiệu Hóa Đơn</th>
            <th>Số hóa đơn</th>
            <th>Ký Hiệu Mẫu Số</th>
            <th>Ngày Lập</th>
            <th>Kết Quả Tải</th>
          </tr>
        </thead>
        <tbody>
          {(invoiceData.datas || []).map((invoice: any, index) => (
            <tr key={`${invoice.khhdon}-${invoice.shdon}`}>
              {/* <td>{index + 1 + currentPage * 50}</td> */}
              <td>{index + 1}</td>
              <td>{invoice.nbmst}</td>
              <td>{invoice.nbten}</td>
              <td>{invoice.khhdon}</td>
              <td>{invoice.shdon}</td>
              <td>{invoice.khmshdon}</td>
              <td>{new Date(invoice.tdlap).toDateString()}</td>
              <td
                className={`${
                  (downloadResult[`${invoice.khhdon}-${invoice.shdon}`] ===
                    true &&
                    "success") ||
                  (downloadResult[`${invoice.khhdon}-${invoice.shdon}`] ===
                    false &&
                    "fail") ||
                  (downloadResult[`${invoice.khhdon}-${invoice.shdon}`] ==
                    undefined &&
                    "")
                }`}
              >
                {downloadResult[`${invoice.khhdon}-${invoice.shdon}`] ===
                true ? (
                  "Thành Công"
                ) : downloadResult[`${invoice.khhdon}-${invoice.shdon}`] ===
                  false ? (
                  <button onClick={() => onDownloadSingleFile(invoice)}>
                    Tải Lại
                  </button>
                ) : (
                  ""
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
