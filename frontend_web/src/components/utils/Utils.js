import { getPrivileges } from "../../_services/AuthService";

export const numFmt = (num) => {
    let num_parts = num.toString().split(".");
    num_parts[0] = num_parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return num_parts.join(".");
}

export const isEmailValid = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

export const hasPrivilege = (user, priv) => {
    console.log(user, priv)
    let privileges = getPrivileges(user);
    console.log(privileges)
    let p = privileges.find((p) => p === priv)
    console.log(p)
    return p ? true : false
}