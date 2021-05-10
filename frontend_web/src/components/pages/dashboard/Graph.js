import React, { useEffect, useRef } from "react";
import { ColorsHelper } from "../../../_helpers/ColorsHelper";

const Graph = ({ meta, colors, onDataClick, title }) => {
  const canvasRef = useRef(null)
  useEffect(() => {
    let bgColors = colors || ColorsHelper.randomColors(meta.data.length);
    let fntColors = ColorsHelper.contrastColors(bgColors);
    let options = {
      legend: {
        position: "right",
      },
      plugins: {
        datalabels: {
          formatter: (value, ctx) => {
            let sum = 0;
            let dataArr = ctx.chart.data.datasets[0].data;
            dataArr.map((data) => {
              sum += data;
            });
            let percentage = ((value * 100) / sum).toFixed(0) + "%";
            return percentage;
          },
          color: fntColors,
        },
      },
      onClick: (_, els) => {
        if (els && els.length && onDataClick) {
          let data = meta.data.slice(els[0]._index, els[0]._index + 1)[0];
          onDataClick(data);
        }
      },
    };
    let data = {
      datasets: [
        {
          data: meta.data.map((d) => d.value),
          backgroundColor: bgColors,
        },
      ],
      labels: meta.data.map((d) => d.name),
    };

    let chart = new Chart(canvasRef.current, {
      type: "pie",
      data: data,
      options: options,
    });

    return () => chart.destroy()
  }, [meta])

  return (
    <div className="grapg-container bg-white card p-2">
      <h6>{title}</h6>
      <canvas ref={canvasRef} className="graph" style={{}}></canvas>
    </div>
  );
}

export default Graph;
