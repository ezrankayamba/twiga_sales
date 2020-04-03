import React from "react";
import { ColorsHelper } from "../../../_helpers/ColorsHelper";
const LineChart = require("react-chartjs").Line;

class Graph extends React.Component {
  componentDidMount() {
    const { meta, colors } = this.props;
    let bgColors = colors || ColorsHelper.randomColors(meta.data.length);
    let fntColors = ColorsHelper.contrastColors(bgColors);
    let options = {
      plugins: {
        datalabels: {
          color: fntColors
        }
      }
    };
    let data = {
      datasets: [
        {
          data: meta.data.map(d => d.value),
          backgroundColor: bgColors
        }
      ],
      labels: meta.data.map(d => d.name)
    };
    var myPieChart = new Chart(document.getElementById("graph"), {
      type: "pie",
      data: data,
      options: options
    });
    console.log(myPieChart);
  }
  render() {
    return (
      <div className="grapg-container bg-white card p-2">
        <canvas id="graph" className="graph" style={{}}></canvas>
      </div>
    );
  }
}

export default Graph;
