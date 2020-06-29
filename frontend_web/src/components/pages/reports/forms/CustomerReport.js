import React, { useState, useEffect } from "react";

import CRUD from "../../../../_services/CRUD";
import { DateTime } from "../../../../_helpers/DateTime";
import FileDownload from "../../../../_helpers/FileDownload";
import BasicCrudView from "../../../utils/crud/BasicCrudView";
import MatIcon from "../../../utils/icons/MatIcon";
import Numbers from "../../../../_helpers/Numbers";

const CustomerReport = ({ user }) => {
  const [sales, setSales] = useState([]);
  const [filter, setFilter] = useState(null);
  const exportCustomers = () => {
    const fname = `${Date.now()}_Customers_Report.xlsx`;
    const getFile = (res) => FileDownload.get(res, fname);
    const logError = (err) => console.error(err);
    const token = user.token;
    CRUD.export("/reports/customers", token, {
      filter,
      onSuccess: getFile,
      onFail: logError,
    });
  };

  useEffect(() => {
    const fmtStr = "YYYY-MM-DD";
    let date = new Date();
    let now = DateTime.fmt(date, fmtStr);
    let firstDay = DateTime.fmt(
      new Date(date.getFullYear(), date.getMonth(), 1),
      fmtStr
    );
    let params = { date_from: firstDay, date_to: now };
    setFilter(params);
    CRUD.list("/reports/customers", user.token, {
      onSuccess: (res) => {
        setSales(
          res.data.map((row) => {
            let pct_value = (row.total_value2 || 0) / row.total_value;
            let pct_volume = (row.total_volume2 || 0) / row.total_volume;
            console.log(row.customer_name, pct_value, pct_volume);
            return {
              ...row,
              total_value: Numbers.fmt(row.total_value),
              total_volume: Numbers.fmt(row.total_volume),
              total_value2: Numbers.fmt(row.total_value2 || 0),
              total_volume2: Numbers.fmt(row.total_volume2 || 0),
              pct_value: pct_value,
              pct_volume: Numbers.dpts(100 * pct_volume),
            };
          })
        );
      },
      onFail: (err) => console.log(err),
    });
  }, []);
  //columns = ['customer_name', 'qty', 'total_value', 'total_volume', 'total_value2', 'total_volume2']
  let data = {
    records: sales,
    headers: [
      {
        field: "customer_name",
        title: "Customer",
      },
      { field: "qty", title: "Count" },
      {
        field: "total_value",
        title: "Factory Value",
      },
      {
        field: "total_volume",
        title: "Factory Volume",
      },
      { field: "total_value2", title: "Border Value" },
      { field: "total_volume2", title: "Border Volume" },
      { field: "pct_volume", title: "% Volume" },
    ],
    title: "List of customers",
  };

  return (
    <>
      <div className="list-toolbar">
        <h5>{data.title}</h5>
        <div className="wrap">
          <div className="btn-group float-right">
            <button
              className="btn btn-sm btn-outline-primary"
              onClick={exportCustomers}
            >
              <MatIcon name="arrow_downward" /> Export Customers
            </button>
          </div>
        </div>
      </div>
      <BasicCrudView data={data} />
    </>
  );
};

export default CustomerReport;
