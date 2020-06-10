import React from "react";
import { ColorsHelper } from "../../../_helpers/ColorsHelper";
import Numbers from "../../../_helpers/Numbers";

class BarGraph extends React.Component {
  componentDidMount() {
    const { graphId, meta } = this.props;
    const data = {
      datasets: meta.data,
      labels: meta.labels,
    };
    const options = {
      plugins: {
        datalabels: {
          display: false,
        },
      },
      hover: {
        mode: "index",
        intersect: false,
      },
      tooltips: {
        mode: "index",
        intersect: false,
        callbacks: {
          label: function (tooltipItem, data) {
            let ds = data.datasets[tooltipItem.datasetIndex];
            let val = ds.data[tooltipItem.index];
            let lab = ds.label;
            return `${Numbers.fmt(val)} : ${lab}`;
          },
        },
      },
      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero: false,
              callback: function (value, index, values) {
                return value.toLocaleString();
              },
            },
          },
        ],
      },
    };

    new Chart(document.getElementById(graphId), {
      type: "bar",
      data: data,
      options: options,
    });
  }
  render() {
    const { graphId, title } = this.props;
    return (
      <div className="grapg-container bg-white card p-2">
        <h6>{title}</h6>
        <canvas id={graphId} className="graph" style={{}}></canvas>
      </div>
    );
  }
}

export default BarGraph;
