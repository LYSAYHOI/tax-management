import { useState } from "react";
import { useDropzone } from "react-dropzone";

export default function ExcelInvoiceMergeComponent() {
  const [files, setFiles] = useState<File[]>([]);
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "application/vnd.ms-excel": [".xlsx", ".xls"],
    },
    onDrop: (acceptedFiles) => {
      setFiles(acceptedFiles);
    },
  });
  return (
    <section className="container">
      <div {...getRootProps({ className: "dropzone" })}>
        <input {...getInputProps()} />
        <p>Chọn File Hóa Đơn để ghép</p>
      </div>
      <aside>
        <h4>Files</h4>
        <ul>
          {files.map((f, i) => (
            <li key={`${f.name}-i-${i}`}>{f.name}</li>
          ))}
        </ul>
      </aside>
    </section>
  );
}
