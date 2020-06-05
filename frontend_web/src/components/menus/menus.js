import HomePage from "../pages/HomePage";
import LoginPage from "../pages/auth/LoginPage";
import LogoutPage from "../pages/auth/LogoutPage";
import SalesIndexPage from "../pages/sales/IndexPage";
import InvoicesIndexPage from "../pages/invoices/IndexPage";
import ReportsIndexPage from "../pages/reports/IndexPage";

import UsersPage from "../pages/auth/UsersPage";
import RolesPage from "../pages/auth/RolesPage";
import React from "react";
import MatIcon from "../utils/icons/MatIcon";
import MyProfile from "../pages/auth/MyProfile";
import ListBatches from "../pages/batches/ListBatches";
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
          Icon: () => <MatIcon name="home" />,
          privilege: "Anonymous",
        },
        {
          id: getId(),
          path: "/users",
          name: "Users",
          component: UsersPage,
          Icon: () => <MatIcon name="people" />,
          privilege: "Users.manage",
        },
        {
          id: getId(),
          path: "/roles",
          name: "Roles",
          component: RolesPage,
          Icon: () => <MatIcon name="people" />,
          privilege: "Roles.manage",
        },
        {
          id: getId(),
          path: "/sales",
          name: "Sales",
          component: SalesIndexPage,
          Icon: () => <MatIcon name="attach_money" />,
          privilege: "Sales.view",
        },
        {
          id: getId(),
          path: "/invoices",
          name: "Invoices",
          component: InvoicesIndexPage,
          Icon: () => <MatIcon name="data_usage" />,
          privilege: "Sales.view.invoices",
        },
        {
          id: getId(),
          path: "/reports",
          name: "Reports",
          component: ReportsIndexPage,
          Icon: () => <MatIcon name="data_usage" />,
          privilege: "Sales.reports",
        },
        {
          id: getId(),
          path: "/my-profile",
          name: "My Profile",
          hide: false,
          component: MyProfile,
          Icon: () => <MatIcon name="lock" />,
          privilege: "Anonymous",
        },
        {
          id: getId(),
          path: "/logout",
          name: "Sign Out",
          component: LogoutPage,
          Icon: () => <MatIcon name="lock" />,
          privilege: "Anonymous",
        },
        {
          id: getId(),
          path: "/batches",
          name: "Batches",
          hide: true,
          component: ListBatches,
          Icon: () => <MatIcon name="notifications" />,
          privilege: "Anonymous",
        },
      ]
    : [
        {
          id: getId(),
          path: "/home",
          name: "Home",
          component: HomePage,
          Icon: () => <MatIcon name="home" />,
          privilege: "Anonymous",
        },
        {
          id: getId(),
          path: "/login",
          name: "Sign In",
          component: LoginPage,
          Icon: () => <MatIcon name="lock_open" />,
          privilege: "Anonymous",
        },
      ];
  return menus.filter(pFilter);
};
export default getMenus;
