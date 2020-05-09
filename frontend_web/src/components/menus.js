import HomePage from "./pages/HomePage";
import LoginPage from "./pages/auth/LoginPage";
import LogoutPage from "./pages/auth/LogoutPage";
import SalesIndexPage from "./pages/sales/IndexPage";
import ReportsIndexPage from "./pages/reports/IndexPage";
import React from "react";
import {
  IconHome,
  IconPayment,
  IconPeople,
  IconSignIn,
  IconSignOut,
} from "neza-react-forms";
import UsersPage from "./pages/auth/UsersPage";
import RolesPage from "./pages/auth/RolesPage";

const getMenus = (loggedIn, privileges) => {
  let pFilter = (m) => {
    return (
      m.privilege === "Anonymous" ||
      (loggedIn && privileges.includes(m.privilege))
    );
  };
  let id = 0;
  const getId = () => id++;
  let menus = loggedIn
    ? [
        {
          id: getId(),
          path: "/home",
          name: "Home",
          component: HomePage,
          Icon: IconHome,
          privilege: "Anonymous",
        },
        {
          id: getId(),
          path: "/users",
          name: "Users",
          component: UsersPage,
          Icon: IconPeople,
          privilege: "Users.manage",
        },
        {
          id: getId(),
          path: "/roles",
          name: "Roles",
          component: RolesPage,
          Icon: IconPeople,
          privilege: "Roles.manage",
        },
        {
          id: getId(),
          path: "/sales",
          name: "Sales",
          component: SalesIndexPage,
          Icon: IconPayment,
          privilege: "Sales.view",
        },
        {
          id: getId(),
          path: "/reports",
          name: "Reports",
          component: ReportsIndexPage,
          Icon: IconPayment,
          privilege: "Sales.reports",
        },
        {
          id: getId(),
          path: "/logout",
          name: "Sign Out",
          component: LogoutPage,
          Icon: IconSignOut,
          privilege: "Anonymous",
        },
      ]
    : [
        {
          id: getId(),
          path: "/home",
          name: "Home",
          component: HomePage,
          Icon: IconHome,
          privilege: "Anonymous",
        },
        {
          id: getId(),
          path: "/login",
          name: "Sign In",
          component: LoginPage,
          Icon: IconSignIn,
          privilege: "Anonymous",
        },
      ];
  return menus.filter(pFilter);
};
export default getMenus;
