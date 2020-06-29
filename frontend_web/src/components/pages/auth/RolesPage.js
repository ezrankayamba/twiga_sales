import React, { Component } from "react";
import { connect } from "react-redux";
import {
  createOrUpdateRole,
  fetchRoles,
  fetchPrivs,
  deleteRole,
} from "../../../_services/AuthService";
import { clearNewOption } from "../../../redux/forms/actions";
import CommonForm from "../../utils/form/CommonForm";
import Modal from "../../modal/Modal";
import Snackbar from "../../utils/notify/Snackbar";
import LoadingIndicator from "../../utils/loading/LoadingIndicator";
import BasicCrudView from "../../utils/crud/BasicCrudView";
import MatIcon from "../../utils/icons/MatIcon";

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
class RolesPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      roles: [],
      privs: [],
      isLoading: false,
      openAdd: false,
      openEdit: false,
      pages: 1,
      pageNo: 1,
      selected: null,
    };
    this.snackDone = this.snackDone.bind(this);
    this.newComplete = this.newComplete.bind(this);
    this.onPageChange = this.onPageChange.bind(this);
    this.onAdd = this.onAdd.bind(this);
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
    deleteRole(this.props.user.token, row.id, (res) => {
      if (res) {
        this.refresh();
      }
    });
  }

  refresh(page = 1) {
    this.setState({ isLoading: true, pageNo: page }, () =>
      fetchRoles(this.props.user.token, page, (res) => {
        if (res) {
          this.setState({
            roles: res.data.map((u) => {
              return {
                ...u,
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
    fetchPrivs(this.props.user.token, (res) => {
      this.setState({ privs: res }, this.refresh);
    });
  }

  onRowClick(_, row) {
    this.setState({ selected: row, openEdit: true });
  }

  newComplete() {
    this.setState({ openAdd: false, openEdit: false });
  }

  getForm(data = null) {
    console.log(data);
    return {
      fields: [
        {
          name: "name",
          label: "Name",
          value: data ? data.name : null,
          validator: {
            valid: (val) => (val ? val.length >= 3 : false),
            error: "Name should be at least 3 characters",
          },
        },
        {
          name: "id",
          value: data ? data.id : null,
          type: "hidden",
        },
        {
          name: "privileges",
          type: "checkbox",
          label: "Privileges",
          options: this.state.privs,
          multiple: true,
          value: data ? data.privileges : null,
        },
      ],
      onSubmit: this.onAdd.bind(this),
    };
  }

  onAdd(params, cb) {
    createOrUpdateRole(this.props.user.token, params, (res) => {
      if (res) {
        cb(true);
        this.setState(
          { openAdd: false, openEdit: false, selected: null },
          this.refresh
        );
      }
    });
  }

  render() {
    const { isLoading, snackbar, openAdd, selected, openEdit } = this.state;
    let { roles, pages, pageNo, privs } = this.state;

    let data = {
      records: roles,
      headers: [
        { field: "id", title: "ID" },
        { field: "name", title: "Role Name" },
        {
          field: "privileges",
          title: "Privileges",
          render: (row) => {
            return row.privileges.map((p) => (
              <span className="inline-item">
                {privs.find((prv) => prv.id === p).name}
              </span>
            ));
          },
        },
        {
          field: "action",
          title: "Action",
          render: (rowData) => (
            <button
              className="btn btn-sm btn-link text-danger p-0"
              onClick={(e) => this.onDelete(e, rowData)}
            >
              <MatIcon name="delete" />
            </button>
          ),
        },
      ],
      title: "List of roles",
    };

    const pagination = { pages, pageNo, onPageChange: this.onPageChange };

    let form = this.getForm();
    return (
      <div>
        <div className="list-toolbar">
          <h5>List of roles</h5>
          <div className="btn-group float-right">
            <button
              className="btn btn-link p-0"
              onClick={() => this.setState({ openAdd: true })}
            >
              <MatIcon name="add" extra="size-2" />
            </button>
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
        <LoadingIndicator isLoading={isLoading} />
        {snackbar && (
          <Snackbar
            message={snackbar.message}
            timeout={snackbar.timeout}
            done={this.snackDone}
            error={snackbar.error}
          />
        )}
        {openAdd && (
          <Modal
            title="New Role"
            modalId="addRoleForm"
            handleClose={() => this.newComplete()}
            show={openAdd}
            content={
              <CommonForm
                meta={{ ...form, title: null }}
                newOptions={this.props.newOptions}
                clearNewOption={this.props.clearNewOption}
              />
            }
          />
        )}
        {openEdit && (
          <Modal
            title={"Edit Role"}
            modalId="editRoleForm"
            handleClose={() => this.newComplete()}
            show={openEdit}
            content={
              <CommonForm
                meta={this.getForm(selected)}
                newOptions={this.props.newOptions}
                clearNewOption={this.props.clearNewOption}
              />
            }
          />
        )}
      </div>
    );
  }
}

export default RolesPage;
