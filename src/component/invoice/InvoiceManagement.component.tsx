import moment from "moment";
import { useEffect, useState } from "react";
import { ENDPOINT } from "../../util/Constant";
import { Get, GetFile } from "../../util/HttpRequest";
import "./InvoiceManagement.style.css";
import JSZip, { loadAsync } from "jszip";
import { useNavigate } from "react-router";
import { downloadFile } from "../../util/AppUtils";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { Moment } from "moment";
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
  const MAX_DATE_RANGE_DAYS = 30; // Maximum allowed days between from-date and to-date
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({});
  const [downloadResult, setDownloadResult] = useState<any>({});
  const [hasAnyDownloadFail, setHasAnyDownloadFail] = useState<boolean>(false);
  const [fromDate, setFromDate] = useState<Moment>(
    moment().subtract(30, "days")
  );
  const [toDate, setToDate] = useState<Moment>(moment());
  const [ttxly, setTtxly] = useState<number>(5);
  const [taxCode, setTaxCode] = useState<string>("");
  const [inprogressDownloadNumber, setInprogressDownloadNumber] = useState(0);
  const [isOpendownloadProgressDialog, setIsOpendownloadProgressDialog] =
    useState(false);
  const [hasDownloadDetail, setHasDownloadDetail] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const fetchInvoiceData = (state: string | undefined) => {
    const taxCodeFilter = taxCode && taxCode.trim() ? `;nbmst==${taxCode}` : '';
    return Get(
      ttxly == 8
        ? ENDPOINT.INVOICE_TAX.MTT_INVOICE_LIST_API
        : ENDPOINT.INVOICE_TAX.INVOICE_LIST_API,
      {
        sort: "tdlap:desc,khmshdon:asc,shdon:desc",
        size: 50,
        search: `tdlap=ge=${fromDate.format(
          "DD/MM/yyyy"
        )}T00:00:00;tdlap=le=${toDate.format(
          "DD/MM/yyyy"
        )}T23:59:59${taxCodeFilter};ttxly==${ttxly}`,
        state,
      }
    );
  };

  useEffect(() => {
    setIsLoadingData(true);
    fetchAllInvoice([], undefined, 0);
  }, []);

  const fetchAllInvoice = async (
    invoiceList: any[],
    state: string | undefined,
    page: number // page start from 0
  ) => {
    try {
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
        setIsLoadingData(false);
      }
    } catch {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    fetchAllInvoice([], undefined, 0);
  }, []);

  const downloadAllFileInAllPages = () => {
    downloadAllFile(invoiceData.datas || []);
    setHasDownloadDetail(true);
    setIsOpendownloadProgressDialog(true);
  };

  const downloadAllFile = async (invoiceList: Invoice[]) => {
    setDownloadResult({});
    const fileDataList: any[] = [];
    let downloadResultRes = { ...downloadResult };
    let i = 0;
    for (const invoice of invoiceList) {
      try {
        const res = await GetFile(
          ttxly == 8
            ? ENDPOINT.INVOICE_TAX.MTT_EXPORT_INVOICE_API
            : ENDPOINT.INVOICE_TAX.EXPORT_INVOICE_API,
          {
            nbmst: invoice.nbmst,
            khhdon: invoice.khhdon,
            shdon: invoice.shdon,
            khmshdon: invoice.khmshdon,
          }
        );
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
          downloadFile(content, "all-invoice.zip", "application/zip");
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

  const onChangeFromDate = (newValue: Moment | null) => {
    if (newValue) {
      setFromDate(newValue);
      // If the current toDate is more than MAX_DATE_RANGE_DAYS from the new fromDate, adjust it
      if (toDate.diff(newValue, 'days') > MAX_DATE_RANGE_DAYS) {
        setToDate(newValue.clone().add(MAX_DATE_RANGE_DAYS, 'days'));
      }
    }
  };

  const onChangeToDate = (newValue: Moment | null) => {
    if (newValue) {
      setToDate(newValue);
    }
  };

  // Function to check if a date should be disabled in the to-date picker
  const shouldDisableToDate = (date: Moment) => {
    // Disable dates that are more than MAX_DATE_RANGE_DAYS after the from date
    return date.diff(fromDate, 'days') > MAX_DATE_RANGE_DAYS;
  };

  const handleSearch = () => {
    setIsLoadingData(true);
    setDownloadResult({});
    setHasAnyDownloadFail(false);
    setInvoiceData({});
    fetchAllInvoice([], undefined, 0);
    setInprogressDownloadNumber(0);
    setHasAnyDownloadFail(false);
    setHasDownloadDetail(false);
  };

  const onSelectChange = (e: SelectChangeEvent<number>) => {
    setTtxly(Number(e.target.value));
  };

  const onTaxCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTaxCode(e.target.value);
  };

  const onDownloadSingleFile = (invoice: Invoice) => {
    downloadAllFile([invoice]);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <div className="control-pane">
        <div className="date-section">
          <DatePicker
            label="Từ Ngày"
            value={fromDate}
            onChange={onChangeFromDate}
            format="DD/MM/YYYY"
          />
          <span className="date-separator">-</span>
          <DatePicker
            label="Tới Ngày"
            value={toDate}
            onChange={onChangeToDate}
            format="DD/MM/YYYY"
            shouldDisableDate={shouldDisableToDate}
            minDate={fromDate}
            maxDate={fromDate.clone().add(MAX_DATE_RANGE_DAYS, 'days')}
          />
        </div>
        <div className="select-section">
          <FormControl fullWidth>
            <InputLabel id="ttxly-label">Loại hóa đơn</InputLabel>
            <Select
              labelId="ttxly-label"
              id="ttxly"
              name="ttxly"
              value={ttxly}
              label="Loại hóa đơn"
              onChange={onSelectChange}
            >
              <MenuItem value={5}>Có Mã</MenuItem>
              <MenuItem value={6}>Không Mã</MenuItem>
              <MenuItem value={8}>Máy Tính Tiền</MenuItem>
            </Select>
          </FormControl>
        </div>
        <div className="tax-code-section">
          <TextField
            label="MST người bán"
            value={taxCode}
            onChange={onTaxCodeChange}
            variant="outlined"
            size="medium"
            fullWidth
          />
        </div>
      </div>
      <div className="actions-download-container">
        <div className="download-section">
          <button
            type="button"
            onClick={() => downloadAllFileInAllPages()}
          >
            Tải Tất Cả Hóa Đơn
          </button>
          {hasDownloadDetail && (
            <button
              type="button"
              onClick={() => setIsOpendownloadProgressDialog(true)}
            >
              Xem chi tiết kết quả tải về
            </button>
          )}
        </div>
        <div className="action-section">
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
            <tr key={`${invoice.index}-${invoice.khhdon}-${invoice.shdon}`}>
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
    </LocalizationProvider>
  );
}
