import React, { useState } from "react";
import WsHandler from "../_helpers/WsHandler";
import UUID from "../_helpers/UUID";
import { BASE_URL, SERVER_HOST, SERVER_URL } from "../conf";
import MatIcon from "./utils/icons/MatIcon";
const localUuid = UUID.get();
class BackendNotification extends React.Component {
  state = { ws: null, stack: [] };

  closeMsg(e) {
    e.stopPropagation();
    const { stack } = this.state;
    if (stack.length) {
      stack.pop();
      this.setState({ stack: [...stack] });
    }
  }

  componentDidMount() {
    this.setState({
      ws: WsHandler(
        (msg) => {
          console.log(msg, this);
          this.setState({ stack: [...this.state.stack, msg.data] });
        },
        () => {
          console.log("Connected");
        }
      ),
    });
  }
  render() {
    const { stack } = this.state;
    const message = stack.length ? stack[0] : null;
    return (
      message && (
        <div className="backend-notification">
          <button
            className="close text-warning btn btn-sm btn-link"
            onClick={this.closeMsg.bind(this)}
          >
            X
          </button>
          {message.file_in && (
            <a
              download
              className="btn btn-sm btn-outline-secondary btn-sm"
              href={`${SERVER_URL}${message.file_in}`}
            >
              <MatIcon name="arrow_downward" /> Uploaded file
            </a>
          )}
          {message.file_out && (
            <a
              download
              className="btn btn-sm btn-outline-primary btn-sm"
              href={`${SERVER_URL}${message.file_out}`}
            >
              <MatIcon name="arrow_downward" /> Result file
            </a>
          )}
        </div>
      )
    );
  }
}

export default BackendNotification;
