const FileDownload = {
  get: (res, name = "Export") => {
    let headers = {};
    for (let entry of res.headers.entries()) {
      headers[entry[0]] = entry[1];
    }
    let media = headers["content-type"];
    res.blob().then((data) => download(data, name, media));
  },
  MIME_EXCEL: "application/vnd.ms-excel",
};
export default FileDownload;
