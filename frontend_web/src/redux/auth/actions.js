import { loginPost, loginRefresh } from "../../_services/AuthService";

export const USERS_LOGIN_REQUEST = "USERS_LOGIN_REQUEST";
export const USERS_LOGIN_SUCCESS = "USERS_LOGIN_SUCCESS";
export const USERS_LOGIN_FAIL = "USERS_LOGIN_FAIL";
export const USERS_LOGOUT = "USERS_LOGOUT";

export let login = (params, cb) => {
  let { username, password } = params;
  let success = (params) => {
    return {
      type: USERS_LOGIN_SUCCESS,
      payload: {
        ...params,
      },
    };
  };
  let fail = (error) => {
    return {
      type: USERS_LOGIN_FAIL,
    };
  };
  let request = () => {
    return {
      type: USERS_LOGIN_REQUEST,
    };
  };
  return (dispatch, getState) => {
    dispatch(request());
    loginPost(username, password, (res) => {
      if (res) {
        dispatch(
          success({
            username: username,
            token: res.access_token,
            profile: res.profile,
            agent: res.agent,
          })
        );
        cb(true);
      } else {
        dispatch(fail("Login failed!"));
        cb(false);
      }
    });
  };
};

export const refreshUser = (user, cb) => {
  return {
    type: USERS_LOGIN_SUCCESS,
    payload: {
      ...user,
    },
  };
};

export const logout = (params) => {
  let cb = params ? params.cb : null;
  sessionStorage.removeItem("accessToken");
  if (cb) {
    cb();
  }
  return {
    type: USERS_LOGOUT,
  };
};
