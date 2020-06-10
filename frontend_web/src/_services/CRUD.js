import {
  apiGet,
  apiPost,
  apiExport,
  apiSearch,
  apiUpdate,
  apiDelete,
  apiGetPaginated,
} from "./WebService";
import { BASE_URL } from "../conf";

const CRUD = {
  list: (path, token, { onSuccess, onFail }) => {
    apiGet(`${BASE_URL}${path}`, token)
      .then((res) => {
        onSuccess(res);
      })
      .catch((error) => (onFail ? onFail(error) : console.log(error)));
  },
  listPaginated: (path, token, { onSuccess, onFail, page }) => {
    apiGetPaginated(`${BASE_URL}${path}`, token, page)
      .then((res) => {
        if (res.status === 200) {
          let { pages, records } = res.headers;
          onSuccess({
            data: res.data,
            pages,
            records,
          });
        } else {
          onFail({
            data: res.data,
          });
        }
      })
      .catch((error) => (onFail ? onFail(error) : console.log(error)));
  },
  export: (path, token, { filter, onSuccess, onFail }) => {
    apiExport(`${BASE_URL}${path}`, token, filter)
      .then((res) => {
        onSuccess(res);
      })
      .catch((error) => (onFail ? onFail(error) : console.log(error)));
  },
  create: (
    path,
    token,
    body,
    { onSuccess, onFail },
    type = "application/json"
  ) => {
    apiPost(`${BASE_URL}${path}`, body, token, type)
      .then((list) => {
        onSuccess(list);
      })
      .catch((error) => (onFail ? onFail(error) : console.log(error)));
  },
  update: (path, token, body, id, { onSuccess, onFail }) => {
    apiUpdate(`${BASE_URL}${path}`, body, id, token)
      .then((list) => {
        onSuccess(list);
      })
      .catch((error) => (onFail ? onFail(error) : console.log(error)));
  },
  delete: (path, token, { onSuccess, onFail }) => {
    apiDelete(`${BASE_URL}${path}`, token)
      .then((list) => {
        onSuccess(list);
      })
      .catch((error) => (onFail ? onFail(error) : console.log(error)));
  },
  search: (path, token, body, { onSuccess, onFail, page }) => {
    apiSearch(`${BASE_URL}${path}`, token, body, page)
      .then((list) => {
        onSuccess(list);
      })
      .catch((error) => (onFail ? onFail(error) : console.log(error)));
  },
  uploadDocs: (path, token, body, cb, newDoc = true) => {
    console.log("Upload docs");
    if (newDoc) {
      apiPost(`${BASE_URL}${path}`, body, token, "multipart/form-data")
        .then(cb)
        .catch((e) => {
          console.error(e);
          cb(false);
        });
    } else {
      apiUpdate(`${BASE_URL}${path}`, body, null, token, "multipart/form-data")
        .then(cb)
        .catch((e) => {
          console.error(e);
          cb(false);
        });
    }
  },
};

export default CRUD;
