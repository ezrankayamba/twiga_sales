import { apiGetPaginated, apiPost, apiUpdate } from "./WebService";
import { BASE_URL } from "../conf";

let url = `${BASE_URL}/aggregate`;

export const uploadDocs = (token, body, cb, newDoc = true) => {
  console.log("Upload docs");
  apiPost(url + "/docs", body, token, "multipart/form-data")
    .then(cb)
    .catch((e) => {
      console.error(e);
      cb(false);
    });
};