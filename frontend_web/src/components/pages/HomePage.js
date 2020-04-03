import React, { Component } from "react";
import { connect } from "react-redux";
import Dashboard from "./dashboard/Dashboard";

@connect(state => {
  return {
    user: state.auth.user,
    loggedIn: state.auth.loggedIn
  };
})
class HomePage extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { user, loggedIn } = this.props;
    return (
      <div className="">
        <div className="p-3">
          {!user && (
            <p>
              You are not logged in
              <a
                className="btn btn-sm btn-outline-primary ml-2 mr-2 pt-0 pb-0"
                href="/login"
              >
                Login
              </a>
              to access the dashboard
            </p>
          )}
          {user && <Dashboard user={user} />}
        </div>
      </div>
    );
  }
}

export default HomePage;
