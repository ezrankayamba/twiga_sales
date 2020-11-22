import React, { Component } from "react";
import { connect } from "react-redux";
import BasicCrudView from "../../utils/crud/BasicCrudView";
import CRUD from "../../../_services/CRUD";
import Modal from "../../modal/Modal";
import ManageRequest from "../notifications/ManageRequest";
@connect((state) => {
  return {
    user: state.auth.user,
  };
})
class ListOfRequests extends Component {
  state = { requests: [], pageNo: 1, selected: null };
  refresh(pageNo = 1) {
    CRUD.listPaginated(`/makerchecker`, this.props.user.token, {
      onSuccess: (res) => {
        console.log(res);
        this.setState({
          pages: parseInt(res.pages),
          requests: res.data.data.map((b) => {
            return {
              ...b,
            };
          }),
        });
      },
      onFail: (res) => console.error(res),
      page: pageNo,
    });
  }
  componentDidMount() {
    this.refresh();
  }
  onPageChange(pageNo) {
    this.setState({ pageNo });
    this.refresh(pageNo);
  }
  render() {
    const { requests, selected } = this.state;

    const data = {
      records: requests,
      headers: [
        { field: "id", title: "ID" },
        {
          field: "maker",
          title: "Requester",
          render: (row) => <span>{row.maker.username}</span>,
        },
        { field: "maker_comment", title: "Requester Comment" },
        {
          field: "task_type",
          title: "Type",
          render: (row) => <span>{row.task_type.name}</span>,
        },
        { field: "reference", title: "Reference" },
        { field: "status", title: "Status" },
        {
          field: "checker",
          title: "Approver",
          render: (row) => (
            <span>{row.checker ? row.checker.username : null}</span>
          ),
        },
        { field: "checker_comment", title: "Approver Comment" },
      ],
    };
    return (
      <div className="batches-container">
        <h5>List of requests</h5>
        <BasicCrudView
          data={data}
          onRowClick={(e, row) => this.setState({ selected: row })}
        />
        {selected && (
          <Modal
            title="Request Details"
            handleClose={() => this.setState({ selected: null })}
            content={
              <ManageRequest
                task={selected}
                token={this.props.user.token}
                user={this.props.user}
                done={() => {
                  this.setState({ selected: null }, this.refresh);
                }}
              />
            }
          />
        )}
      </div>
    );
  }
}

export default ListOfRequests;
