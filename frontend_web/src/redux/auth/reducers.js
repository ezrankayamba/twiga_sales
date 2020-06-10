import {
  USERS_LOGIN_FAIL,
  USERS_LOGIN_REQUEST,
  USERS_LOGIN_SUCCESS,
  USERS_LOGOUT,
} from "./actions";

let initialState = {
  user: null,
  loggedIn: false,
};

let authReducer = (state = initialState, action) => {
  switch (action.type) {
    case USERS_LOGIN_REQUEST:
      return {
        ...state,
        loggedIn: false,
        user: null,
      };

    case USERS_LOGIN_SUCCESS:
      return {
        ...state,
        loggedIn: true,
        user: {
          username: action.payload.username,
          token: action.payload.token,
          profile: action.payload.profile,
          agent: action.payload.agent,
        },
      };
    case USERS_LOGIN_FAIL:
      return {
        ...state,
        loggedIn: false,
        user: null,
      };
    case USERS_LOGOUT:
      return {
        ...state,
        loggedIn: false,
        user: null,
      };
    default:
      return state;
  }
};

export default authReducer;
