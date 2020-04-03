const axios = require("axios").default;

export const apiGet = (url, token) => {
  return fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }).then(res => {
    if (res.status == 200) {
      return res.json();
    }
    throw Error("Failure response: " + res.status);
  });
};
export const apiGetPaginated = (url, token, page = 1) => {
  return axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`
    },
    params: {
      page
    }
  });
};
export const apiPost = (url, body, token, type = "application/json") => {
  let headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": type
  };
  if (type === "application/json") {
    body = JSON.stringify(body);
  } else if (type === "auto" || type === "multipart/form-data") {
    delete headers["Content-Type"];
  }
  return fetch(url, {
    method: "POST",
    headers: headers,
    body: body
  }).then(res => {
    if (res.status == 201 || res.status == 200) {
      return res.json();
    }
    throw Error("Failure response: " + res.status);
  });
};
export const apiUpdate = (url, body, id, token, type = "application/json") => {
  let headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": type
  };
  if (type === "application/json") {
    body = JSON.stringify(body);
  } else if (type === "auto" || type === "multipart/form-data") {
    delete headers["Content-Type"];
  }
  return fetch(url + id, {
    method: "PUT",
    headers,
    body
  }).then(res => {
    if (res.status == 200) {
      return res.json();
    }
    throw Error("Failure response: " + res.status);
  });
};
export const apiDelete = (url, token) => {
  return fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  }).then(res => {
    if (res.status == 204) {
      return res;
    }
    throw Error("Failure response: " + res.status);
  });
};
