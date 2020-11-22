import React, { Component } from "react";
import { FormsHelper } from "../../../../_helpers/FormsHelper";
import { uploadDocs } from "../../../../_services/SalesService";
import { connect } from "react-redux";
import { clearNewOption } from "../../../../redux/forms/actions";
import LoadingIndicator from "../../../utils/loading/LoadingIndicator";
import Snackbar from "../../../utils/notify/Snackbar";
import CommonForm from "../../../utils/form/CommonForm";
import Modal from "../../../modal/Modal";
import CRUD from "../../../../_services/CRUD";

@connect(
  (state) => {
    return {
      user: state.auth.user,
      loggedIn: state.auth.loggedIn,
      newOptions: state.forms.newOptions,
    };
  },
  { clearNewOption: clearNewOption }
)
class InvoiceDocsForm extends Component {
  constructor(props) {
    super(props);
    this.state = { snackbar: null, isLoading: false };
  }
  onSubmit(data, cb) {
    const { invoice } = this.props;
    let form = new FormData();
    form.append("invoice_id", invoice.id);
    Object.entries(data).forEach((entry) => {
      form.append(entry[0], entry[1]);
    });
    this.setState({ isLoading: true, snackbar: null });
    const { complete } = this.props;
    CRUD.uploadDocs("/invoices/docs", this.props.user.token, form, (res) => {
      console.log(res);
      this.setState({
        isLoading: false,
        snackbar: {
          message: res.message,
          timeout: 5000,
          error: res.result !== 0,
          done: () => {
            if (complete) {
              complete(res);
            }
          },
        },
      });
    });
  }

  render() {
    const { complete, invoice, onSubmit, readOnly } = this.props;

    const { snackbar, isLoading } = this.state;
    const title = `${invoice.number} - Documents`;
    let form = {
      fields: [
        {
          name: "sale_id",
          value: invoice.id,
          type: "hidden",
        },
        {
          name: "letter",
          label: "Letter",
          validator: FormsHelper.notEmpty(),
          type: "file",
        },
        {
          name: "invoice",
          label: "Invoice",
          validator: FormsHelper.notEmpty(),
          type: "file",
        },
      ],
      onSubmit: readOnly ? null : onSubmit || this.onSubmit.bind(this),
      enctype: "multipart/form-data",
    };
    return (
      <>
        <Modal
          modalId="saleDocsModal"
          handleClose={() => complete(false)}
          show={true}
          title={title}
          content={
            <CommonForm
              meta={form}
              readOnly={readOnly}
              onClose={() => complete(false)}
              newOptions={this.props.newOptions}
              clearNewOption={this.props.clearNewOption}
            />
          }
        />
        {snackbar && <Snackbar {...snackbar} />}
        {isLoading && <LoadingIndicator isLoading={true} />}
      </>
    );
  }
}

export default InvoiceDocsForm;
