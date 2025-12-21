import { Button, TextField } from "@mui/material";
import { useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import "./ExcelInvoiceMerge.style.css";
import { mergeFile } from "../../service/MergeFileService";
import { downloadFile } from "../../util/AppUtils";

const baseStyle = {
  flex: 1,
  display: "flex",
  flexDirection: "column" as "column",
  alignItems: "center",
  padding: "20px",
  borderWidth: 2,
  borderRadius: 2,
  borderColor: "#eeeeee",
  borderStyle: "dashed",
  backgroundColor: "#fafafa",
  color: "#bdbdbd",
  outline: "none",
  transition: "border .24s ease-in-out",
};

const focusedStyle = {
  borderColor: "#2196f3",
};

const acceptStyle = {
  borderColor: "#00e676",
};

const rejectStyle = {
  borderColor: "#ff1744",
};

export default function ExcelInvoiceMergeComponent() {
  const [files, setFiles] = useState<File[]>([]);
  const [startRow, setStartRow] = useState<number>(1);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const { getRootProps, getInputProps, isFocused, isDragAccept, isDragReject } =
    useDropzone({
      accept: {
        "application/vnd.ms-excel": [".xlsx", ".xls"],
      },
      onDrop: (acceptedFiles) => {
        setFiles(acceptedFiles);
        setErrorMessage(""); // Clear error when new files are selected
      },
    });

  const style = useMemo(
    () => ({
      ...baseStyle,
      ...(isFocused ? focusedStyle : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {}),
    }),
    [isFocused, isDragAccept, isDragReject]
  );

  const onMergeFile = async () => {
    setErrorMessage(""); // Clear previous errors
    try {
      if (files.length === 0) {
        setErrorMessage("Vui lòng chọn ít nhất một file Excel để ghép");
        return;
      }
      const content = await mergeFile(files, startRow);
      downloadFile(content.data, "mergedFile.xlsx", "application/vnd.ms-excel");
    } catch (error: any) {
      console.error("Error merging files:", error);
      const errorMsg = error?.response?.data?.message || 
                      error?.message || 
                      "Có lỗi xảy ra khi ghép file. Vui lòng thử lại.";
      setErrorMessage(errorMsg);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h2>Ghép File Hóa Đơn Excel</h2>
        <p style={{ color: '#666', marginTop: '10px', lineHeight: '1.6' }}>
          Tính năng này cho phép bạn gộp nhiều file Excel hóa đơn thành một file duy nhất. 
          Hệ thống sẽ tự động đọc dữ liệu từ tất cả các file Excel được chọn và hợp nhất chúng 
          vào một file Excel tổng hợp, giúp bạn dễ dàng quản lý và theo dõi toàn bộ hóa đơn 
          trong một tài liệu duy nhất.
        </p>
        <p style={{ color: '#1976d2', fontStyle: 'italic', marginTop: '8px' }}>
          <strong>Hướng dẫn:</strong> Chọn nhiều file Excel (.xlsx, .xls) cùng lúc bằng cách 
          kéo thả hoặc nhấp vào vùng bên dưới, sau đó nhấn nút "Ghép" để tạo file tổng hợp.
        </p>
      </div>
      <div style={{ marginBottom: '20px' }}>
        <TextField
          label="Dòng bắt đầu sao chép"
          type="number"
          value={startRow}
          onChange={(e) => setStartRow(Number(e.target.value))}
          variant="outlined"
          size="small"
          slotProps={{
            htmlInput: { min: 1 }
          }}
          helperText="Nhập số dòng bắt đầu sao chép dữ liệu hoặc chọn loại hóa đơn để gộp bên dưới"
          style={{ width: '300px' }}
        />
        <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
          <Button 
            variant="outlined" 
            size="small"
            onClick={() => setStartRow(33)}
          >
            Gộp hóa đơn mua hàng (dòng thứ 33)
          </Button>
          <Button 
            variant="outlined" 
            size="small"
            onClick={() => setStartRow(6)}
          >
            Gộp hóa đơn điện tử (dòng thứ 6)
          </Button>
        </div>
      </div>
      <div {...getRootProps({ style })}>
        <input {...getInputProps()} />
        <p>Chọn File Excel Hóa Đơn để Ghép (Kéo thả hoặc nhấp để chọn)</p>
        <em style={{ fontSize: '12px', marginTop: '8px', color: '#999' }}>
          Chấp nhận file định dạng .xlsx và .xls
        </em>
      </div>
      {errorMessage && (
        <div style={{ 
          marginTop: '20px', 
          padding: '12px 16px', 
          backgroundColor: '#ffebee', 
          borderLeft: '4px solid #f44336',
          borderRadius: '4px'
        }}>
          <p style={{ 
            color: '#c62828', 
            margin: 0,
            fontSize: '14px',
            fontWeight: '500'
          }}>
            Lỗi: ⚠️ {errorMessage}
          </p>
        </div>
      )}
      <div className="merge-control">
        <div>
          <h4>Files</h4>
          <ul>
            {files.map((f, i) => (
              <li key={`${f.name}-i-${i}`}>{f.name}</li>
            ))}
          </ul>
        </div>
        <Button variant="contained" onClick={onMergeFile}>
          Ghép
        </Button>
      </div>
    </div>
  );
}
