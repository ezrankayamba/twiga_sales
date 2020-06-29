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
import Numbers from "../../../_helpers/Numbers";
import Snackbar from "../../utils/notify/Snackbar";

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
    this.refresh(pageNo, this.state.filter);
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
  getDocId(sale, type) {
    let t = sale.docs.find((typ) => typ.doc_type === type);
    let res = t ? t.id : null;
    return res;
  }

  refresh(page = 1, filterIn = null) {
    let { filter } = this.state;
    filter = filterIn ? filterIn : filter;
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
                  total_value: Numbers.fmt(c.total_value),
                  vehicle_number: c.vehicle_number_trailer
                    ? `${c.vehicle_number}, ${c.vehicle_number_trailer}`
                    : c.vehicle_number,
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
    switch (params.type) {
      case "doc":
        CRUD.delete(`/documents/${params.id}`, this.props.user.token, {
          onSuccess: (res) => {
            this.refresh();
          },
          onFail: (res) => {
            console.log(res);
          },
        });
        break;
      default:
        console.log("Not handled");
    }
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
        if (res.status === 0) {
          this.setState({ isLoading: true });
          this.refresh();
        } else {
          this.setState({
            snackbar: {
              error: true,
              message: "Failed: " + res || "Unknown error occured",
              timeout: 10000,
            },
          });
        }
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
    const { user } = this.props;

    let priv = UserHelper.hasPriv(user, "Sales.view.docs");
    console.log(priv);
    let res = priv && this.state.selected.docs.length > 0;
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

  renderDoc(sale, type) {
    let ref_number = this.getRef(sale, type);
    let id = this.getDocId(sale, type);
    return id ? (
      <span>
        {ref_number}
        {sale.invoice ? null : (
          <button
            className="btn btn-link btn-inline p-1"
            onClick={(e) => this.onDelete(e, { type: "doc", id: id })}
          >
            <MatIcon name="delete" extra="text-danger" />
          </button>
        )}
      </span>
    ) : null;
  }

  render() {
    let { sales, pages, pageNo, selected, openDetail, snackbar } = this.state;
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
          search: {
            type: "input",
            label: "Customer Name",
            name: "customer_name",
          },
        },
        {
          field: "delivery_note",
          title: "Delivery Note",
          search: {
            type: "input",
            label: "Delivery Note",
            name: "delivery_note",
          },
        },
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
        {
          field: "product_name",
          title: "Product",
          search: {
            type: "select",
            label: "More Filter",
            name: "more_filter",
            options: [
              { id: "withdocs", name: "With mandatory documents" },
              { id: "docs_nomatch", name: "Docs with value mismatch" },
              { id: "nodocs_new", name: "No docs new sales" },
              { id: "nodocs_old", name: "No docs above 14 days" },
            ],
          },
        },
        { field: "quantity", title: "Qty(Tons)", hide: this.canAddDocs() },
        { field: "total_value", title: "Value", hide: this.canAddDocs() },
        { field: "agent", title: "Agent" },
        {
          field: "c2_ref",
          title: "C2",
          render: (row) => this.renderDoc(row, "C2"),
        },
        {
          field: "assessment_ref",
          title: "Assessment",
          render: (row) => this.renderDoc(row, "Assessment"),
        },
        {
          field: "exit_ref",
          title: "Exit",
          render: (row) => this.renderDoc(row, "Exit"),
        },
      ],
      title: "List of sales",
      onSearch: (params) => this.refresh(1, params),
    };

    const pagination = { pages, pageNo, onPageChange: this.onPageChange };
    const allowAdd = selected ? this.canAddDocs() : false;
    const allowView = selected ? this.canViewDocs() || allowAdd : false;
    console.log("Allow view: ", allowView);
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
        {openDetail && allowView && (
          <SaleDocsForm
            readOnly={!allowAdd}
            complete={this.complete.bind(this)}
            sale={selected}
          />
        )}
        {snackbar && <Snackbar {...snackbar} />}
      </div>
    );
  }
}

export default List;
