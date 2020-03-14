import {loginPost} from "../../_services/AuthService";

export const USERS_LOGIN_REQUEST = 'USERS_LOGIN_REQUEST'
export const USERS_LOGIN_SUCCESS = 'USERS_LOGIN_SUCCESS'
export const USERS_LOGIN_FAIL = 'USERS_LOGIN_FAIL'
export const USERS_LOGOUT = 'USERS_LOGOUT'

export let login = (params, cb) => {
    let {username, password} = params
    let success = ({username, token, profile}) => {
        return {
            type: USERS_LOGIN_SUCCESS,
            payload: {
                username: username,
                token: token,
                profile: profile
            }
        }
    }
    let fail = (error) => {
        return {
            type: USERS_LOGIN_FAIL
        }
    }
    let request = () => {
        return {
            type: USERS_LOGIN_REQUEST
        }
    }
    return (dispatch, getState) => {
        dispatch(request())
        loginPost(username, password, (res) => {
            if (res) {
                dispatch(success({username: username, token: res.access_token, profile: res.profile}))
                cb(true)
            } else {
                dispatch(fail("Login failed!"))
                cb(false)
            }
        })
    }
}

export const logout = (params) => {
    let cb = params ? params.cb : null
    localStorage.removeItem('accessToken');
    if (cb) {
        cb()
    }
    return {
        type: USERS_LOGOUT
    }
}