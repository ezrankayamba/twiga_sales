import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import { login, logout } from "../../../redux/auth/actions";
import { connect } from "react-redux";
import CommonForm from "../../utils/form/CommonForm";
import LoadingIndicator from "../../utils/loading/LoadingIndicator";
import Snackbar from "../../utils/notify/Snackbar";
import MatIcon from "../../utils/icons/MatIcon";

@connect(
  (state) => {
    return {
      user: state.auth.user,
      loggedIn: state.auth.loggedIn,
    };
  },
  {
    login: login,
    logout: logout,
  }
)
class LoginPage extends Component {
  constructor(props) {
    super(props);
    this.state = { isLoading: false, snackbar: null };
    this.snackDone = this.snackDone.bind(this);
  }

  snackDone() {
    this.setState({ snackbar: null });
  }

  submitLogin({ username, password }) {
    this.setState({ isLoading: true });
    this.props.login(
      { username, password, history: this.props.history },
      (res) => {
        if (!res) {
          this.setState({
            isLoading: false,
            snackbar: {
              message: "Login failed, try correct credentials",
              timeout: 1000,
              error: true,
            },
          });
        }
      }
    );
  }

  render() {
    const { loggedIn } = this.props;
    const { isLoading, snackbar } = this.state;
    let form = {
      title: "Login Form",
      fields: [
        {
          name: "username",
          label: "Username",
          validator: {
            valid: (val) => (val ? val.length >= 5 : false),
            error: "Username should be at least 5 characters",
          },
        },
        { name: "password", label: "Password", type: "password" },
      ],
      onSubmit: this.submitLogin.bind(this),
      btnLabel: (
        <>
          Login <MatIcon name="arrow_forward" />
        </>
      ),
    };

    if (loggedIn) {
      return <Redirect to="/" />;
    }
    return (
      <div className="login-page">
        <div className="login-container">
          <div className="intro">
            <div className="wrap">
              <h1>Twiga Cement</h1>
              <h3>
                EXPORTS <small>TRACKING TOOL</small>
              </h3>
            </div>
          </div>
          <div className="login-content">
            <CommonForm meta={form} />
            <LoadingIndicator isLoading={isLoading} />
            {snackbar && (
              <Snackbar
                message={snackbar.message}
                timeout={snackbar.timeout}
                done={this.snackDone}
                error={snackbar.error}
              />
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default LoginPage;
