import React, { useState } from "react";
import WsHandler from "../_helpers/WsHandler";
import UUID from "../_helpers/UUID";
import { BASE_URL, SERVER_HOST, SERVER_URL } from "../conf";
import MatIcon from "./utils/icons/MatIcon";
import CRUD from "../_services/CRUD";
import { connect } from "react-redux";
const localUuid = UUID.get();
@connect((state) => {
  return {
    user: state.auth.user,
  };
})
class BatchBuble extends React.Component {
  state = { ws: null, count: 0 };

  refresh() {
    CRUD.list("/batches/unread", this.props.user.token, {
      onSuccess: (res) => this.setState({ count: res.data }),
    });
  }
  componentDidMount() {
    this.setState({
      ws: WsHandler(
        (msg) => {
          console.log(msg, this);
          this.refresh();
        },
        () => {
          this.refresh();
        }
      ),
    });
  }
  render() {
    const { count } = this.state;
    return (
      <div className="batch-buble">
        <a href="/batches">
          <MatIcon name="notifications" />
          {count ? <span className="notifications-count">{count}</span> : null}
        </a>
      </div>
    );
  }
}

export default BatchBuble;
