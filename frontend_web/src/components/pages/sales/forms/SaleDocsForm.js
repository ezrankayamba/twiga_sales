import React, { Component } from "react";
import CloseableModel from "../../../modal/ClosableModal";
import { FormsHelper } from "../../../../_helpers/FormsHelper";
import { uploadDocs } from "../../../../_services/SalesService";
import { connect } from "react-redux";

import { CommonForm } from "neza-react-forms";
import { clearNewOption } from "../../../../redux/forms/actions";

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
class SaleDocsForm extends Component {
  constructor(props) {
    super(props);
    this.state = { snackbar: null };
  }
  onSubmit(data, cb) {
    let form = new FormData();
    Object.entries(data).forEach((entry) => {
      console.log(entry);
      form.append(entry[0], entry[1]);
    });
    uploadDocs(this.props.user.token, form, (res) => {
      this.props.complete(true);
      cb(res);
      if (res) {
        this.setState({
          snackbar: {
            message: res.message,
            timeout: 1000,
            error: res.status !== 0,
          },
        });
      }
    });
  }

  render() {
    const { complete, sale, onSubmit, readOnly } = this.props;
    console.log(sale);
    const hasDocs = sale.docs.length > 0;
    const val = (name) => {
      if (!hasDocs) return null;
      return sale[name];
    };
    const { snackbar } = this.state;
    const title = "Sale Documents";
    let form = {
      title: `${sale.vehicle_number} - ${title}`,
      fields: [
        {
          name: "quantity",
          label: "Quantity(Tons)",
          validator: FormsHelper.notEmpty(),
          value: val("quantity"),
        },
        {
          name: "sale_id",
          value: sale.id,
          type: "hidden",
        },
        {
          name: "total_value",
          label: "Value(USD)",
          validator: FormsHelper.notEmpty(),
          value: val("total_value"),
        },
        {
          name: "c2_ref",
          label: "C2 Reference",
          validator: FormsHelper.notEmpty(),
          value: val("c2_ref"),
        },
        {
          name: "c2_doc",
          label: "C2 Document",
          type: "file",
          validator: FormsHelper.notEmpty(),
          value: val("c2_doc"),
        },
        {
          name: "exit_ref",
          label: "Exit Reference",
          validator: FormsHelper.notEmpty(),
          value: val("exit_ref"),
        },
        {
          name: "exit_doc",
          label: "Exit Document",
          type: "file",
          validator: FormsHelper.notEmpty(),
          value: val("exit_doc"),
        },
        {
          name: "assessment_ref",
          label: "Assessment Reference",
          validator: FormsHelper.notEmpty(),
          value: val("assessment_ref"),
        },
        {
          name: "assessment_doc",
          label: "Assessment Document",
          type: "file",
          validator: FormsHelper.notEmpty(),
          value: val("assessment_doc"),
        },
      ],
      onSubmit: readOnly ? null : onSubmit || this.onSubmit.bind(this),
      enctype: "multipart/form-data",
    };
    return (
      <>
        <CloseableModel
          modalId="saleDocsModal"
          handleClose={() => complete(false)}
          show={true}
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
        {snackbar && (
          <Snackbar
            message={snackbar.message}
            timeout={snackbar.timeout}
            error={snackbar.error}
          />
        )}
      </>
    );
  }
}

export default SaleDocsForm;
