import { apiGet, apiPost, apiExport } from "./WebService";
import { BASE_URL } from "../conf";

const CRUD = {
  list: (path, token, { onSuccess, onFail }) => {
    apiGet(`${BASE_URL}${path}`, token)
      .then((list) => {
        onSuccess(list);
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
  create: (path, token, body, { onSuccess, onFail }) => {
    apiPost(`${BASE_URL}${path}`, body, token)
      .then((list) => {
        onSuccess(list);
      })
      .catch((error) => (onFail ? onFail(error) : console.log(error)));
  },
  search: (path, token, body, { onSuccess, onFail }) => {
    apiPost(`${BASE_URL}${path}`, body, token)
      .then((list) => {
        onSuccess(list);
      })
      .catch((error) => (onFail ? onFail(error) : console.log(error)));
  },
};

export default CRUD;
