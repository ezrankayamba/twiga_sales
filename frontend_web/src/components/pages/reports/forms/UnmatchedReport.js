import React, { useState, useEffect } from "react";

import CRUD from "../../../../_services/CRUD";
import { BasicCrudView } from "neza-react-tables";
import { DateTime } from "../../../../_helpers/DateTime";

const UnmatchedReport = ({ user }) => {
  const [sales, setSales] = useState([]);
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
    CRUD.list("/reports/unmatched", user.token, {
      onSuccess: (res) => {
        console.log(res);
        setSales(res.data.map(mapSaleRecord));
      },
      onFail: (err) => console.log(err),
    });
  }, []);
  const onSearch = (params) => {
    CRUD.search("/reports/unmatched", user.token, params, {
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
      { field: "id", title: "ID" },
      { field: "transaction_date", title: "Trans Date" },
      {
        field: "customer_name",
        title: "Customer",
        search: {
          type: "input",
          label: "Customer Name",
          name: "customer_name",
        },
      },
      { field: "delivery_note", title: "Delivery Note" },
      {
        field: "vehicle_number",
        title: "Veh#",
        search: {
          type: "input",
          label: "Vehicle No",
          name: "vehicle_number",
        },
      },
      {
        field: "tax_invoice",
        title: "Tax Invoice",
        search: {
          type: "input",
          label: "Tax Invoice No",
          name: "tax_invoice",
        },
      },
      {
        field: "sales_order",
        title: "SO#",
        search: {
          type: "input",
          label: "Sales Order",
          name: "sales_order",
        },
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

  return <BasicCrudView data={data} />;
};

export default UnmatchedReport;
