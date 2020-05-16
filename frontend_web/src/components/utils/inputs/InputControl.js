import React, { Component } from "react";
import ComputedInput from "./ComputedInput";
import LocationUtils from "../../../_helpers/LocationUtils";
import { connect } from "react-redux";
import Modal from "../../modal/Modal";
import MapPicker from "./MapPicker";
import MatIcon from "../icons/MatIcon";

@connect((state) => {
  return {
    newOptions: state.forms.newOptions,
  };
})
class InputControl extends Component {
  state = {
    popup: false,
    openMap: false,
    addMany: false,
    data: {},
    fieldValues: [],
  };
  componentDidMount() {
    const { field } = this.props;
    if (field.value && field.many) {
      this.setState({ fieldValues: field.value.split(",") });
    }
  }

  setVal(name, val, done) {
    this.props.setChanged(name, val);
    let input = document.querySelector(`#${name}`);
    input.value = val;
    const event = new Event("change", { bubbles: true });
    input.dispatchEvent(event);
    if (done) {
      done();
    }
  }

  captLoc(e) {
    const { field } = this.props;
    e.stopPropagation();
    LocationUtils.capture({
      onSuccess: (loc) => {
        this.setVal(field.name, `(${loc.lat}, ${loc.lng})`);
      },
      onFail: ({ code, message }) => console.log(code, message),
    });
  }

  selectFrmMap(e) {
    e.stopPropagation();
    const get = (str) => {
      let parts = str.replace("(", "").replace(")", "").split(",");
      return { lat: parts[0].trim(), lng: parts[1].trim() };
    };
    const { field } = this.props;
    const position = field.value ? get(field.value) : null;
    this.setState({ openMap: true, position });
  }
  onPositionSelect(loc) {
    const { field } = this.props;
    this.setVal(field.name, `(${loc.lat}, ${loc.lng})`, () =>
      this.setState({ openMap: false })
    );
  }
  addValue(e) {
    const { field } = this.props;
    this.setState({ addMany: true });
  }

  onManySubmit(name) {
    const { data, fieldValues } = this.state;
    const { field } = this.props;
    let values = fieldValues;
    if (data[name]) {
      values.push(data[name]);
      this.setState({ fieldValues: values, addMany: false }, () => {
        let val = fieldValues.join(",");
        this.setVal(field.name, val);
      });
    }
  }
  onManyChange(e) {
    let { name, value } = e.target;
    const { data } = this.state;
    this.setState({ data: { ...data, [name]: value } });
  }

  render() {
    const {
      field,
      errors,
      setChanged,
      onShowPopup,
      newOptions,
      ...rest
    } = this.props;
    const { openMap, addMany, position } = this.state;
    return (
      <>
        <div className="form-group mb-0">
          {field.label && (
            <label
              htmlFor={field.name}
              className="d-flex justify-content-between mb-1"
            >
              <span>{field.label}</span>
              {field.other && (
                <button
                  type="button"
                  className="btn btn-link p-0 pr-2"
                  onClick={() => onShowPopup(field.name)}
                >
                  <MatIcon name="add" />
                </button>
              )}
              {field.type === "location" && (
                <div>
                  <button
                    type="button"
                    className="btn btn-sm btn-link p-0 pl-2 pr-2"
                    onClick={this.captLoc.bind(this)}
                  >
                    <MatIcon name="my_location" />
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-link p-0 pl-2 pr-2"
                    onClick={this.selectFrmMap.bind(this)}
                  >
                    <MatIcon name="add_location" />
                  </button>
                </div>
              )}
              {field.many && (
                <div>
                  <button
                    type="button"
                    className="btn btn-link p-0 pl-2 pr-2"
                    onClick={this.addValue.bind(this)}
                  >
                    <IconAddNew className="p-0" />
                  </button>
                </div>
              )}
            </label>
          )}
          <ComputedInput field={field} {...rest} newOptions={newOptions} />
          {errors && errors[field.name].length > 0 && (
            <small className="text-error small">{errors[field.name]}</small>
          )}
        </div>

        {openMap && (
          <Modal
            title="Map"
            handleClose={() => this.setState({ openMap: false })}
            content={
              <MapPicker
                onPositionSelect={this.onPositionSelect.bind(this)}
                mapId={`${field.name}-map`}
                position={position}
              />
            }
          />
        )}
        {addMany && (
          <Modal
            title={field.label}
            handleClose={() => this.setState({ addMany: false })}
            content={
              <div className="form-row">
                <div className="col">
                  <input
                    name={`${field.name}-many`}
                    onChange={this.onManyChange.bind(this)}
                    className="form-control col-auto"
                  />
                </div>
                <div className="col-auto">
                  <button
                    type="button"
                    className="btn btn-sm btn-primary"
                    data-name={`${field.name}-many`}
                    onClick={() => this.onManySubmit(`${field.name}-many`)}
                  >
                    Add
                  </button>
                </div>
              </div>
            }
          />
        )}
      </>
    );
  }
}

export default InputControl;
