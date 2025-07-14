import { Button, CircularProgress } from "@mui/material";
import { useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { extractFile } from "../../service/MergeFileService";

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

  const downloadFile = (fileContent: any, filename: string, type: string) => {
    const blob = new Blob([fileContent]);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div {...getRootProps({ style })}>
        <input {...getInputProps()} />
        <p>Chọn File Hóa Đơn để Lấy Dữ Liệu</p>
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
