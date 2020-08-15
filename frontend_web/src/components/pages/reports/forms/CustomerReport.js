import React, { useState, useEffect } from "react";

import CRUD from "../../../../_services/CRUD";
import FileDownload from "../../../../_helpers/FileDownload";
import BasicCrudView from "../../../utils/crud/BasicCrudView";
import MatIcon from "../../../utils/icons/MatIcon";
import Numbers from "../../../../_helpers/Numbers";

const CustomerReport = ({ user }) => {
  const [sales, setSales] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [filter, setFilter] = useState(null);
  const exportCustomers = () => {
    const fname = `${Date.now()}_Customers_Report.xlsx`;
    const getFile = (res) => FileDownload.get(res, fname);
    const logError = (err) => console.error(err);
    const token = user.token;
    console.log(filter);
    const params = filter ? { ...filter, export: true } : { export: true };
    console.log(params);
    CRUD.export("/reports/customers", token, {
      filter: params,
      onSuccess: getFile,
      onFail: logError,
    });
  };
  function fetchData() {
    CRUD.search("/reports/customers", user.token, filter, {
      onSuccess: (res) => {
        console.log(res);
        setSales(
          res.data.data.map((row) => {
            let pct_value = (row.total_value2 || 0) / row.total_value;
            let pct_volume = (row.total_volume2 || 0) / row.total_volume;
            // console.log(row.customer_name, pct_value, pct_volume);
            return {
              ...row,
              total_value: Numbers.fmt(row.total_value),
              total_volume: Numbers.fmt(row.total_volume),
              total_value2: Numbers.fmt(row.total_value2 || 0),
              total_volume2: Numbers.fmt(row.total_volume2 || 0),
              pct_value: pct_value,
              pct_volume: Numbers.dpts(100 * pct_volume),
              id: row.customer_name,
            };
          })
        );
      },
      onFail: (err) => console.log(err),
    });
  }
  useEffect(() => {
    fetchData();
    CRUD.list("/sales/destinations", user.token, {
      onSuccess: (res) =>
        setDestinations(
          res.data.map((d) => {
            return { name: d.destination, id: d.destination };
          })
        ),
    });
  }, [filter]);
  //columns = ['customer_name', 'qty', 'total_value', 'total_volume', 'total_value2', 'total_volume2']
  let data = {
    records: sales,
    headers: [
      {
        field: "customer_name",
        title: "Customer",
        search: {
          name: "destination",
          label: "Destination Country",
          type: "select",
          options: destinations,
        },
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
    onSearch: (params) => {
      console.log(params);
      setFilter({ ...params });
      //   fetchData();
    },
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
