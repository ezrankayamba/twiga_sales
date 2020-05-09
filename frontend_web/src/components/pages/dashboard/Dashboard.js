import React from "react";
import Graph from "./Graph";
import "./Dashboard.css";
import { fetchSalesSummary } from "../../../_services/SalesService";

class Dashboard extends React.Component {
  state = { meta1: null };
  componentDidMount() {
    fetchSalesSummary(this.props.user.token, 1, (res) => {
      let meta1 = {
        data: res.data.summary,
      };
      let colors = meta1.data.map((d) => d.color);
      this.setState({ meta1, colors });
    });
  }
  render() {
    const { meta1, colors } = this.state;
    const { onDataClick } = this.props;

    return (
      <div>
        <h6>Sales vs Docs Summary</h6>
        {meta1 && (
          <Graph meta={meta1} colors={colors} onDataClick={onDataClick} />
        )}
      </div>
    );
  }
}
export default Dashboard;
