import React, { Component } from "react";
import { connect } from "react-redux";
import {
  fetchPrivs,
  changeMyPassword,
  loginRefresh,
} from "../../../_services/AuthService";
import MatIcon from "../../utils/icons/MatIcon";
import CommonForm from "../../utils/form/CommonForm";
import { logout, refreshUser } from "../../../redux/auth/actions";
import Snackbar from "../../utils/notify/Snackbar";
import CRUD from "../../../_services/CRUD";
@connect(
  (state) => {
    return {
      user: state.auth.user,
    };
  },
  { logout: logout, refreshUser: refreshUser }
)
class MyProfile extends Component {
  state = { privs: [] };
  componentDidMount() {
    fetchPrivs(this.props.user.token, (res) => {
      this.setState({ privs: res });
    });
  }

  handleChangePwd(params) {
    console.log(params);
    changeMyPassword(this.props.user.token, params, (res) => {
      console.log(res);
      if (res.status === 0) {
        this.setState({ formOpen: false });
        this.props.logout();
      } else {
        this.setState({
          snackbar: { message: res.message, timeout: 10000, error: true },
        });
      }
    });
  }
  handleChange(event) {
    const { name } = event.target;
    this.setFileChanged(event, name);
  }
  setFileChanged(e, name) {
    const token = this.props.user.token;
    const file = e.target.files[0];
    let form = new FormData();
    form.append(name, file);
    CRUD.create(
      "/users/my-photo",
      token,
      form,
      {
        onSuccess: (res) => {
          loginRefresh(token, (res) => {
            console.log(res);
            this.props.refreshUser(res, (res) => {
              console.log(res);
            });
          });
        },
        onFail: (res) => console.error(res),
      },
      "multipart/form-data"
    );
  }

  render() {
    const { user } = this.props;
    const { privs, formOpen, snackbar } = this.state;
    console.log(user);
    const privName = (p) => {
      let priv = privs.find((prv) => prv.id === p);
      return priv ? priv.name : p;
    };
    const form = {
      fields: [
        { name: "password", label: "Current password", type: "password" },
        { name: "new_password", label: "New password", type: "password" },
      ],
      onSubmit: this.handleChangePwd.bind(this),
    };
    return (
      <div className="user-profile">
        <div className="info">
          <div className="profile-photo">
            <label htmlFor="photo" className="photo">
              <img src={user.profile.image} alt="Pic" />
              <input
                type="file"
                accept="image/*"
                id="photo"
                name="photo"
                onChange={this.handleChange.bind(this)}
              />
            </label>
          </div>
          <div>
            <h3>{user.username}</h3>
            <small>
              {user.profile.role.name}
              {user.agent ? ` - ${user.agent.code}` : ""}
            </small>
          </div>
        </div>
        <div className="update">
          <button
            className="p-2 btn btn-sm"
            onClick={() => this.setState({ formOpen: !formOpen })}
          >
            Change password
          </button>
          {formOpen && <CommonForm meta={form} />}
        </div>
        <div className="privileges">
          <h5>Privileges:</h5>
          <ul>
            {user.profile.role.privileges.map((p) => (
              <li>
                <MatIcon name="arrow_forward" /> {privName(p)}
              </li>
            ))}
          </ul>
        </div>
        {snackbar && (
          <Snackbar
            message={snackbar.message}
            timeout={snackbar.timeout}
            error={snackbar.error}
            done={() => console.log("Done")}
          />
        )}
      </div>
    );
  }
}

export default MyProfile;
