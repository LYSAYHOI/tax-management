import { Button } from "@mui/material";
import { useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import "./ExcelInvoiceMerge.style.css";
import { mergeFile } from "../../service/MergeFileService";

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

  const { getRootProps, getInputProps, isFocused, isDragAccept, isDragReject } =
    useDropzone({
      accept: {
        "application/vnd.ms-excel": [".xlsx", ".xls"],
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

  const onMergeFile = async () => {
    const content = await mergeFile(files);
    downloadFile(content.data, "mergedFile.xlsx", "application/vnd.ms-excel");
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
        <p>Chọn File Hóa Đơn để ghép</p>
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
        <Button variant="contained" onClick={onMergeFile}>
          Ghép
        </Button>
      </div>
    </div>
  );
}
