import moment from "moment";
import { useCallback, useEffect, useState } from "react";
import { ENDPOINT } from "../../util/Constant";
import { Get, GetFile } from "../../util/HttpRequest";
import JSZip, { loadAsync } from "jszip";
import { useNavigate } from "react-router";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { AxiosError } from "axios";
import "./InvoiceManagement.style.css";

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

enum InvoiceDownloadStatus {
  SUCCESS,
  FAIL,
  NO_INVOICE,
}

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
  const [inprogressDownloadNumber, setInprogressDownloadNumber] = useState(0);
  const [isOpendownloadProgressDialog, setIsOpendownloadProgressDialog] =
    useState(false);
  const [hasDownloadDetail, setHasDownloadDetail] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const fetchInvoiceData = useCallback(
    (state: string | undefined) => {
      const from = moment(fromDate, "yyyy-MM-DD");
      const to = moment(toDate, "yyyy-MM-DD");
      return Get(ENDPOINT.INVOICE_LIST_API, {
        sort: "tdlap:desc,khmshdon:asc,shdon:desc",
        size: 50,
        search: `tdlap=ge=${from.format(
          "DD/MM/yyyy"
        )}T00:00:00;tdlap=le=${to.format(
          "DD/MM/yyyy"
        )}T23:59:59;ttxly==${ttxly}`,
        state,
      });
    },
    [fromDate, toDate, ttxly]
  );

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

  const fetchAllInvoice = useCallback(
    async (
      invoiceList: any[],
      state: string | undefined,
      page: number // page start from 0
    ) => {
      try {
        setIsLoadingData(true);
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
      } catch {
      } finally {
        setIsLoadingData(false);
      }
    },
    [fetchInvoiceData]
  );

  useEffect(() => {
    fetchAllInvoice([], undefined, 0);
  }, [fetchAllInvoice]);

  const downloadAllFileInAllPages = () => {
    downloadAllFile(invoiceData.datas || []);
    setIsOpendownloadProgressDialog(true);
    setHasDownloadDetail(true);
  };

  const downloadAllFile = async (invoiceList: Invoice[]) => {
    setDownloadResult({});
    const fileDataList: any[] = [];
    let downloadResultRes = { ...downloadResult };
    let i = 0;
    for (const invoice of invoiceList) {
      try {
        const res = await GetFile(ENDPOINT.EXPORT_INVOICE_API, {
          nbmst: invoice.nbmst,
          khhdon: invoice.khhdon,
          shdon: invoice.shdon,
          khmshdon: invoice.khmshdon,
        });
        if (res.data) {
          fileDataList.push({ fileData: res.data, invoice });
          downloadResultRes = {
            ...downloadResultRes,
            [`${invoice.khhdon}-${invoice.shdon}`]:
              InvoiceDownloadStatus.SUCCESS,
          };
        }
      } catch (err) {
        const axiosErr = err as AxiosError;
        if (axiosErr.response?.status === 500) {
          downloadResultRes = {
            ...downloadResultRes,
            [`${invoice.khhdon}-${invoice.shdon}`]:
              InvoiceDownloadStatus.NO_INVOICE,
          };
        } else {
          setHasAnyDownloadFail(true);
          downloadResultRes = {
            ...downloadResultRes,
            [`${invoice.khhdon}-${invoice.shdon}`]: InvoiceDownloadStatus.FAIL,
          };
        }
      } finally {
        setDownloadResult(downloadResultRes);
        setInprogressDownloadNumber(i + 1);
        i++;
      }
    }
    // const finalDownloadResult = { ...downloadResult, ...downloadResultRes };
    const failList = Object.values(downloadResultRes).filter(
      (result) => !result
    );
    if (failList.length === 0) {
      setHasAnyDownloadFail(false);
    }
    // setDownloadResult(finalDownloadResult);
    // download all file
    downloadBase64File(fileDataList);
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
        downloadResult[`${invoice.khhdon}-${invoice.shdon}`] ===
        InvoiceDownloadStatus.FAIL
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
    setInprogressDownloadNumber(0);
    setHasAnyDownloadFail(false);
    setHasDownloadDetail(false);
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
        {hasDownloadDetail && (
          <div>
            <button
              className="download-file"
              type="button"
              onClick={() => setIsOpendownloadProgressDialog(true)}
            >
              Xem chi tiết kết quả tải về
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
                    InvoiceDownloadStatus.SUCCESS &&
                    "success") ||
                  (downloadResult[`${invoice.khhdon}-${invoice.shdon}`] ===
                    InvoiceDownloadStatus.FAIL &&
                    "fail") ||
                  (downloadResult[`${invoice.khhdon}-${invoice.shdon}`] ===
                    InvoiceDownloadStatus.NO_INVOICE &&
                    "")
                }`}
              >
                {downloadResult[`${invoice.khhdon}-${invoice.shdon}`] ===
                InvoiceDownloadStatus.SUCCESS ? (
                  "Thành Công"
                ) : downloadResult[`${invoice.khhdon}-${invoice.shdon}`] ===
                  InvoiceDownloadStatus.FAIL ? (
                  <Button
                    variant="outlined"
                    onClick={() => onDownloadSingleFile(invoice)}
                  >
                    Tải Lại
                  </Button>
                ) : downloadResult[`${invoice.khhdon}-${invoice.shdon}`] ===
                  InvoiceDownloadStatus.NO_INVOICE ? (
                  "Không hóa đơn"
                ) : (
                  ""
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {(invoiceData?.total == null || invoiceData?.total === 0) &&
        !isLoadingData && (
          <div className="no-invoice-text">Không tìm thấy hóa đơn nào</div>
        )}
      {isLoadingData && <CircularProgress className="loading-progress" />}
      <Dialog open={isOpendownloadProgressDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Thông tin tải về</DialogTitle>
        <DialogContent className="progress-style">
          <CircularProgress
            variant="determinate"
            value={
              invoiceData.total
                ? (inprogressDownloadNumber / invoiceData.total) * 100
                : 0
            }
          />
          <span>
            Tải thành công{" "}
            {
              Object.values(downloadResult).filter(
                (result) => result === InvoiceDownloadStatus.SUCCESS
              ).length
            }{" "}
            / {invoiceData.total || 0} files
          </span>
          <span>
            Tải lỗi{" "}
            {
              Object.values(downloadResult).filter(
                (result) => result === InvoiceDownloadStatus.FAIL
              ).length
            }{" "}
            files
          </span>
          <span>
            Không có hóa đơn{" "}
            {
              Object.values(downloadResult).filter(
                (result) => result === InvoiceDownloadStatus.NO_INVOICE
              ).length
            }{" "}
            files
          </span>
        </DialogContent>
        <DialogActions>
          {hasAnyDownloadFail && (
            <Button
              color="error"
              variant="contained"
              onClick={downloadAllFailed}
            >
              Tải lại hóa đơn lỗi
            </Button>
          )}
          <Button onClick={() => setIsOpendownloadProgressDialog(false)}>
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
