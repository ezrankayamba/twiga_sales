import React, { Component } from "react";
import {
  createSale,
  fetchSales,
  importSales,
  uploadDocs,
  attachDocs,
} from "../../../_services/SalesService";
import { connect } from "react-redux";
import { DateTime } from "../../../_helpers/DateTime";
import SalesImportForm from "./forms/SalesImportForm";
import DocumentsUploadForm from "./forms/DocumentsUploadForm";
import SaleDocsForm from "./forms/SaleDocsForm";
import { UserHelper } from "../../../_helpers/UserHelper";
import CRUD from "../../../_services/CRUD";
import FileDownload from "../../../_helpers/FileDownload";
import MatIcon from "../../utils/icons/MatIcon";
import BasicCrudView from "../../utils/crud/BasicCrudView";
import LoadingIndicator from "../../utils/loading/LoadingIndicator";

@connect((state) => {
  return {
    user: state.auth.user,
  };
})
class List extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sales: [],
      fileUploadSales: false,
      fileUploadDocs: false,
      pages: 1,
      pageNo: 1,
      isLoading: false,
      types: [],
      x: 0,
      y: 0,
      filter: null,
    };

    this.doUpdate = this.doUpdate.bind(this);
    this.onClose = this.onClose.bind(this);
    this.onPageChange = this.onPageChange.bind(this);
    this.doAdd = this.doAdd.bind(this);
    this.onDelete = this.onDelete.bind(this);
    this.canAddDocs = this.canAddDocs.bind(this);
    this.canAddSales = this.canAddSales.bind(this);
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

  refresh(page = 1, filter = null) {
    this.setState({ isLoading: true, filter }, () =>
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
        filter
      )
    );
  }

  componentDidMount() {
    this.refresh();
  }

  onDelete(e, params) {
    e.stopPropagation();
    console.log("onDelete", params);
  }

  doAdd(params, cb) {
    this.setState({ isLoading: true });
    let body = { ...params };
    createSale(this.props.user.token, body, () => {
      if (cb) cb(true);
      this.setState({ fileUpload: false }, () => this.refresh());
    });
  }

  doUpdate(params) {
    let body = { id: params.id, name: params.name, account: params.account };
    console.log("doDelete", body);
  }

  onClose() {
    this.setState({ openAdd: false });
  }

  onRowClick(e, row) {
    e.stopPropagation();
    this.setState({ selected: row, openDetail: true });
  }

  fileUploadSalesComplete(data) {
    console.log(data);
    this.setState({ fileUploadSales: false });
    if (data) {
      this.setState({ isLoading: true });
      importSales(this.props.user.token, data, (res) => {
        console.log(res);
        this.setState({ isLoading: true });
        this.refresh();
      });
    }
  }

  fileUploadDocsComplete(data) {
    console.log(data);
    this.setState({ fileUploadDocs: false });
    if (data) {
      this.setState({ isLoading: true });
      attachDocs(this.props.user.token, data, (res) => {
        console.log(res);
        this.setState({ isLoading: true });
        this.refresh();
      });
    }
  }
  canAddSales() {
    return UserHelper.hasPriv(this.props.user, "Sales.manage");
  }
  canAddDocs() {
    return UserHelper.hasPriv(this.props.user, "Sales.manage.docs");
  }
  canViewDocs() {
    let res =
      UserHelper.hasPriv(this.props.user, "Sales.view.docs") &&
      this.state.selected.docs.length > 0;
    console.log("canViewDocs: ", res);

    return res;
  }
  complete() {
    this.setState({ selected: null, openDetail: false }, this.refresh);
  }
  exportSales() {
    const { filter } = this.state;
    const fname = `${Date.now()}_Sales_Report.xlsx`;
    const getFile = (res) => FileDownload.get(res, fname);
    const logError = (err) => console.error(err);
    const token = this.props.user.token;
    CRUD.export("/reports/export", token, {
      filter,
      onSuccess: getFile,
      onFail: logError,
    });
  }

  render() {
    let { sales, pages, pageNo, selected, openDetail } = this.state;
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
        { field: "quantity", title: "Qty(Tons)", hide: this.canAddDocs() },
        { field: "total_value", title: "Value", hide: this.canAddDocs() },
        { field: "destination", title: "Destination" },
        { field: "agent", title: "Agent" },
      ],
      title: "List of sales",
      onSearch: (params) => this.refresh(1, params),
    };

    const pagination = { pages, pageNo, onPageChange: this.onPageChange };
    return (
      <div className="">
        <div className="list-toolbar">
          <h5>{data.title}</h5>
          <div className="wrap">
            <div className="btn-group float-right">
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={this.exportSales.bind(this)}
              >
                <MatIcon name="arrow_downward" /> Export Sales
              </button>
              {this.canAddSales() && (
                <button
                  className="btn btn-sm btn-primary"
                  onClick={(e) =>
                    this.setState({
                      fileUploadSales: true,
                      x: e.nativeEvent.offsetX,
                      y: e.nativeEvent.offsetY + 100,
                    })
                  }
                >
                  <MatIcon name="arrow_upward" /> Import Sales
                </button>
              )}
              {this.canAddDocs() && (
                <button
                  className="btn btn-sm btn-primary"
                  onClick={(e) =>
                    this.setState({
                      fileUploadDocs: true,
                      x: e.nativeEvent.offsetX,
                      y: e.nativeEvent.offsetY + 100,
                    })
                  }
                >
                  <MatIcon name="attach_file" /> Attach Docs
                </button>
              )}
            </div>
          </div>
        </div>
        <BasicCrudView
          onRowClick={this.onRowClick.bind(this)}
          pagination={pagination}
          data={data}
          onUpdate={this.doUpdate}
          onDelete={this.onDelete}
          onAdd={this.doAdd}
          toolbar={true}
        />
        {this.state.fileUploadDocs && (
          <DocumentsUploadForm
            position={this.state.y}
            open={this.state.fileUploadDocs}
            complete={this.fileUploadDocsComplete.bind(this)}
          />
        )}
        {this.state.fileUploadSales && (
          <SalesImportForm
            position={this.state.y}
            open={this.state.fileUploadSales}
            complete={this.fileUploadSalesComplete.bind(this)}
          />
        )}
        {this.state.isLoading && (
          <LoadingIndicator isLoading={this.state.isLoading} />
        )}
        {openDetail && (this.canViewDocs() || this.canAddDocs()) && (
          <SaleDocsForm
            readOnly={!this.canAddDocs() || selected.docs.length === 3}
            complete={this.complete.bind(this)}
            sale={selected}
          />
        )}
      </div>
    );
  }
}

export default List;
