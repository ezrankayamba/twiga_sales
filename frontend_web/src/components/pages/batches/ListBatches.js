import React, { Component } from "react";
import { connect } from "react-redux";
import BasicCrudView from "../../utils/crud/BasicCrudView";
import CRUD from "../../../_services/CRUD";
import { SERVER_URL } from "../../../conf";
import MatIcon from "../../utils/icons/MatIcon";
@connect((state) => {
  return {
    user: state.auth.user,
  };
})
class ListBatches extends Component {
  state = { batches: [], pageNo: 1 };
  refresh(pageNo = 1) {
    CRUD.listPaginated(`/batches`, this.props.user.token, {
      onSuccess: (res) =>
        this.setState(
          {
            pages: parseInt(res.pages),
            batches: res.data.map((b) => {
              return {
                ...b,
                user: b.user.username,
              };
            }),
          },
          () => {
            CRUD.update("/batches/unread", this.props.user.token, {}, null, {
              onSuccess: (res) => console.log(res),
            });
          }
        ),
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
    const { batches, pages, pageNo } = this.state;
    const pagination = {
      pages,
      pageNo,
      onPageChange: this.onPageChange.bind(this),
    };
    const getUrl = (file) => {
      let url = `${SERVER_URL}${file}`;
      console.log(url);
    };
    const data = {
      records: batches,
      headers: [
        { field: "id", title: "ID" },
        { field: "user", title: "User" },
        { field: "created_at", title: "Uploaded" },
        {
          field: "file_in",
          title: "Batch",
          render: (row) => {
            let parts = row.file_in.split("/");
            let name = parts[parts.length - 1];
            return (
              <a className="btn btn-sm" href={`${row.file_in}`}>
                <MatIcon name="arrow_downward" /> {name}
              </a>
            );
          },
        },
        {
          field: "file_out",
          title: "Result",
          render: (row) => {
            if (!row.file_out) {
              return "Not available";
            }
            let parts = row.file_out.split("/");
            let name = parts[parts.length - 1];
            return (
              <a className="btn btn-sm" href={`${row.file_out}`}>
                <MatIcon name="arrow_downward" /> {name}
              </a>
            );
          },
        },
        {
          field: "status",
          title: "Status",
          render: (row) => (row.status ? "Completed" : "Processing"),
        },
      ],
      title: "List of batches",
    };
    return (
      <div className="batches-container">
        <h5>List of batches</h5>
        <BasicCrudView data={data} pagination={pagination} />
      </div>
    );
  }
}

export default ListBatches;
