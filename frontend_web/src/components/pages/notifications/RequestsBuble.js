import React from "react";
import WsHandler from "../../../_helpers/WsHandler";
import CRUD from "../../../_services/CRUD";
import { connect } from "react-redux";
@connect((state) => {
  return {
    user: state.auth.user,
  };
})
class RequestsBuble extends React.Component {
  state = { ws: null, count: 0 };

  refresh() {
    CRUD.list("/makerchecker?pending=1", this.props.user.token, {
      onSuccess: (res) => this.setState({ count: res.count }),
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
        <a href="/requests">
          Requests <span>{count}</span>
        </a>
      </div>
    );
  }
}

export default RequestsBuble;
