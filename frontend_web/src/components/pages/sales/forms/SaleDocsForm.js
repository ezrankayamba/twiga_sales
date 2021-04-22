import React, { Component } from "react";
import { FormsHelper } from "../../../../_helpers/FormsHelper";
import { uploadDocs } from "../../../../_services/SalesService";
import { connect } from "react-redux";
import { clearNewOption } from "../../../../redux/forms/actions";
import LoadingIndicator from "../../../utils/loading/LoadingIndicator";
import Snackbar from "../../../utils/notify/Snackbar";
import CommonForm from "../../../utils/form/CommonForm";
import Modal from "../../../modal/Modal";
import { openConfirmDialog } from "../../../modal/ConfirmDialog";

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

    let proceedSubmit = () => {
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
            this.props.complete(res.message);
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
    let isEqual = (str1, str2) => {
      if (!str1 || !str2) return false
      let num1 = parseFloat(str1.replace(",", ""))
      let num2 = parseFloat(str2.replace(",", ""))
      console.log(num1, num2)
      return num1 === num2
    }

    let isValidAggr = () => {
      if (data.category === null || data.category.length === 0) return true
      let arr = data.category.map(r => parseInt(r))
      return arr.includes(4) ? arr.includes(3) : arr.includes(3)
    }

    if (!isValidAggr()) {
      openConfirmDialog({
        title: "Error",
        message: "The aggregate constraints are not met, check your documents and review your inputs!",
        buttons: [
          { label: "Close and Try again", cls: "btn-secondary" },
        ]
      })
      return
    }

    let noMatchVal = !isEqual(data.total_value2, sale.total_value)
    let noMatchQty = !isEqual(data.quantity2, sale.quantity)
    if (noMatchQty || noMatchVal) {
      console.log(data.quantity2, sale.quantity)
      console.log(data.total_value2, sale.total_value)
      openConfirmDialog({
        title: "Warning",
        message: "There is inherent mismatch of quantity/value, Are you sure you want to proceed?",
        buttons: [
          { label: "Yes, proceed", handler: () => proceedSubmit(), cls: "btn-primary" },
          { label: "No, cancel", cls: "btn-secondary" },
        ]
      })
      return
    } else {
      proceedSubmit()
    }
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
        {
          name: "category",
          label: null,
          type: "checkbox",
          options: [{ id: 3, name: "Aggregate Assessment" }, { id: 4, name: "Aggregate C2" }],
          value: val("category"),
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
