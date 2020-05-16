import React, { useState, useEffect } from "react";

import CRUD from "../../../../_services/CRUD";
import { DateTime } from "../../../../_helpers/DateTime";
import FileDownload from "../../../../_helpers/FileDownload";
import BasicCrudView from "../../../utils/crud/BasicCrudView";
import MatIcon from "../../../utils/icons/MatIcon";

const DateRangeReport = ({ user }) => {
  const [sales, setSales] = useState([]);
  const [filter, setFilter] = useState(null);
  const exportSales = () => {
    const fname = `${Date.now()}_Sales_Report.xlsx`;
    const getFile = (res) => FileDownload.get(res, fname);
    const logError = (err) => console.error(err);
    const token = user.token;
    CRUD.export("/reports/export", token, {
      filter,
      onSuccess: getFile,
      onFail: logError,
    });
  };
  const getDoc = (sale, type) => {
    let t = sale.docs.find((typ) => typ.doc_type === type);
    let res = t ? t.file : null;
    return res;
  };
  const getRef = (sale, type) => {
    let t = sale.docs.find((typ) => typ.doc_type === type);
    let res = t ? t.ref_number : null;
    return res;
  };
  const mapSaleRecord = (c) => {
    return {
      ...c,
      c2_ref: getRef(c, "C2"),
      assessment_ref: getRef(c, "Assessment"),
      exit_ref: getRef(c, "Exit"),
      c2_doc: getDoc(c, "C2"),
      assessment_doc: getDoc(c, "Assessment"),
      exit_doc: getDoc(c, "Exit"),
      transaction_date: DateTime.fmt(c.transaction_date, "DD/MM/YYYY"),
      created_at: DateTime.fmt(c.created_at),
      agent: c.agent ? c.agent.code : null,
    };
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
    CRUD.search("/reports/search", user.token, params, {
      onSuccess: (res) => {
        console.log(res);
        setSales(res.data.map(mapSaleRecord));
      },
      onFail: (err) => console.log(err),
    });
  }, []);
  const onSearch = (params) => {
    setFilter(params);
    CRUD.search("/reports/search", user.token, params, {
      onSuccess: (res) => {
        console.log(res);
        setSales(res.data.map(mapSaleRecord));
      },
      onFail: (err) => console.log(err),
    });
  };

  let data = {
    records: sales,
    headers: [
      {
        field: "id",
        title: "ID",
        search: {
          type: "date",
          label: "From",
          name: "date_from",
        },
      },
      {
        field: "transaction_date",
        title: "Trans Date",
        search: {
          type: "date",
          label: "To",
          name: "date_to",
        },
      },
      {
        field: "customer_name",
        title: "Customer",
      },
      { field: "delivery_note", title: "Delivery Note" },
      {
        field: "vehicle_number",
        title: "Veh#",
      },
      {
        field: "tax_invoice",
        title: "Tax Invoice",
      },
      {
        field: "sales_order",
        title: "SO#",
      },
      { field: "product_name", title: "Product" },
      { field: "quantity", title: "Qty(Tons)" },
      { field: "total_value", title: "Value" },
      { field: "destination", title: "Destination" },
      { field: "agent", title: "Agent" },
    ],
    title: "List of sales",
    onSearch: onSearch,
  };

  return (
    <>
      <div className="list-toolbar">
        <h5>{data.title}</h5>
        <div className="">
          <div className="float-right btn-group">
            <button
              className="btn btn-outline-primary btn-sm ml-2"
              onClick={exportSales}
            >
              <MatIcon name="arrow_downward" />
              Export Sales
            </button>
          </div>
        </div>
      </div>
      <BasicCrudView data={data} />
    </>
  );
};

export default DateRangeReport;
