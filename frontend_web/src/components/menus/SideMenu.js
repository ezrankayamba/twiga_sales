import React, { Component } from "react";
import { connect } from "react-redux";
import { logout } from "../../redux/auth/actions";
import getMenus from "./menus";
import { NavLink } from "react-router-dom";
import { getPrivileges } from "../../_services/AuthService";

const init = () => {
  let sidebar = document.querySelector(".sidebar");
  let sidebarContent = document.querySelector(".sidebar-content");
  let sidebarClose = document.querySelector(".sidebar-close");
  let toggle = document.querySelector(".sidebar-menu-toggle");
  let menuShow = false;
  const hideCompleted = () => {
    sidebar.classList.remove("show");
    sidebar.removeEventListener("animationend", hideCompleted);
    console.log(sidebar);
  };

  const open = () => {
    sidebar.classList.remove("slideOutLeft");
    sidebar.classList.add("slideInLeft");
    sidebar.classList.add("show");
  };
  const close = () => {
    sidebar.classList.add("slideOutLeft");
    sidebar.classList.remove("slideInLeft");
    sidebar.addEventListener("animationend", hideCompleted);
    console.log("Closing ...");
  };
  if (sidebar && toggle) {
    toggle.addEventListener("click", (e) => {
      e.stopPropagation();
      menuShow = !menuShow;
      sidebar.classList.remove("show");
      if (menuShow) {
        open();
      }
    });
    sidebar.addEventListener("click", (e) => {
      e.stopPropagation();
      menuShow = false;
      close();
    });
  }
  if (sidebarContent) {
    sidebarContent.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  }
  if (sidebarClose) {
    sidebarClose.addEventListener("click", (e) => {
      e.stopPropagation();
      menuShow = false;
      close();
    });
  }

  let menus = document.querySelectorAll(".sidebar-menu li");
  if (menus) {
    const selected = (menu) => {
      menus.forEach((menu) => menu.classList.remove("active"));
      menu.classList.add("active");
    };
    menus.forEach((menu) => {
      menu.addEventListener("click", (e) => selected(menu));
    });
  }
};

@connect(
  (state) => {
    return {
      loggedIn: state.auth.loggedIn,
      user: state.auth.user,
    };
  },
  { logout: logout }
)
class SideMenu extends Component {
  componentDidMount() {
    init();
  }
  render() {
    let { loggedIn, user } = this.props;

    let privileges = getPrivileges(user);
    return (
      <aside class="sidebar sidebar-left animated fast">
        <div class="sidebar-content">
          <div class="sidebar-title">
            <span>Twiga Cement</span>
            <span class="material-icons sidebar-close">close</span>
          </div>
          <ul class="sidebar-menu">
            {getMenus(loggedIn, privileges)
              .filter((m) => !m.hide)
              .map((item) => {
                return (
                  <li>
                    <NavLink
                      key={item.id}
                      to={item.path}
                      className="ripple"
                      activeClassName="active"
                    >
                      <item.Icon />
                      <span className="menu-item-label">{item.name}</span>
                    </NavLink>
                  </li>
                );
              })}
          </ul>
        </div>
      </aside>
    );
  }
}

export default SideMenu;
