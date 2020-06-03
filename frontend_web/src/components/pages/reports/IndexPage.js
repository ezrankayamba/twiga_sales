import React, { Component, useState } from "react";
import { connect } from "react-redux";
import "./Reports.css";
import DateRangeReport from "./forms/DateRangeReport";
import CustomerReport from "./forms/CustomerReport";

@connect((state) => {
  return {
    user: state.auth.user,
  };
})
class IndexPage extends Component {
  state = { tab: null, tabs: [] };
  componentDidMount() {
    const tabs = [
      {
        name: "General Report",
        form: <DateRangeReport user={this.props.user} />,
      },
      {
        name: "Customer Performance Report",
        form: <CustomerReport user={this.props.user} />,
      },
    ];
    this.setState({ tab: tabs[0], tabs: tabs });
  }
  render() {
    const { tab, tabs } = this.state;
    const isActive = (r) => {
      return r.name === tab.name;
    };
    return tab ? (
      <div id="reports">
        <ul>
          {tabs.map((r) => {
            return (
              <li
                className={isActive(r) ? "active" : null}
                onClick={() => this.setState({ tab: r })}
              >
                <h6>{r.name}</h6>
              </li>
            );
          })}
        </ul>
        <div className="report-container">
          {tabs.map((r) => {
            return isActive(r) && r.form;
          })}
        </div>
      </div>
    ) : null;
  }
}

export default IndexPage;
