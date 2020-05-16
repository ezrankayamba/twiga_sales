import React, { Component } from "react";
import MatIcon from "../icons/MatIcon";

class LoadingIndicator extends Component {
  render() {
    const { isLoading } = this.props;
    return isLoading ? (
      <div className="loading-indicator">
        <MatIcon name="autorenew" extra="size-2" />
      </div>
    ) : null;
  }
}

export default LoadingIndicator;
