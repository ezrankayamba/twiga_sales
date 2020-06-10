import React from "react";
import Graph from "./Graph";
import "./Dashboard.css";
import { fetchSalesSummary } from "../../../_services/SalesService";
import CRUD from "../../../_services/CRUD";
import BarGraph from "./BarGraph";

class Dashboard extends React.Component {
  state = { meta1: null, destQty: null, destVal: null, destVol: null };
  componentDidMount() {
    const token = this.props.user.token;
    fetchSalesSummary(token, 1, (res) => {
      let meta1 = {
        data: res.data.summary,
      };
      let colors = meta1.data.map((d) => d.color);
      this.setState({ meta1, colors });
    });
    CRUD.list("/reports/destination", token, {
      onSuccess: (res) => {
        let data = res.data;
        let sales = { qty: [], value: [], volume: [] };
        let completed = { qty: [], value: [], volume: [] };
        let labels = [];
        Object.keys(data).forEach((key) => {
          labels.push(key);
          let withdocs = data[key].withdocs;
          let nodocs = data[key].nodocs;
          sales.qty.push(withdocs.qty + nodocs.qty);
          sales.value.push(withdocs.value + nodocs.value);
          sales.volume.push(withdocs.volume + nodocs.volume);

          completed.qty.push(withdocs.qty);
          completed.value.push(withdocs.value);
          completed.volume.push(withdocs.volume);
        });
        let lineProps = {
          backgroundColor: "#3FF",
          borderWidth: 1,
        };
        let barProps = {
          backgroundColor: "rgba(255, 212, 0, .5)",
          borderWidth: 1,
        };
        this.setState({
          destQty: {
            data: [
              {
                ...barProps,
                label: "Quantity of sales",
                data: sales.qty,
              },
              {
                ...lineProps,
                label: "Quantity with completed docs",
                data: completed.qty,
              },
            ],
            labels,
          },
          destVal: {
            data: [
              { ...barProps, label: "Value of sales", data: sales.value },
              {
                ...lineProps,
                label: "Value with complete docs",
                data: completed.value,
              },
            ],
            labels,
          },
          destVol: {
            data: [
              { ...barProps, label: "Volume of sales", data: sales.volume },
              {
                ...lineProps,
                label: "Volume with complete docs",
                data: completed.volume,
              },
            ],
            labels,
          },
        });
      },
      onFail: (err) => console.error(err),
    });
  }
  render() {
    const { meta1, colors, destQty, destVal, destVol } = this.state;
    const { onDataClick } = this.props;

    return (
      <div className="dashboard">
        <div className="row">
          {meta1 && (
            <Graph
              title="Sales vs Docs Summary"
              graphId="sales-vs-docs"
              meta={meta1}
              colors={colors}
              onDataClick={onDataClick}
            />
          )}
          {destQty && (
            <BarGraph
              meta={destQty}
              title="Quantity per Destination Country"
              graphId="dest-qty"
            />
          )}
        </div>
        <div className="row pt-2">
          {destVal && (
            <BarGraph
              meta={destVal}
              title="Value per Destination Country"
              graphId="dest-value"
            />
          )}
          {destVol && (
            <BarGraph
              meta={destVol}
              title="Volume per Destination Country"
              graphId="dest-volume"
            />
          )}
        </div>
      </div>
    );
  }
}
export default Dashboard;
