import React from 'react';

const getInput = ({type, options, name}, {value, prepend, newOptions, dispatch, ...rest}) => {
    if (type === 'select') {
        return <select {...rest} value={value}>
            {!value && <option value="">---Select---</option>}
            {options && options.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
            {newOptions && newOptions[name] && <option value={newOptions[name].id}>{newOptions[name].name}</option>}
        </select>
    } else {
        return !prepend ? <input
            type={type}
            {...rest}
        /> : <div className="input-group mb-3">
            <div className="input-group-prepend">
                <span className="input-group-text" id="basic-addon1">{prepend}</span>
            </div>
            <input type={type}
                   {...rest} />
        </div>
    }
}
const ComputedInput = ({field, ...rest}) => {
    return getInput(field, rest)
}

export default ComputedInput;
