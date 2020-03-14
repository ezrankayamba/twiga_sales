import HomePage from "./pages/HomePage";
import LoginPage from "./pages/auth/LoginPage";
import LogoutPage from "./pages/auth/LogoutPage";
import IndexPage from "./pages/customers/IndexPage";
import React from "react";
import {IconClient, IconHome, IconPayment, IconSignIn, IconSignOut} from "./utils/Incons";
import UsersPage from "./pages/auth/UsersPage";

const getMenus = (loggedIn, privileges) => {
    let pFilter = (m) => {
        return m.privilege === 'Anonymous' || (loggedIn && privileges.includes(m.privilege))
    }
    let id = 0
    const getId = () => id++
    let menus = loggedIn ?
        [
            {id: getId(), path: "/home", name: "Home", component: HomePage, Icon: IconHome, privilege: 'Anonymous'},
            {id: getId(), path: "/users", name: "Users", component: UsersPage, Icon: IconHome, privilege: 'Users.manage'},
            {
                id: getId(),
                path: "/customers",
                name: "Customers",
                component: IndexPage,
                Icon: IconClient,
                privilege: 'Customers.manage'
            },
            {
                id: getId(),
                path: "/logout",
                name: "Sign Out",
                component: LogoutPage,
                Icon: IconSignOut,
                privilege: 'Anonymous'
            },

        ] : [
            {id: getId(), path: "/home", name: "Home", component: HomePage, Icon: IconHome, privilege: 'Anonymous'},
            {
                id: getId(),
                path: "/login",
                name: "Sign In",
                component: LoginPage,
                Icon: IconSignIn,
                privilege: 'Anonymous'
            }
        ]
    return menus.filter(pFilter);
}
export default getMenus;
