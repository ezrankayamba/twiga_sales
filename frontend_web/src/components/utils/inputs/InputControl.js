import React, {Component} from 'react';
import ComputedInput from "./ComputedInput";
import {IconAdd, IconCaptureLocation, IconMap} from "../Incons";
import LocationUtils from "../../../_helpers/LocationUtils";
import {connect} from "react-redux";

@connect((state) => {
    return {
        newOptions: state.forms.newOptions
    }
})
class InputControl extends Component {
    state = {popup: false}

    setVal(name, val) {
        this.props.setChanged(name, val)
        let input = document.querySelector(`#${name}`)
        input.value = val
        const event = new Event('change', {bubbles: true})
        input.dispatchEvent(event)
    }

    captLoc(e) {
        const {field} = this.props
        e.stopPropagation()
        LocationUtils.capture({
            onSuccess: (loc) => {
                console.log(loc, document.querySelector(`#${field.name}`))
                this.setVal(field.name, `(${loc.lat}, ${loc.lng})`)
            }, onFail: ({code, message}) => console.log(code, message)
        })
    }

    selectFrmMap(e) {
        e.stopPropagation()
        console.log(e)
    }

    render() {
        const {field, errors, setChanged, onShowPopup, newOptions, ...rest} = this.props
        return <div className="form-group mb-0">
            <label htmlFor={field.name} className="d-flex justify-content-between mb-1">
                <span>{field.label}</span>
                {field.other &&
                <button type="button" className="btn btn-link p-0 pr-2" onClick={() => onShowPopup(field.name)}>
                    <IconAdd/>
                </button>}
                {field.type === 'location' && <div>
                    <button type="button" className="btn btn-link p-0 pl-2 pr-2" onClick={this.captLoc.bind(this)}>
                        <IconCaptureLocation/>
                    </button>
                    <button type="button" className="btn btn-link p-0 pl-2 pr-2" onClick={this.selectFrmMap.bind(this)}>
                        <IconMap/>
                    </button>
                </div>}
            </label>
            <ComputedInput field={field} {...rest} newOptions={newOptions}/>
            {errors[field.name].length > 0 && (
                <small className="text-danger small">{errors[field.name]}</small>
            )}
        </div>
    }
}

export default InputControl;

