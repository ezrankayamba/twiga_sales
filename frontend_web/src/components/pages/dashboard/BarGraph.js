import React, { useEffect, useRef } from "react";
import Numbers from "../../../_helpers/Numbers";

const BarGraph = ({ graphId, title, meta }) => {
  const canvasRef = useRef(null)

  useEffect(() => {
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

    let chart = new Chart(canvasRef.current, {
      type: "bar",
      data: data,
      options: options,
    });

    return () => chart.destroy()
  }, [meta])

  return (
    <div className="grapg-container bg-white card p-2">
      <h6>{title}</h6>
      <canvas ref={canvasRef} id={graphId} className="graph" style={{}}></canvas>
    </div>
  );
}

export default BarGraph;
