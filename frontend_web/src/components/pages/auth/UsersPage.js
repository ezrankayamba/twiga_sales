import React, { Component } from "react";
import { connect } from "react-redux";
import {
  createUser,
  deleteUser,
  fetchRoles,
  fetchUsers,
  updateUser,
} from "../../../_services/AuthService";
import { clearNewOption } from "../../../redux/forms/actions";
import MatIcon from "../../utils/icons/MatIcon";
import BasicCrudView from "../../utils/crud/BasicCrudView";
import LoadingIndicator from "../../utils/loading/LoadingIndicator";
import Modal from "../../modal/Modal";
import CommonForm from "../../utils/form/CommonForm";
import { isEmailValid } from "../../utils/Utils"
import CRUD from "../../../_services/CRUD";

@connect(
  (state) => {
    return {
      user: state.auth.user,
      loggedIn: state.auth.loggedIn,
      newOptions: state.forms.newOptions,
    };
  },
  { clearNewOption: clearNewOption }
)
class UsersPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      users: [],
      roles: [],
      agents: [],
      isLoading: false,
      snackbar: null,
      pages: 1,
      pageNo: 1,
      selected: null,
    };
    this.snackDone = this.snackDone.bind(this);
    this.newComplete = this.newComplete.bind(this);
    this.onPageChange = this.onPageChange.bind(this);
  }

  onPageChange(pageNo) {
    this.setState({ pageNo });
    this.refresh(pageNo);
  }

  snackDone() {
    this.setState({ snackbar: null });
  }
  onDelete(e, row) {
    e.stopPropagation();
    deleteUser(this.props.user.token, row.id, (res) => {
      console.log(res);
      if (res) {
        this.refresh();
      }
    });
  }

  refresh(page = 1) {
    this.setState({ isLoading: true, pageNo: page }, () =>
      fetchUsers(this.props.user.token, page, (res) => {
        if (res) {
          this.setState({
            users: res.data.map((u) => {
              return {
                ...u,
                role:
                  u.profile && u.profile.role
                    ? u.profile.role.name
                    : "No role assigned",
                agent_code: u.profile.agent ? u.profile.agent.code : "N/A",
                commission: u.profile.agent ? u.profile.agent.commission : "N/A",
              };
            }),
            isLoading: false,
            pages: parseInt(res.pages),
          });
        }
      })
    );
  }

  componentDidMount() {
    let token = this.props.user.token
    fetchRoles(token, 1, (res) => {
      console.log(res);
      this.setState({ roles: res.data });
    });
    CRUD.list("/users/agents", token, {
      onSuccess: (res) => this.setState({ agents: res }),
      onFail: (res) => console.log(res),
    })
    this.refresh();
  }

  onRowClick(e, row) {
    console.log(row);
    this.setState({ selected: row, openForm: true });
  }

  newComplete() {
    this.setState({ openForm: false });
  }

  onAdd(params, cb) {
    createUser(this.props.user.token, params, (res) => {
      if (res) {
        cb(true);
        this.setState({ openForm: false, selected: null }, this.refresh);
      }
    });
  }
  onUpdate(params, cb) {
    updateUser(this.props.user.token, params, params.id, (res) => {
      if (res) {
        cb(true);
        this.setState({ openForm: false, selected: null }, this.refresh);
      }
    });
  }

  render() {
    const { isLoading, snackbar, openForm } = this.state;
    let { users, pages, pageNo, roles, selected, agents } = this.state;

    let data = {
      records: users,
      headers: [
        { field: "id", title: "ID" },
        { field: "username", title: "Username" },
        { field: "role", title: "Role" },
        { field: "agent_code", title: "Agent Code" },
        { field: "commission", title: "Commission" },
        {
          field: "action",
          title: "Action",
          render: (rowData) => (
            <button
              className="btn btn-sm btn-link text-danger"
              onClick={(e) => this.onDelete(e, rowData)}
            >
              <MatIcon name="delete" extra="text-danger" />
            </button>
          ),
        },
      ],
      title: "List of users",
    };

    const pagination = { pages, pageNo, onPageChange: this.onPageChange };

    let form = {
      title: "User Form",
      fields: [
        { name: "id", type: "hidden", value: selected ? selected.id : null },
        {
          name: "username",
          label: "Username",
          value: selected ? selected.username : "",
          validator: {
            valid: (val) => (val ? val.length >= 5 : false),
            error: "Username should be at least 5 characters",
          },
        },
        {
          name: "email",
          label: "Email",
          value: selected ? selected.email : "",
          type: "email",
          validator: {
            valid: (val) => isEmailValid(val),
            error: "Must be valid email address",
          },
        },
        {
          name: "role",
          label: "Role",
          type: "select",
          options: roles,
          value: selected ? selected.profile.role.id : "",
        },
        {
          name: "agent",
          label: "Under Agent",
          type: "select",
          value: selected && selected.profile.agent ? selected.profile.agent.id : "",
          options: agents
        },
        // {
        //   name: "commission",
        //   label: "Commission",
        //   type: "number",
        //   value: selected && selected.agent ? selected.agent.commission : "",
        // },
      ],
      onSubmit: selected ? this.onUpdate.bind(this) : this.onAdd.bind(this),
    };

    return (
      <div className="row">
        <div className="col">
          <div className="row pt-2 pb-2 d-flex">
            <div className="col-md">
              <h5>List of users</h5>
            </div>
            <div className="col-md">
              <div className="btn-group float-md-right">
                <button
                  className="btn btn-link p-0"
                  onClick={() => this.setState({ openForm: true })}
                >
                  <MatIcon name="add" extra="size-2" />
                </button>
              </div>
            </div>
          </div>
          <BasicCrudView
            title={data.title}
            data={data}
            pagination={pagination}
            onDeleteAll={this.doDeleteSelected}
            isLoading={isLoading}
            onRowClick={this.onRowClick.bind(this)}
          />
          {isLoading && <LoadingIndicator />}
          {snackbar && (
            <Snackbar
              message={snackbar.message}
              timeout={snackbar.timeout}
              done={this.snackDone}
              error={snackbar.error}
            />
          )}
          {openForm && (
            <Modal
              title={form.title}
              modalId="addUserForm"
              handleClose={() => this.newComplete()}
              content={
                <CommonForm
                  meta={{ ...form, title: null }}
                  newOptions={this.props.newOptions}
                  clearNewOption={this.props.clearNewOption}
                />
              }
            />
          )}
        </div>
      </div>
    );
  }
}

export default UsersPage;
