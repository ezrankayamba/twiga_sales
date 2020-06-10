import React from "react";
import "./Snackbar.css";

class Snackbar extends React.Component {
  constructor(props) {
    super(props);
    this.state = { show: true };
  }

  componentDidMount() {
    setTimeout(() => {
      this.setState({ show: false });
      this.props.done();
    }, this.props.timeout);
  }

  render() {
    console.log(this.state);
    const { error } = this.props;
    return this.state.show ? (
      <div id="snackbar" className={`${error ? "error " : ""}show`}>
        {this.props.message}
      </div>
    ) : (
      false
    );
  }
}

export default Snackbar;
