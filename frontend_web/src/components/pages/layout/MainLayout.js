import React, { Component } from "react";
import Pages from "../../menus/Pages";
import SideMenu from "../../menus/SideMenu";
import BackendNotification from "../../BackendNotification";

class MainLayout extends Component {
  state = { avatarOn: false };
  componentDidMount() {
    document.querySelector("body").addEventListener("click", (e) => {
      this.setState({ avatarOn: false });
    });
  }
  toggleAvatar(e) {
    const { avatarOn } = this.state;
    this.setState({ avatarOn: !avatarOn });
  }
  render() {
    const { avatarOn } = this.state;
    return (
      <>
        <header class="navbar">
          <div class="menu sidebar-menu-toggle">
            <i class="material-icons">menu</i>
          </div>
          <div class="navbar-title">
            EXPORTS <i className="small text-warning">TRACKING TOOL</i>
          </div>
          <div class={`avatar${avatarOn ? " on" : ""}`}>
            <img
              src="https://via.placeholder.com/150"
              alt=""
              onClick={this.toggleAvatar.bind(this)}
            />
            <ul className="avatar-menu">
              <li>
                <a href="#">My Profile</a>
              </li>
              <li>
                <a href="/logout">Logout</a>
              </li>
            </ul>
          </div>
        </header>
        <SideMenu />
        <section class="main-content-wraper">
          <div class="main-content">
            <Pages />
          </div>
        </section>
        <footer>
          <BackendNotification />
        </footer>
      </>
    );
  }
}

export default MainLayout;
