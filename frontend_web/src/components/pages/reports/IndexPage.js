import React, { Component, useState } from "react";
import { connect } from "react-redux";
import List from "./List";
import "./Reports.css";
import OverThresholdReport from "./forms/OverThresholdReport";
import UnmatchedReport from "./forms/UnmatchedReport";

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
        name: "Sales > 14 Days Unmatched",
        form: (
          <div className="report-form">
            <OverThresholdReport user={this.props.user} />
          </div>
        ),
      },
      {
        name: "Sales with values mismatch",
        form: <UnmatchedReport user={this.props.user} />,
      },
      {
        name: "Monthly Report",
        form: <div className="report-form">My Form here ...3</div>,
      },
      {
        name: "Agent Reconciliation Report",
        form: <div className="report-form">My Form here ...4</div>,
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
