import { Button, ButtonGroup } from "@mui/material";
import "./InoviceFileList.style.css";
import { downloadInvoiceMergedFileList } from "../../service/MergeFileService";
import { useState } from "react";

export default function InvoiceFileListComponent() {
  const [selectedMonth, setSelectedMonth] = useState<number>(1);

  const downloadFile = (fileContent: any, filename: string) => {
    const blob = new Blob([fileContent]);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const selectMonth = (month: number) => {
    setSelectedMonth(month);
  };

  const downloadMergedFile = async () => {
    const file = await downloadInvoiceMergedFileList(selectedMonth);
    downloadFile(file.data, "mergedFile.xlsx");
  };

  return (
    <div className="container">
      <span className="month-span">Tháng</span>
      <ButtonGroup variant="outlined">
        <Button
          onClick={() => selectMonth(1)}
          variant={selectedMonth === 1 ? "contained" : "outlined"}
        >
          1
        </Button>
        <Button
          onClick={() => selectMonth(2)}
          variant={selectedMonth === 2 ? "contained" : "outlined"}
        >
          2
        </Button>
        <Button
          onClick={() => selectMonth(3)}
          variant={selectedMonth === 3 ? "contained" : "outlined"}
        >
          3
        </Button>
        <Button
          onClick={() => selectMonth(4)}
          variant={selectedMonth === 4 ? "contained" : "outlined"}
        >
          4
        </Button>
        <Button
          onClick={() => selectMonth(5)}
          variant={selectedMonth === 5 ? "contained" : "outlined"}
        >
          5
        </Button>
        <Button
          onClick={() => selectMonth(6)}
          variant={selectedMonth === 6 ? "contained" : "outlined"}
        >
          6
        </Button>
        <Button
          onClick={() => selectMonth(7)}
          variant={selectedMonth === 7 ? "contained" : "outlined"}
        >
          7
        </Button>
        <Button
          onClick={() => selectMonth(8)}
          variant={selectedMonth === 8 ? "contained" : "outlined"}
        >
          8
        </Button>
        <Button
          onClick={() => selectMonth(9)}
          variant={selectedMonth === 9 ? "contained" : "outlined"}
        >
          9
        </Button>
        <Button
          onClick={() => selectMonth(10)}
          variant={selectedMonth === 10 ? "contained" : "outlined"}
        >
          10
        </Button>
        <Button
          onClick={() => selectMonth(11)}
          variant={selectedMonth === 11 ? "contained" : "outlined"}
        >
          11
        </Button>
        <Button
          onClick={() => selectMonth(12)}
          variant={selectedMonth === 12 ? "contained" : "outlined"}
        >
          12
        </Button>
      </ButtonGroup>
      <Button
        className="download-file"
        onClick={downloadMergedFile}
        variant="contained"
      >
        Tải File Gộp
      </Button>
    </div>
  );
}
