import { apiGetPaginated, apiPost, apiUpdate } from "./WebService";
import { BASE_URL } from "../conf";

let url = `${BASE_URL}/sales`;
export const createAgentUser = (token, body, cb) => {
  apiPost(url + "/create-agent", body, token)
    .then(cb)
    .catch((e) => {
      console.error(e);
      cb(false);
    });
};
export const fetchSales = (token, page, cb, filter) => {
  apiGetPaginated(url, token, page, filter)
    .then((res) => {
      if (res.status === 200) {
        let { pages, records } = res.headers;
        cb({
          data: res.data,
          pages,
          records,
        });
      } else throw Error("Failure response: " + res.status);
    })
    .catch((e) => {
      console.error(e);
      cb(false);
    });
};
export const fetchSalesSummary = (token, page, cb) => {
  apiGetPaginated(url + "/summary", token, page)
    .then((res) => {
      if (res.status === 200) {
        let { pages, records } = res.headers;
        cb({
          data: res.data,
          pages,
          records,
        });
      } else throw Error("Failure response: " + res.status);
    })
    .catch((e) => {
      console.error(e);
      cb(false);
    });
};
export const createSale = (token, body, cb) => {
  apiPost(url, body, token)
    .then(cb)
    .catch((e) => {
      console.error(e);
      cb(false);
    });
};
export const importSales = (token, body, cb) => {
  apiPost(url + "/import", body, token, "multipart/form-data")
    .then(cb)
    .catch((e) => {
      console.error(e);
      cb(false);
    });
};
export const uploadDocs = (token, body, cb, newDoc = true) => {
  console.log("Upload docs");
  if (newDoc) {
    apiPost(url + "/docs", body, token, "multipart/form-data")
      .then(cb)
      .catch((e) => {
        console.error(e);
        cb(false);
      });
  } else {
    apiUpdate(url + "/docs", body, null, token, "multipart/form-data")
      .then(cb)
      .catch((e) => {
        console.error(e);
        cb(false);
      });
  }
};

export const attachDocs = (token, body, cb) => {
  console.log("Upload docs");
  apiPost(url + "/docs/attach", body, token, "multipart/form-data")
    .then(cb)
    .catch((e) => {
      console.error(e);
      cb(false);
    });
};
