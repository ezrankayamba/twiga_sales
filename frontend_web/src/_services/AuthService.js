import {BASE_URL, CLIENT_ID, CLIENT_SECRET, GET_TOKEN_URL} from "../conf";
import {apiDelete, apiGet, apiGetPaginated, apiPost} from "./WebService";

export const getPrivileges = (user) => user && user.profile && user.profile.role ? user.profile.role.privileges : []
export const loginPost = (username, password, cb) => {
    let data = `username=${username}&password=${password}&grant_type=password&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`;
    fetch(BASE_URL + "/oauth2/token/", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: data
    })
        .then(res => res.json())
        .then(res => {
            apiGet(BASE_URL + "/users/me/", res.access_token)
                .then(userRes => {
                    cb({...userRes, ...res})
                }).catch(reason => {
                cb(false)
            })
        }).catch(reason => {
        cb(false)
    })
}

export const fetchUsers = (token, page, cb) => {
    apiGetPaginated(BASE_URL + "/users", token, page)
        .then(res => {
            if (res.status === 200) {
                let {pages, records} = res.headers
                cb({
                    data: res.data,
                    pages, records
                })
            } else
                throw Error("Failure response: " + res.status)
        })
        .catch(e => {
            console.error(e)
            cb(false)
        })
}

export const fetchRoles = (token, cb) => {
    apiGet(BASE_URL + "/users/roles", token)
        .then(cb)
        .catch(e => {
            console.error(e)
            cb(false)
        })
}
export const createUser = (token, body, cb) => {
    apiPost(BASE_URL + "/users/create", body, token)
        .then(cb)
        .catch(e => {
            console.error(e)
            cb(false)
        })
}

export const deleteUser = (token, id, cb) => {
    apiDelete(BASE_URL + "/users/details/" + id, token)
        .then(cb)
        .catch(e => {
            console.error(e)
            cb(false)
        })
}