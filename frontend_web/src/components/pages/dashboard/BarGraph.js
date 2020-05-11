import React from "react";
import { ColorsHelper } from "../../../_helpers/ColorsHelper";

class BarGraph extends React.Component {
  componentDidMount() {
    const { graphId, meta } = this.props;
    console.log("datasets", meta.data);
    console.log("labels", meta.labels);
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
      tooltips: {
        callbacks: {
          label: function (tooltipItems, data) {
            let val = data.datasets[0].data[tooltipItems.index];
            return ` ${val.toLocaleString()}`;
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
