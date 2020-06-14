import React, { Component } from "react";
import { connect } from "react-redux";
import CRUD from "../../../_services/CRUD";
import MatIcon from "../../utils/icons/MatIcon";
import BasicCrudView from "../../utils/crud/BasicCrudView";
import LoadingIndicator from "../../utils/loading/LoadingIndicator";
import Modal from "../../modal/Modal";
import Numbers from "../../../_helpers/Numbers";
import { UserHelper } from "../../../_helpers/UserHelper";
import InvoiceDetails from "./forms/InvoiceDetails";
import FileDownload from "../../../_helpers/FileDownload";
import InvoiceDocsForm from "./forms/InvoiceDocsForm";
import { SERVER_URL } from "../../../conf";
const STATUS_MAP = [
  "Created",
  "Copy attached",
  "Awaiting payment",
  "Completed",
];
@connect((state) => {
  return {
    user: state.auth.user,
  };
})
class List extends Component {
  constructor(props) {
    super(props);
    this.state = {
      invoices: [],
      pages: 1,
      pageNo: 1,
      isLoading: false,
      filter: {},
      create: false,
      invoiceable: null,
      selected: null,
    };
  }

  onPageChange(pageNo) {
    this.setState({ pageNo });
    this.refresh();
  }

  getStatus(code) {
    return STATUS_MAP[code];
  }
  getAction(status) {
    const { user } = this.props;
    if (UserHelper.hasPriv(user, "Sales.update.invoice")) {
      if (status === "Copy attached") {
        return "Verify";
      }
      if (status === "Awaiting payment") {
        return "Complete";
      }
    }

    return null;
  }

  refresh(page = 1, filter = null) {
    this.setState({ isLoading: true, filter }, () => {
      CRUD.search("/invoices", this.props.user.token, filter, {
        onSuccess: (res) => {
          console.log("Invoices", res);
          this.setState({
            isLoading: false,
            invoices: res.data.data.map((item) => {
              return {
                ...item,
                agent: item.agent.code,
                num_sales: item.sales.length,
                commission: Numbers.fmt(item.commission),
                quantity: Numbers.fmt(item.quantity),
                value: Numbers.fmt(item.value),
                value_vat: Numbers.fmt(item.value * 1.18),
                status: this.getStatus(item.status),
              };
            }),
          });
        },
        onFail: (err) => console.error(err),
        page,
      });
    });
    CRUD.list("/invoices/manage", this.props.user.token, {
      onSuccess: (res) => this.setState({ invoiceable: res.data }),
      onFail: (res) => console.error(res),
    });
  }

  componentDidMount() {
    this.refresh();
  }

  onRowClick(e, row) {
    e.stopPropagation();
    console.log(row);
    this.setState({ selected: row, openDetails: true });
  }

  handleComplete(e, row) {
    let path = `/invoices/manage/`;
    e.stopPropagation();
    CRUD.update(path, this.props.user.token, {}, row.id, {
      onSuccess: (res) => this.refresh(),
      onFail: (res) => console.error(res),
    });
  }
  handleDelete(e, row) {
    let path = `/invoices/manage/${row.id}`;
    e.stopPropagation();
    CRUD.delete(path, this.props.user.token, {
      onSuccess: (res) => this.refresh(),
      onFail: (res) => console.error(res),
    });
  }

  createInvoice(e) {
    e.stopPropagation();
    this.setState({ isLoading: true }, () => {
      CRUD.create(
        "/invoices/manage",
        this.props.user.token,
        {},
        {
          onSuccess: (res) =>
            this.setState(
              { isLoading: false, invoiceable: null, create: null },
              () => this.refresh()
            ),
          onFail: (err) => console.error(err),
        }
      );
    });
  }
  exportInvoices() {
    const fname = `${Date.now()}_Invoices.xlsx`;
    const getFile = (res) => FileDownload.get(res, fname);
    const logError = (err) => console.error(err);
    CRUD.export("/invoices/export", this.props.user.token, {
      onSuccess: getFile,
      onFail: logError,
    });
  }
  getUrl(file) {
    let url = `${SERVER_URL}${file}`;
    console.log(url);
    return url;
  }

  render() {
    let {
      invoices,
      pages,
      pageNo,
      invoiceable,
      selected,
      attachDocs,
      openDetails,
    } = this.state;
    const { user } = this.props;

    let data = {
      records: invoices,
      headers: [
        { field: "id", title: "ID" },
        {
          field: "number",
          title: "Invoice No.",
          search: {
            type: "input",
            label: "Invoice No",
            name: "number",
          },
        },
        { field: "commission", title: "Rate" },
        { field: "agent", title: "Agent" },
        { field: "quantity", title: "Quantity(Tons)" },
        { field: "value", title: "Value(TZS)" },
        { field: "value_vat", title: "Value(VAT Incl.)" },
        { field: "num_sales", title: "Count" },
        { field: "status", title: "Status" },
        {
          field: "docs",
          title: "Docs",
          render: (row) =>
            row.docs.length ? (
              <div className="action-buttons">
                {row.docs.map((d) => (
                  <a
                    href={`${this.getUrl(d.file)}`}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-item"
                    target="_blank"
                  >
                    <MatIcon name="arrow_downward" /> {d.doc_type}
                  </a>
                ))}
              </div>
            ) : (
              <div className="action-buttons">
                <span>Not attached</span>
                {user.agent && (
                  <button
                    className="btn btn-link"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      this.setState({ attachDocs: true, selected: row });
                    }}
                  >
                    <MatIcon name="attach_file" />
                  </button>
                )}
              </div>
            ),
        },
        {
          field: "action",
          title: "Action",
          render: (row) => {
            let action = this.getAction(row.status);
            return action ? (
              <div className="actions">
                <button
                  className="btn btn-sm btn-link text-success"
                  onClick={(e) => this.handleComplete(e, row)}
                >
                  <MatIcon name="done_all" /> {action}
                </button>
                {/* <button
                  className="btn btn-sm btn-link text-warning"
                  onClick={(e) => this.handleDelete(e, row)}
                >
                  <MatIcon name="delete" />
                </button> */}
              </div>
            ) : (
              <span>None</span>
            );
          },
        },
      ],
      title: "List of invoices",
      onSearch: (params) => this.refresh(1, params),
    };

    const pagination = { pages, pageNo, onPageChange: this.onPageChange };
    return (
      <div>
        <div className="list-toolbar">
          <h5>{data.title}</h5>
          <div className="wrap">
            <div className="btn-group float-right">
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={this.exportInvoices.bind(this)}
              >
                <MatIcon name="arrow_downward" /> Export Invoices
              </button>
              {UserHelper.hasPriv(this.props.user, "Sales.create.invoice") && (
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => this.setState({ create: true })}
                >
                  <MatIcon name="post_add" /> Create Invoice
                </button>
              )}
            </div>
          </div>
        </div>
        <BasicCrudView
          pagination={pagination}
          data={data}
          toolbar={true}
          onRowClick={this.onRowClick.bind(this)}
        />
        {attachDocs && (
          <InvoiceDocsForm
            invoice={selected}
            complete={() => {
              this.setState({ attachDocs: false, selected: null });
              this.refresh();
            }}
          />
        )}
        {this.state.isLoading && (
          <LoadingIndicator isLoading={this.state.isLoading} />
        )}
        {openDetails && (
          <Modal
            modalId="invoices-create"
            title="Invoice Summary"
            handleClose={() =>
              this.setState({ selected: null, openDetails: false })
            }
            content={
              <InvoiceDetails
                token={this.props.user.token}
                selected={selected}
              />
            }
          />
        )}
        {this.state.create && invoiceable && (
          <Modal
            modalId="invoices-create"
            title="Invoice Summary"
            handleClose={() => this.setState({ create: false })}
            content={
              <div className="create-invoice-wrap">
                <p>
                  Invoiceable sales are those sales with atleast Assessment and
                  C2 documents attached
                </p>
                <div className="item">
                  <div className="label">Commission Rate</div>
                  <div className="value">
                    {Numbers.fmt(invoiceable.commission)}
                  </div>
                </div>
                <div className="item">
                  <div className="label">Total Quantity (Tons)</div>
                  <div className="value">
                    {Numbers.fmt(invoiceable.complete.quantity)}
                  </div>
                </div>
                <div className="item">
                  <div className="label">Commission Value (TZS)</div>
                  <div className="value">
                    {Numbers.fmt(
                      invoiceable.commission * invoiceable.complete.quantity
                    )}
                  </div>
                </div>
                <div className="invoices-footer">
                  {invoiceable.complete.quantity ? (
                    <button
                      className="btn btn-primary"
                      onClick={this.createInvoice.bind(this)}
                    >
                      Create Invoice
                    </button>
                  ) : (
                    <button
                      className="btn btn-link text-warning"
                      disabled={true}
                    >
                      No invoiceable Sales
                    </button>
                  )}
                </div>
              </div>
            }
          />
        )}
      </div>
    );
  }
}

export default List;
