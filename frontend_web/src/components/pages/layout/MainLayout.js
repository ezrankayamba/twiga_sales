import React, { Component } from "react";
import Pages from "../../menus/Pages";
import SideMenu from "../../menus/SideMenu";
import { connect } from "react-redux";
import BatchBuble from "../notifications/BatchBuble";
import RequestsBuble from "../notifications/RequestsBuble";
@connect((state) => {
  return {
    user: state.auth.user,
  };
})
class MainLayout extends Component {
  state = { avatarOn: false };
  componentDidMount() {
    document.querySelector("body").addEventListener("click", () => {
      this.setState({ avatarOn: false });
    });
  }
  toggleAvatar() {
    const { avatarOn } = this.state;
    this.setState({ avatarOn: !avatarOn });
  }
  render() {
    const { avatarOn } = this.state;
    const { user } = this.props;
    return (
      <>
        <header className="navbar">
          <div className="menu sidebar-menu-toggle">
            <i className="material-icons">menu</i>
          </div>
          <div className="navbar-title">
            EXPORTS <i className="small text-warning">TRACKING TOOL</i>
          </div>
          <div className="right-controls">
            <BatchBuble />
            <RequestsBuble />
            <div className={`avatar${avatarOn ? " on" : ""}`}>
              <img
                src={user.profile.image}
                alt=""
                onClick={this.toggleAvatar.bind(this)}
              />
              <ul className="avatar-menu">
                <li>
                  <a href="/my-profile">My Profile</a>
                </li>
                <li>
                  <a href="/logout">Logout</a>
                </li>
              </ul>
            </div>
          </div>
        </header>
        <SideMenu />
        <section className="main-content-wraper">
          <div className="main-content">
            <Pages />
          </div>
        </section>
        {/* <footer>
          <BackendNotification />
        </footer> */}
      </>
    );
  }
}

export default MainLayout;
