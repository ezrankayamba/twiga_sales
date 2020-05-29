import React, { Component } from "react";
import { FormsHelper } from "../../../../_helpers/FormsHelper";
import { uploadDocs } from "../../../../_services/SalesService";
import { connect } from "react-redux";
import { clearNewOption } from "../../../../redux/forms/actions";
import LoadingIndicator from "../../../utils/loading/LoadingIndicator";
import Snackbar from "../../../utils/notify/Snackbar";
import CommonForm from "../../../utils/form/CommonForm";
import Modal from "../../../modal/Modal";

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
    this.state = { snackbar: null, isLoading: false };
  }
  onSubmit(data, cb) {
    const { sale } = this.props;
    const hasDocs = sale.docs.length > 0;
    let form = new FormData();
    Object.entries(data).forEach((entry) => {
      console.log(entry);
      form.append(entry[0], entry[1]);
    });
    this.setState({ isLoading: true, snackbar: null });
    uploadDocs(
      this.props.user.token,
      form,
      (res) => {
        this.setState({ isLoading: false });
        if (res && res.status === 0) {
          this.props.complete(true);
          cb(res);
        } else {
          this.setState({
            snackbar: {
              message: (
                <ol>
                  {res.errors.map((e) => (
                    <li>{e.message}</li>
                  ))}
                </ol>
              ),
              timeout: 10000,
              error: true,
            },
          });
        }
      },
      !hasDocs
    );
  }

  render() {
    const { complete, sale, onSubmit, readOnly } = this.props;
    const hasDocs = sale.docs.length > 0;
    const val = (name) => {
      if (!hasDocs) return null;
      return sale[name];
    };
    const { snackbar, isLoading } = this.state;
    const title = `${sale.sales_order} - Sale Documents`;
    let form = {
      fields: [
        {
          name: "sale_id",
          value: sale.id,
          type: "hidden",
        },
        {
          name: "quantity2",
          label: "Quantity(Tons)",
          validator: FormsHelper.notEmpty(),
          value: val("quantity2"),
        },
        {
          name: "total_value2",
          label: "Value(USD)",
          validator: FormsHelper.notEmpty(),
          value: val("total_value2"),
        },
        {
          name: "c2_doc",
          label: "C2 Document",
          type: "file",
          validator: FormsHelper.notEmpty(),
          value: val("c2_doc"),
        },

        {
          name: "assessment_doc",
          label: "Assessment Document",
          type: "file",
          validator: FormsHelper.notEmpty(),
          value: val("assessment_doc"),
        },
        {
          name: "exit_doc",
          label: "Exit Document",
          type: "file",
          value: val("exit_doc"),
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
        {snackbar && (
          <Snackbar
            message={snackbar.message}
            timeout={snackbar.timeout}
            error={snackbar.error}
            done={() => console.log("Done")}
          />
        )}
        {isLoading && <LoadingIndicator isLoading={true} />}
      </>
    );
  }
}

export default SaleDocsForm;
