import { BASE_URL, CLIENT_ID, CLIENT_SECRET, GET_TOKEN_URL } from "../conf";
import {
  apiDelete,
  apiGet,
  apiGetPaginated,
  apiPost,
  apiUpdate,
} from "./WebService";

export const getPrivileges = (user) =>
  user && user.profile && user.profile.role ? user.profile.role.privileges : [];
export const loginPost = (username, password, cb) => {
  let data = `username=${username}&password=${password}&grant_type=password&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`;
  fetch(BASE_URL + "/oauth2/token/", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: data,
  })
    .then((res) => res.json())
    .then((res) => {
      apiGet(BASE_URL + "/users/me/", res.access_token)
        .then((userRes) => {
          cb({ ...userRes, ...res });
        })
        .catch((reason) => {
          cb(false);
        });
    })
    .catch((reason) => {
      cb(false);
    });
};

export const loginRefresh = (token, cb) => {
  apiGet(BASE_URL + "/users/me/", token)
    .then((userRes) => {
      cb({ ...userRes, token: token });
    })
    .catch((reason) => {
      console.log(reason);
      cb(false);
    });
};

export const fetchUsers = (token, page, cb) => {
  apiGetPaginated(BASE_URL + "/users", token, page)
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

export const fetchRoles = (token, page = 1, cb) => {
  apiGetPaginated(BASE_URL + "/users/roles", token, page)
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
export const createUser = (token, body, cb) => {
  apiPost(BASE_URL + "/users/create", body, token)
    .then(cb)
    .catch((e) => {
      console.error(e);
      cb(false);
    });
};
export const changeMyPassword = (token, body, cb) => {
  apiPost(BASE_URL + "/users/changepwd", body, token)
    .then(cb)
    .catch((e) => {
      console.error(e);
      cb(false);
    });
};
export const updateUser = (token, body, id, cb) => {
  apiUpdate(BASE_URL + "/users/update/", body, id, token)
    .then(cb)
    .catch((e) => {
      console.error(e);
      cb(false);
    });
};
export const createOrUpdateRole = (token, params, cb) => {
  let id = params.id;
  let fp = [];
  Object.keys(params).forEach((key) => {
    if (Array.isArray(params[key])) {
      params[key].forEach((o) => {
        fp.push(`${key}=${o}`);
      });
    } else {
      fp.push(`${key}=${params[key]}`);
    }
  });
  let body = fp.join("&");
  let url = BASE_URL + "/users/roles/";
  if (id) {
    apiUpdate(url, body, id, token, "application/x-www-form-urlencoded")
      .then(cb)
      .catch((e) => {
        console.error(e);
        cb(false);
      });
  } else {
    apiPost(url, body, token, "application/x-www-form-urlencoded")
      .then(cb)
      .catch((e) => {
        console.error(e);
        cb(false);
      });
  }
};

export const deleteUser = (token, id, cb) => {
  apiDelete(BASE_URL + "/users/details/" + id, token)
    .then(cb)
    .catch((e) => {
      console.error(e);
      cb(false);
    });
};
export const deleteRole = (token, id, cb) => {
  apiDelete(BASE_URL + "/users/roles/" + id, token)
    .then(cb)
    .catch((e) => {
      console.error(e);
      cb(false);
    });
};

export const fetchPrivs = (token, cb) => {
  apiGet(BASE_URL + "/users/privileges", token)
    .then(cb)
    .catch((e) => cb(false));
};
