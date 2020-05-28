import React, { Component } from "react";
import { connect } from "react-redux";
import CRUD from "../../../_services/CRUD";
import MatIcon from "../../utils/icons/MatIcon";
import BasicCrudView from "../../utils/crud/BasicCrudView";
import LoadingIndicator from "../../utils/loading/LoadingIndicator";
import Modal from "../../modal/Modal";
import Numbers from "../../../_helpers/Numbers";
import { UserHelper } from "../../../_helpers/UserHelper";

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
    };
  }

  onPageChange(pageNo) {
    this.setState({ pageNo });
    this.refresh();
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
                status: item.status ? "Completed" : "Pending",
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

  onRowClick(e) {
    e.stopPropagation();
    // this.setState({ selected: row, openDetail: true });
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

  render() {
    let { invoices, pages, pageNo, invoiceable } = this.state;
    console.log(invoices);
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
          field: "action",
          title: "Action",
          render: (row) =>
            row.status === "Pending" &&
            UserHelper.hasPriv(this.props.user, "Sales.update.invoice") ? (
              <div className="actions">
                <button
                  className="btn btn-sm btn-link text-success"
                  onClick={(e) => this.handleComplete(e, row)}
                >
                  <MatIcon name="done_all" />
                </button>
                <button
                  className="btn btn-sm btn-link text-warning"
                  onClick={(e) => this.handleDelete(e, row)}
                >
                  <MatIcon name="delete" />
                </button>
              </div>
            ) : (
              <span>None</span>
            ),
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
              {/* <button className="btn btn-sm btn-outline-primary">
                <MatIcon name="arrow_downward" /> Export Invoices
              </button> */}
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
        <BasicCrudView pagination={pagination} data={data} toolbar={true} />
        {this.state.isLoading && (
          <LoadingIndicator isLoading={this.state.isLoading} />
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
