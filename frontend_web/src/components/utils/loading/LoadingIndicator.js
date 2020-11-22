import React, { Component } from "react";
import MatIcon from "../icons/MatIcon";

class LoadingIndicator extends Component {
  render() {
    const { isLoading } = this.props;
    return isLoading ? (
      <div className="loading-indicator">
        <p>Loading, please wait...</p>
      </div>
    ) : null;
  }
}

export default LoadingIndicator;
