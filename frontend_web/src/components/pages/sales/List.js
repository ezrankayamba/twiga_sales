import React, { Component } from "react";

import {
  createSale,
  fetchSales,
  importSales,
  uploadDocs
} from "../../../_services/SalesService";
import { connect } from "react-redux";
import BasicCrudView from "../../utils/BasicCrudView";
import LoadingIndicator from "../../utils/LoadingIndicator";
import { IconPayment } from "../../utils/Incons";
import { DateTime } from "../../../_helpers/DateTime";
import SalesImportForm from "./forms/SalesImportForm";
import DocumentsUploadForm from "./forms/DocumentsUploadForm";
import SaleDocsForm from "./forms/SaleDocsForm";
import { UserHelper } from "../../../_helpers/UserHelper";

@connect(state => {
  return {
    user: state.auth.user
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
      y: 0
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
    let t = sale.docs.find(typ => typ.doc_type === type);
    let res = t ? t.file : null;
    return res;
  }

  getRef(sale, type) {
    let t = sale.docs.find(typ => typ.doc_type === type);
    let res = t ? t.ref_number : null;
    return res;
  }

  refresh(page = 1) {
    this.setState({ isLoading: true }, () =>
      fetchSales(this.props.user.token, page, res => {
        if (res) {
          this.setState({
            sales: res.data.map(c => {
              const hasDocs = c.docs.length > 0;
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
                agent: c.agent ? c.agent.code : null
              };
            }),
            isLoading: false,
            pages: parseInt(res.pages)
          });
        }
      })
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
    this.setState({ selected: row, openDetail: true });
  }

  fileUploadSalesComplete(data) {
    console.log(data);
    this.setState({ fileUploadSales: false });
    if (data) {
      this.setState({ isLoading: true });
      importSales(this.props.user.token, data, res => {
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
      uploadDocs(this.props.user.token, data, res => {
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
    return (
      this.state.selected &&
      UserHelper.hasPriv(this.props.user, "Sales.manage.docs")
    );
  }
  canViewDocs() {
    return (
      this.state.selected &&
      this.state.selected.docs.length > 0 &&
      UserHelper.hasPriv(this.props.user, "Sales.view.docs")
    );
  }
  complete() {
    this.setState({ selected: null, openDetail: false }, this.refresh);
  }

  render() {
    let { sales, pages, pageNo } = this.state;
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
        { field: "quantity", title: "Qty(Tons)", hide: this.canAddDocs() },
        { field: "total_value", title: "Value", hide: this.canAddDocs() },
        { field: "destination", title: "Destination" },
        { field: "agent", title: "Agent" }
      ],
      title: "List of sales"
    };

    const pagination = { pages, pageNo, onPageChange: this.onPageChange };
    return (
      <div className="row">
        <div className="col">
          <div className="row pt-2 pb-2 d-flex">
            <div className="col-md">
              <h5>{data.title}</h5>
            </div>
            <div className="col-md">
              <div className="float-md-right">
                {this.canAddSales() && (
                  <button
                    className="btn btn-primary btn-sm ml-2"
                    onClick={e =>
                      this.setState({
                        fileUploadSales: true,
                        x: e.nativeEvent.offsetX,
                        y: e.nativeEvent.offsetY + 100
                      })
                    }
                  >
                    <IconPayment />
                    <span className="pl-2">Import Sales</span>
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
          {this.state.openDetail && this.canAddDocs() && (
            <SaleDocsForm
              complete={this.complete.bind(this)}
              sale={this.state.selected}
            />
          )}
          {this.state.openDetail && this.canViewDocs() && (
            <SaleDocsForm
              readOnly={true}
              complete={this.complete.bind(this)}
              sale={this.state.selected}
            />
          )}
        </div>
      </div>
    );
  }
}

export default List;
