import React, { useState } from "react";
import CRUD from "../../../../_services/CRUD";
import MatIcon from "../../../utils/icons/MatIcon";
import BasicCrudView from "../../../utils/crud/BasicCrudView";
import { DateTime } from "../../../../_helpers/DateTime";
import FileDownload from "../../../../_helpers/FileDownload";

const InvoiceDetails = ({ token, selected }) => {
  const [pages, setPages] = useState(1);
  const [pageNo, setPageNo] = useState(1);

  const pagination = {
    pages,
    pageNo,
    onPageChange: (pageNo) => setPageNo(pageNo),
  };
  const exportSales = () => {
    const fname = `${Date.now()}_Sales_Report_${selected.number}.xlsx`;
    const getFile = (res) => FileDownload.get(res, fname);
    const logError = (err) => console.error(err);
    CRUD.export("/invoices/sales/" + selected.id, token, {
      onSuccess: getFile,
      onFail: logError,
    });
  };
  function getDoc(sale, type) {
    let t = sale.docs.find((typ) => typ.doc_type === type);
    let res = t ? t.file : null;
    return res;
  }

  function getRef(sale, type) {
    let t = sale.docs.find((typ) => typ.doc_type === type);
    let res = t ? t.ref_number : null;
    return res;
  }
  let data = {
    records: selected.sales.map((c) => {
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
    }),
    headers: [
      { field: "id", title: "ID" },
      { field: "transaction_date", title: "Trans Date" },
      { field: "customer_name", title: "Customer" },
      { field: "delivery_note", title: "Delivery Note" },
      { field: "vehicle_number", title: "Veh#" },
      { field: "tax_invoice", title: "Tax Invoice" },
      { field: "sales_order", title: "SO#" },
      { field: "product_name", title: "Product" },
      { field: "quantity", title: "Qty(Tons)" },
      { field: "total_value", title: "Value" },
      { field: "destination", title: "Destination" },
      { field: "agent", title: "Agent" },
    ],
    title: "List of sales",
  };
  return (
    <div>
      <div className="dashboard-export-container">
        <button
          className="btn btn-outline-primary btn-sm ml-2"
          onClick={exportSales}
        >
          <MatIcon name="money" />
          <span className="pl-2">Export Sales</span>
        </button>
      </div>
      <BasicCrudView data={data} pagination={pagination} />
    </div>
  );
};

export default InvoiceDetails;
