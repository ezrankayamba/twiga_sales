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
import ListOfRequests from "../pages/batches/ListOfRequests";
import HomePage from "../pages/HomePage";
const getMenus = (loggedIn, privileges) => {
  let pFilter = (m) => {
    return (
      m.privilege === "Anonymous" ||
      (loggedIn && privileges.includes(m.privilege))
    );
  };
  let id = 0;
  const getId = () => id++;
  // if (!hasPrivilege(this.props.user, "Home.dashboard")) {
  //   return <Redirect to="/sales" />;
  // }


  let menus = loggedIn
    ? [
      {
        id: getId(),
        path: "/home",
        name: "Home",
        component: HomePage,
        Icon: () => <MatIcon name="home" />,
        privilege: "Home.dashboard",
        redirect: "/sales"
      },
      {
        id: getId(),
        path: "/users",
        name: "Users",
        component: UsersPage,
        Icon: () => <MatIcon name="people" />,
        privilege: "Users.manage",
        redirect: "/sales"
      },
      {
        id: getId(),
        path: "/roles",
        name: "Roles",
        component: RolesPage,
        Icon: () => <MatIcon name="people" />,
        privilege: "Roles.manage",
        redirect: "/sales"
      },
      {
        id: getId(),
        path: "/sales",
        name: "Sales",
        component: SalesIndexPage,
        Icon: () => <MatIcon name="attach_money" />,
        privilege: "Sales.view",
        redirect: "/my-profile"
      },
      {
        id: getId(),
        path: "/invoices",
        name: "Invoices",
        component: InvoicesIndexPage,
        Icon: () => <MatIcon name="data_usage" />,
        privilege: "Sales.view.invoices",
        redirect: "/sales"
      },
      {
        id: getId(),
        path: "/reports",
        name: "Reports",
        component: ReportsIndexPage,
        Icon: () => <MatIcon name="leaderboard" />,
        privilege: "Sales.reports",
        redirect: "/sales"
      },
      {
        id: getId(),
        path: "/my-profile",
        name: "My Profile",
        hide: false,
        component: MyProfile,
        Icon: () => <MatIcon name="person_outline" />,
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
      {
        id: getId(),
        path: "/requests",
        name: "Requests",
        hide: true,
        component: ListOfRequests,
        Icon: () => <MatIcon name="notifications" />,
        privilege: "Anonymous",
      },
    ]
    : [
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
