import { Button, CircularProgress } from "@mui/material";
import { useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { extractFile } from "../../service/MergeFileService";
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

export default function InvoiceDetailComponent() {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const { getRootProps, getInputProps, isFocused, isDragAccept, isDragReject } =
    useDropzone({
      accept: {
        "application/xml": [".xml"],
      },
      onDrop: (acceptedFiles) => {
        setFiles(acceptedFiles);
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

  const onGetFileDetail = async () => {
    try {
      setError(null); // Clear any existing errors
      setLoading(true); // Start loading
      
      if (files.length === 0) {
        setError("Chưa có file XML nào được chọn, Hãy chọn file để tiếp tục");
        setLoading(false);
        return;
      }
      
      const response = await extractFile(files);
      downloadFile(response.data, "extractedXmlData.xlsx", "application/vnd.ms-excel");
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || "An error occurred while processing the files";
      setError(errorMessage);
    } finally {
      setLoading(false); // Stop loading in all cases
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h2>Trích Xuất Dữ Liệu Hóa Đơn</h2>
        <p style={{ color: '#666', marginTop: '10px', lineHeight: '1.6' }}>
          Tính năng này cho phép bạn trích xuất thông tin chi tiết từ các file hóa đơn điện tử XML. 
          Hệ thống sẽ đọc và phân tích dữ liệu từ file XML, sau đó xuất ra file Excel (.xlsx) 
          chứa đầy đủ thông tin hóa đơn như: số hóa đơn, ngày phát hành, thông tin người bán/mua, 
          danh sách sản phẩm/dịch vụ, thuế suất, và tổng giá trị, ...
        </p>
        <p style={{ color: '#1976d2', fontStyle: 'italic', marginTop: '8px' }}>
          <strong>Hướng dẫn:</strong> Kéo thả hoặc nhấp vào vùng bên dưới để chọn các file XML hóa đơn, 
          sau đó nhấn nút "Lấy Dữ Liệu" để xử lý.
        </p>
      </div>
      <div {...getRootProps({ style })}>
        <input {...getInputProps()} />
        <p>Chọn File Hóa Đơn XML (Kéo thả hoặc nhấp để chọn)</p>
        <em style={{ fontSize: '12px', marginTop: '8px', color: '#999' }}>
          Chỉ chấp nhận file định dạng .xml
        </em>
      </div>
      <div className="merge-control">
        <div>
          <h4>Files</h4>
          <ul>
            {files.map((f, i) => (
              <li key={`${f.name}-i-${i}`}>{f.name}</li>
            ))}
          </ul>
        </div>
        {error && (
          <div style={{ color: 'red', margin: '10px 0', padding: '10px', backgroundColor: '#ffebee', border: '1px solid #f44336', borderRadius: '4px' }}>
            <strong>Error:</strong> {error}
          </div>
        )}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', margin: '10px 0' }}>
            <CircularProgress className="loading-progress" />
          </div>
        )}
        <Button variant="contained" onClick={onGetFileDetail} disabled={loading}>
          {loading ? "Đang xử lý..." : "Lấy Dữ Liệu"}
        </Button>
      </div>
    </div>
  );
}
