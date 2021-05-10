import React, { useEffect, useState } from "react";
import Graph from "./Graph";
import "./Dashboard.css";
import CRUD from "../../../_services/CRUD";
import BarGraph from "./BarGraph";
import LoadingIndicator from "../../utils/loading/LoadingIndicator";

const Dashboard = ({ onDataClick, user }) => {
  const currentYear = new Date().getFullYear()
  const [meta1, setMeta1] = useState(null)
  const [destQty, setDestQty] = useState(null)
  const [destVal, setDestVal] = useState(null)
  const [destVol, setDestVol] = useState(null)
  const [filter, setFilter] = useState({ 'year': currentYear })
  const [colors, setColors] = useState(null)
  const [loading, setLoading] = useState(false)
  const years = []
  for (let y = 2018; y <= currentYear; y++) {
    years.push(y)
  }
  const serialize = function (obj) {
    var str = [];
    for (var p in obj)
      if (obj.hasOwnProperty(p)) {
        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
      }
    return str.join("&");
  }


  let handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter({ ...filter, [name]: value })
  }

  useEffect(() => {
    const token = user.token;
    setLoading(true)
    CRUD.list(`/sales/summary?${serialize(filter)}`, token, {
      onSuccess: (res) => {
        let sumary = {
          data: res.summary,
        };
        let clrs = sumary.data.map((d) => d.color);
        setMeta1(sumary)
        setColors(clrs)
      }
    })
    CRUD.list(`/reports/destination?${serialize(filter)}`, token, {
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
        setDestQty({
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
        })
        setDestVal({
          data: [
            { ...barProps, label: "Value of sales", data: sales.value },
            {
              ...lineProps,
              label: "Value with complete docs",
              data: completed.value,
            },
          ],
          labels,
        })
        setDestVol({
          data: [
            { ...barProps, label: "Volume of sales", data: sales.volume },
            {
              ...lineProps,
              label: "Volume with complete docs",
              data: completed.volume,
            },
          ],
          labels,
        })
        setLoading(false)
      },
      onFail: (err) => console.error(err),
    });
  }, [filter])


  return (
    <div className="dashboard">
      <div>
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
      <div className="filter-form-wrap">
        <form>
          <h5>Filter-graphs</h5>
          <div className="input-control">
            <label>Year</label>
            <select name="year" value={filter["year"]} onChange={handleFilterChange} className="form-control p-2">
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </form>
      </div>
      {loading && <LoadingIndicator isLoading={loading} />}
    </div>
  );
}
export default Dashboard;
