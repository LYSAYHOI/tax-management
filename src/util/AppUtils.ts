/**
 * Downloads a file by creating a temporary anchor element and triggering a click
 * @param fileContent - The content of the file (typically a Blob or ArrayBuffer)
 * @param filename - The name to save the file as
 * @param type - Optional MIME type of the file (e.g., 'application/vnd.ms-excel', 'application/zip')
 */
const downloadFile = (fileContent: any, filename: string, type?: string) => {
  const blob = type ? new Blob([fileContent], { type }) : new Blob([fileContent]);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url); // Clean up the URL object
};

export { downloadFile };