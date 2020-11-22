import React from "react";
import WsHandler from "../../../_helpers/WsHandler";
import CRUD from "../../../_services/CRUD";
import { connect } from "react-redux";
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
      <div className="notification-buble">
        <a href="/batches">
          Results <span>{count}</span>
        </a>
      </div>
    );
  }
}

export default BatchBuble;
