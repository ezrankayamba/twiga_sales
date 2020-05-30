import React, { Component } from "react";
import { connect } from "react-redux";
import Dashboard from "./dashboard/Dashboard";
import { fetchSales } from "../../_services/SalesService";
import { DateTime } from "../../_helpers/DateTime";
import "./Dashboard.css";
import CRUD from "../../_services/CRUD";
import FileDownload from "../../_helpers/FileDownload";
import Modal from "../modal/Modal";
import BasicCrudView from "../utils/crud/BasicCrudView";
import MatIcon from "../utils/icons/MatIcon";

@connect((state) => {
  return {
    user: state.auth.user,
    loggedIn: state.auth.loggedIn,
  };
})
class HomePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedOn: false,
      sales: [],
      title: "",
      pages: 1,
      pageNo: 1,
      q: "",
    };
    this.onPageChange = this.onPageChange.bind(this);
  }

  displaySelected(selected) {
    this.setState(
      {
        selectedOn: true,
        records: [selected],
        title: `${selected.name} (${selected.value})`,
        q: selected.q,
      },
      this.refresh
    );
  }
  onPageChange(pageNo) {
    this.setState({ pageNo });
    this.refresh(pageNo);
  }

  getDoc(sale, type) {
    let t = sale.docs.find((typ) => typ.doc_type === type);
    let res = t ? t.file : null;
    return res;
  }

  getRef(sale, type) {
    let t = sale.docs.find((typ) => typ.doc_type === type);
    let res = t ? t.ref_number : null;
    return res;
  }
  refresh(page = 1) {
    this.setState({ isLoading: true }, () =>
      fetchSales(
        this.props.user.token,
        page,
        (res) => {
          if (res) {
            this.setState({
              sales: res.data.map((c) => {
                return {
                  ...c,
                  c2_ref: this.getRef(c, "C2"),
                  assessment_ref: this.getRef(c, "Assessment"),
                  exit_ref: this.getRef(c, "Exit"),
                  c2_doc: this.getDoc(c, "C2"),
                  assessment_doc: this.getDoc(c, "Assessment"),
                  exit_doc: this.getDoc(c, "Exit"),
                  transaction_date: DateTime.fmt(
                    c.transaction_date,
                    "DD/MM/YYYY"
                  ),
                  created_at: DateTime.fmt(c.created_at),
                  agent: c.agent ? c.agent.code : null,
                };
              }),
              isLoading: false,
              pages: parseInt(res.pages),
            });
          }
        },
        { q: this.state.q }
      )
    );
  }
  exportSales() {
    const { q } = this.state;
    const fname = `${Date.now()}_Sales_Report_${q}.xlsx`;
    const getFile = (res) => FileDownload.get(res, fname);
    const logError = (err) => console.error(err);
    const token = this.props.user.token;
    CRUD.export("/reports/export", token, {
      filter: { q },
      onSuccess: getFile,
      onFail: logError,
    });
  }

  render() {
    const { user } = this.props;
    const { selectedOn, title, sales, pages, pageNo } = this.state;
    let data = {
      records: sales,
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
    const pagination = { pages, pageNo, onPageChange: this.onPageChange };

    return (
      <div>
        {!user && (
          <p>
            You are not logged in
            <a
              className="btn btn-sm btn-outline-primary ml-2 mr-2 pt-0 pb-0"
              href="/login"
            >
              Login
            </a>
            to access the dashboard
          </p>
        )}
        {user && (
          <Dashboard
            onDataClick={this.displaySelected.bind(this)}
            user={user}
          />
        )}
        {user && selectedOn && (
          <Modal
            modalId="dashBoardPopup"
            handleClose={() => this.setState({ selectedOn: false })}
            show={true}
            title={title}
            content={
              <div>
                <div className="dashboard-export-container">
                  <button
                    className="btn btn-outline-primary btn-sm ml-2"
                    onClick={this.exportSales.bind(this)}
                  >
                    <MatIcon name="money" />
                    <span className="pl-2">Export Sales</span>
                  </button>
                </div>
                <BasicCrudView data={data} pagination={pagination} />
              </div>
            }
          />
        )}
      </div>
    );
  }
}

export default HomePage;
