import React, { Component } from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";
import { connect, Provider } from "react-redux";
import store from "./redux/store";
import "./_styles/App.css";

import { logout } from "./redux/auth/actions";
import { notifyMe } from "./_helpers/notification";
import { SESSION_TIMEOUT_LOGOUT_AT, SESSION_TIMEOUT_WARNING_AT } from "./conf";
import MainLayout from "./components/pages/layout/MainLayout";
import LoginPage from "./components/pages/auth/LoginPage";

@connect(
  (state) => {
    return {
      user: state.auth.user,
      loggedIn: state.auth.loggedIn,
    };
  },
  { logout: logout }
)
class Index extends Component {
  constructor(props) {
    super(props);
    this.events = ["load", "click", "scroll", "keypress"];
    this.warn = this.warn.bind(this);
    this.resetSessionTimeout = this.resetSessionTimeout.bind(this);
    for (let i in this.events) {
      window.addEventListener(this.events[i], this.resetSessionTimeout);
    }
    this.setSessionTimeout();
  }

  render() {
    const { loggedIn, user } = this.props;
    return (
      <Router>
        {loggedIn && <MainLayout loggedIn={loggedIn} user={user} />}
        {!loggedIn && <LoginPage />}
      </Router>
    );
  }

  clearSessionTimeout() {
    if (this.warnTimeout) clearTimeout(this.warnTimeout);
    if (this.logoutTimeout) clearTimeout(this.logoutTimeout);
  }

  setSessionTimeout() {
    if (this.props.loggedIn) {
      this.warnTimeout = setTimeout(this.warn, SESSION_TIMEOUT_WARNING_AT);
      this.logoutTimeout = setTimeout(() => {
        this.props.logout();
        location.reload();
      }, SESSION_TIMEOUT_LOGOUT_AT);
    }
  }

  resetSessionTimeout() {
    this.clearSessionTimeout();
    this.setSessionTimeout();
  }

  warn() {
    notifyMe("You will be logged out automatically in 1 minute.");
  }

  destroy() {
    this.clearSessionTimeout();
    for (let i in this.events) {
      window.removeEventListener(this.events[i], this.resetSessionTimeout);
    }
  }
}

const root = (
  <Provider store={store}>
    <Index />
  </Provider>
);

ReactDOM.render(root, document.getElementById("app"));
