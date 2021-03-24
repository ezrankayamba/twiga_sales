import React, { Component } from "react";
import {
  createSale,
  fetchSales,
  importSales,
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
import Modal from "../../modal/Modal";
import CommonForm from "../../utils/form/CommonForm";
import { FormsHelper } from "../../../_helpers/FormsHelper";
import SaleDocsFormAggregate from "./forms/SaleDocsFormAggregate";
import SaleRowAction from "./others/SaleRowAction";

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
      fileUploadDocsKigoma: false,
      fileUploadDocsKabanga: false,
      pages: 1,
      pageNo: 1,
      numRecords: 0,
      isLoading: false,
      types: [],
      x: 0,
      y: 0,
      filter: null,
      snackbar: { error: true, message: "Test " }
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
                  total_value2: c.total_value2
                    ? Numbers.fmt(c.total_value2)
                    : c.total_value2,
                  vehicle_number: c.vehicle_number_trailer
                    ? `${c.vehicle_number}, ${c.vehicle_number_trailer}`
                    : c.vehicle_number,
                };
              }),
              isLoading: false,
              pages: parseInt(res.pages),
              numRecords: parseInt(res.records),
            });
          }
        },
        filter
      )
    );
  }

  componentDidMount() {
    this.refresh();
    CRUD.search(
      "/makerchecker/types",
      this.props.user.token,
      { name: "Sales Documents Delete" },
      {
        onSuccess: (res) => this.setState({ deleteType: res.data.data }),
      }
    );
  }

  onDelete(e, params) {
    e.stopPropagation();
    console.log("onDelete", params);
    switch (params.type) {
      case "sale_docs":
        CRUD.delete(`/sales/docs/${params.id}`, this.props.user.token, {
          onSuccess: () => {
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
    if (this.state.fileUploadDocsKigoma) {
      this.setState({ isLoading: false, fileUploadDocsKigoma: false });
      this.refresh();
      return
    }
    if (this.state.fileUploadDocsKabanga) {
      this.setState({ isLoading: false, fileUploadDocsKabanga: false });
      this.refresh();
      return
    }
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
  canAddDocsAggregate() {
    return UserHelper.hasPriv(this.props.user, "Sales.manage.docs.aggregate");
  }
  canViewDocs() {
    const { user } = this.props;

    let priv = UserHelper.hasPriv(user, "Sales.view.docs");
    console.log(priv);
    let res = priv && this.state.selected.docs.length > 0;
    console.log("canViewDocs: ", res);

    return res;
  }
  complete(message) {
    this.setState(
      {
        selected: null,
        openAdd: false,
        openComplete: message ? true : false,
        message,
      },
      () => {
        if (message) {
          this.refresh();
        }
      }
    );
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
    let doc = null;
    if (sale.aggregate) {
      console.log("Has aggregate: ", sale.sales_order, sale.aggregate)
      doc = sale.aggregate.docs.find((typ) => typ.doc_type === type);
    } else {
      doc = sale.docs.find((typ) => typ.doc_type === type);
    }
    let parts = doc && doc.file ? doc.file.split("/") : [];
    let file = parts.length ? parts[parts.length - 1] : "none";
    return doc ? (
      <span className="d-flex d-nowrap">
        {doc.ref_number}
        <a href={doc.file} download={file}>
          <MatIcon name="open_in_new" />
        </a>
      </span>
    ) : null;
  }

  requestDelete(data) {
    CRUD.create("/makerchecker", this.props.user.token, data, {
      onSuccess: (res) =>
        this.setState({ openRequestDelete: false, selected: null }),
    });
  }

  render() {
    let {
      sales,
      pages,
      pageNo,
      selected,
      openAdd,
      snackbar,
      numRecords,
      openComplete,
      message,
      openRequestDelete,
      deleteType,
    } = this.state;
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
            label: "Doc Reference",
            name: "doc_ref",
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
              { id: "docs_nomatch", name: "Wuth docs, value mismatch" },
              { id: "docs_and_match", name: "With docs, value match" },
              { id: "nodocs_new", name: "No docs new sales" },
              { id: "nodocs_old", name: "No docs above 14 days" },
            ],
          },
        },
        { field: "quantity", title: "Qty(Tons)", hide: this.canAddDocs() },
        { field: "total_value", title: "Value", hide: this.canAddDocs() },
        { field: "quantity2", title: "Qty2(Tons)" },
        { field: "total_value2", title: "Value2" },
        { field: "agent", title: "Agent" },
        {
          field: "assign_no",
          title: "Assign#",
          search: {
            type: "number",
            label: "Assign #",
            name: "assign_no",
          },
        },
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
          title: "Exit / Release",
          render: (row) => this.renderDoc(row, "Exit"),
        },
        {
          field: "action",
          title: "Docs",
          render: (row) => (
            <SaleRowAction row={row} allowAdd={allowAdd} triggerAdd={() => this.setState({ openAdd: true, selected: row })} triggerDelete={() => this.setState({ openRequestDelete: true, selected: row })} />
          ),
        },
      ],
      title: "List of sales",
      onSearch: (params) => this.refresh(1, params),
    };

    const pagination = {
      pages,
      pageNo,
      onPageChange: this.onPageChange,
      numRecords,
    };
    const allowAdd = this.canAddDocs();
    console.log("DeleteType: ", deleteType);
    return (
      <div className="">
        <div className="list-toolbar">
          <h5>{data.title}</h5>
          <div className="wrap">
            <div className="btn-group float-right">
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={this.exportSales.bind(this)}
              >
                <MatIcon name="arrow_downward" text="Export Sales" />
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
                  <MatIcon name="arrow_upward" text="Import Sales" />
                </button>
              )}
              {this.canAddDocs() && (
                <button className="btn btn-sm btn-outline-primary"
                  onClick={(e) =>
                    this.setState({
                      fileUploadDocs: true,
                      x: e.nativeEvent.offsetX,
                      y: e.nativeEvent.offsetY + 100,
                    })
                  }>
                  <MatIcon name="attach_file" /> Bulk Rusumo Docs
                </button>
              )}
              {this.canAddDocsAggregate() && (
                <>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={(e) =>
                      this.setState({
                        fileUploadDocsKigoma: true,
                        x: e.nativeEvent.offsetX,
                        y: e.nativeEvent.offsetY + 100,
                      })
                    }
                  >
                    <MatIcon name="attach_file" /> Docs Via KIGOMA
                </button>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={(e) =>
                      this.setState({
                        fileUploadDocsKabanga: true,
                        x: e.nativeEvent.offsetX,
                        y: e.nativeEvent.offsetY + 100,
                      })
                    }
                  >
                    <MatIcon name="attach_file" /> Docs Via Kabanga
                </button>
                </>
              )}
            </div>
          </div>
        </div>
        <BasicCrudView
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
        {this.state.fileUploadDocsKigoma && (
          <SaleDocsFormAggregate
            position={this.state.y}
            open={this.state.fileUploadDocsKigoma}
            complete={this.fileUploadDocsComplete.bind(this)}
          />
        )}
        {this.state.fileUploadDocsKabanga && (
          <SaleDocsFormAggregate
            position={this.state.y}
            open={this.state.fileUploadDocsKabanga}
            complete={this.fileUploadDocsComplete.bind(this)}
            isKigoma={false}
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
        {openAdd && allowAdd && selected && (
          <SaleDocsForm complete={this.complete.bind(this)} sale={selected} />
        )}
        {snackbar && <Snackbar {...snackbar} />}
        {openComplete && (
          <Modal
            title="Complete"
            handleClose={() => {
              console.log("Complete closed...");
              this.setState({ openComplete: false });
            }}
            content={<p>{message}</p>}
          />
        )}
        {openRequestDelete && selected && (
          <Modal
            title="Request Docs Delete"
            handleClose={() => {
              this.setState({ openRequestDelete: false, selected: null });
            }}
            content={
              <CommonForm
                meta={{
                  fields: [
                    {
                      name: "task_type_id",
                      value: deleteType.id,
                      type: "hidden",
                    },
                    {
                      name: "reference",
                      value: selected.id,
                      type: "hidden",
                    },
                    {
                      name: "maker_comment",
                      label: "Reason for delete",
                      validator: FormsHelper.notEmpty(),
                    },
                  ],
                  onSubmit: this.requestDelete.bind(this),
                }}
              />
            }
          />
        )}
      </div>
    );
  }
}

export default List;
