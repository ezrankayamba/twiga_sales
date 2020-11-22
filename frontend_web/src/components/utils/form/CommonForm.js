import React, { Component } from "react";
import "./CommonForm.css";
import InputControl from "../inputs/InputControl";
import { connect } from "react-redux";
import { clearNewOption } from "../../../redux/forms/actions";
import MatIcon from "../icons/MatIcon";

const validateForm = (errors) => {
  let valid = true;
  Object.values(errors).forEach((val) => val.length > 0 && (valid = false));
  return valid;
};

@connect(
  (state) => {
    return {
      newOptions: state.forms.newOptions,
    };
  },
  { clearNewOption: clearNewOption }
)
class CommonForm extends Component {
  constructor(props) {
    super(props);
    let errors = {};
    let data = {};
    this.props.meta.fields.forEach((f) => {
      errors[f.name] = "";
      data[f.name] = f.value ? f.value : null;
    });
    this.state = {
      data,
      errors: errors,
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.setChanged = this.setChanged.bind(this);
  }

  validateOne(name, value) {
    let errors = this.state.errors;
    let field = this.props.meta.fields.find((f) => f.name === name);
    if (field.validator) {
      let v = field.validator;
      errors[field.name] = v.valid(value)
        ? ""
        : v.error
        ? v.error
        : "Invalid entry";
    }
    return errors;
  }

  validateAll() {
    let tmp = {};
    for (const f of this.props.meta.fields) {
      let name = f.name;
      let value = this.state.data[name];
      let errors = this.validateOne(name, value);
      tmp = { ...tmp, ...errors };
    }
    return tmp;
  }
  setMultiSelectChanged(e, name, value) {
    const selObj = e.target;
    const options = selObj.options;
    const res = [];
    for (let i = 0; i < options.length; i++) {
      const opt = options[i];
      if (opt.selected) {
        res.push(opt.value);
      }
    }

    this.props.clearNewOption(name);
    const errors = this.validateOne(name, res);
    this.setState({ errors, data: { ...this.state.data, [name]: res } });
  }
  setCheckBoxChanged(e, name, value) {
    const boxes = document.querySelectorAll(`input[name=${name}]`);
    const res = [];
    for (let i = 0; i < boxes.length; i++) {
      const opt = boxes[i];
      if (opt.checked) {
        res.push(opt.value);
      }
    }
    this.props.clearNewOption(name);
    const errors = this.validateOne(name, res);
    this.setState({ errors, data: { ...this.state.data, [name]: res } });
  }
  handleChange(event) {
    const { name, value, type, multiple } = event.target;
    if (type === "checkbox") {
      this.setCheckBoxChanged(event, name, value);
    } else {
      event.preventDefault();
      if (type === "file") {
        this.setFileChanged(event, name);
      } else if (type === "select-multiple") {
        this.setMultiSelectChanged(event, name, value);
      } else {
        this.setChanged(name, value);
      }
    }
  }

  handleLinked(name, value) {
    let field = this.props.meta.fields.find((f) => f.name === name);
    if (field.linkedTo) {
      let data = field.options.find((i) => i.id === parseInt(value));
      field.linkedTo.forEach((link) => {
        let linkedFld = this.props.meta.fields.find((f) => f.name === link);
        if (linkedFld) {
          this.setState(
            {
              data: { ...this.state.data, [linkedFld.name]: null },
            },
            () => linkedFld.linkChanged(data)
          );
        }
      });
    }
  }
  setChanged(name, value) {
    this.props.clearNewOption(name);
    let errors = this.validateOne(name, value);
    this.setState({ errors, data: { ...this.state.data, [name]: value } }, () =>
      this.handleLinked(name, value)
    );
  }

  clearFormData() {
    let data = this.state.data;
    Object.keys(data).forEach(function (key, index) {
      this[key] = "";
    }, data);
    this.setState({ data });
  }

  handleSubmit(event) {
    event.preventDefault();
    let errors = this.validateAll();
    this.setState({ errors });
    if (validateForm(this.state.errors)) {
      let onSubmit = this.props.meta.onSubmit;
      if (onSubmit) {
        onSubmit(this.state.data, (res) => {
          console.log("Res: ", res);
          if (res) {
            this.clearFormData();
          }
        });
      }
    }
  }
  setFileChanged(e, name) {
    const file = e.target.files[0];
    console.log(file);
    this.props.clearNewOption(name);
    const errors = this.validateOne(name, file);
    this.setState({ errors, data: { ...this.state.data, [name]: file } });
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const { newOptions } = this.props;
    this.props.meta.fields.forEach(({ name }) => {
      if (newOptions[name] && prevState.data[name] !== newOptions[name].id) {
        this.setState({
          data: { ...this.state.data, [name]: newOptions[name].id },
        });
      }
    });
  }

  render() {
    const { errors, data } = this.state;
    const { meta, onClose, newOptions, readOnly } = this.props;
    const defaultClose = () => console.log("Not handled...");
    const handleClose = onClose || defaultClose;

    return (
      <div className="form-wrap bg-light">
        {meta.title && (
          <div className="form-header p-2">
            <h5 className="">
              <span>{meta.title}</span>
            </h5>
            {onClose && (
              <div className="float-right">
                <button
                  className="float-right btn btn-link p-0 text-warning"
                  onClick={handleClose}
                >
                  <MatIcon name="close" extra="size-2" />
                </button>
              </div>
            )}
          </div>
        )}
        <form
          onSubmit={this.handleSubmit}
          noValidate
          className="pl-2 pr-2"
          encType={meta.encType}
        >
          <div className="form-content">
            {meta.fields.map((f) => {
              return (
                <div key={f.name} className="mb-2">
                  <InputControl
                    onShowPopup={this.props.onShowPopup}
                    field={f}
                    value={
                      f.other && newOptions && newOptions[f.name]
                        ? newOptions[f.name].id
                        : data[f.name]
                        ? data[f.name]
                        : ""
                    }
                    name={f.name}
                    id={f.name}
                    className="form-control"
                    onChange={this.handleChange}
                    noValidate
                    errors={errors}
                    setChanged={this.setChanged}
                    disabled={readOnly}
                  />
                  {f.info && (
                    <div className="info">
                      <small>{f.info}</small>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="submit form-footer pb-2">
            <button className="btn btn-sm btn-primary" disabled={readOnly}>
              {meta.btnLabel || "Submit"}
            </button>
          </div>
        </form>
      </div>
    );
  }
}

export default CommonForm;
