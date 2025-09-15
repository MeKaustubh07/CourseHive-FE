import React, { useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { Button } from "../../Components/ui/button";

const PDFViewer = () => {
  const { id } = useParams();
  const query = new URLSearchParams(useLocation().search);
  const fileUrl = query.get("fileUrl");
  const title = query.get("title");

  const [viewMode, setViewMode] = useState("embed");

  const openInNewTab = () => window.open(fileUrl, "_blank");

  const downloadFile = () => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = title;
    link.click();
  };

  const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`;
  const pdfJsViewerUrl = `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(fileUrl)}`;

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <div className="flex gap-2 mb-4">
        <Button onClick={() => setViewMode("embed")} variant={viewMode === "embed" ? "default" : "outline"}>Direct View</Button>
        <Button onClick={() => setViewMode("google")} variant={viewMode === "google" ? "default" : "outline"}>Google Viewer</Button>
        <Button onClick={() => setViewMode("pdfjs")} variant={viewMode === "pdfjs" ? "default" : "outline"}>PDF.js Viewer</Button>
        <Button onClick={openInNewTab} variant="outline">New Tab</Button>
        <Button onClick={downloadFile} variant="outline">Download</Button>
      </div>

      {viewMode === "embed" && (
        <embed src={`${fileUrl}#toolbar=1`} type="application/pdf" width="100%" height="600px" />
      )}
      {viewMode === "google" && (
        <iframe src={googleViewerUrl} width="100%" height="600px" title="Google PDF Viewer" />
      )}
      {viewMode === "pdfjs" && (
        <iframe src={pdfJsViewerUrl} width="100%" height="600px" title="PDF.js Viewer" />
      )}
    </div>
  );
};

export default PDFViewer;