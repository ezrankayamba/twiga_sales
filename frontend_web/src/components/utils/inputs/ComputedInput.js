import React from "react";

const getInput = (
  { type, options, name, multiple },
  { value, prepend, newOptions, dispatch, ...rest }
) => {
  let checkBoxChange = e => {
    console.log(e);
  };
  if (type === "select") {
    return (
      <select {...rest} value={value} multiple={multiple}>
        {!value && !multiple && <option value="">---Select---</option>}
        {options &&
          options.map(o => (
            <option id={`${name}-${o.id}`} key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        {newOptions && newOptions[name] && (
          <option value={newOptions[name].id}>{newOptions[name].name}</option>
        )}
      </select>
    );
  } else if (type === "checkbox") {
    let checked = id => {
      if (!value) return false;
      return value.find(v => v === id) !== undefined;
    };
    return (
      <fieldset>
        {options &&
          options.map(o => {
            let isChecked = checked(o.id);
            return (
              <label className="d-block checkbox-label">
                <input
                  className="pt-2"
                  id={`${name}-${o.id}`}
                  key={o.id}
                  value={o.id}
                  name={name}
                  type={type}
                  checked={isChecked}
                  onChange={rest.onChange}
                />
                <span className="pl-2">{o.name}</span>
              </label>
            );
          })}
      </fieldset>
    );
  } else if (type === "file") {
    let url = value ? value : null;
    let fname = value ? value.split("/").pop() : null;
    return (
      <div>
        <span>
          Existing:{" "}
          <a href={url} target="_blank">
            {fname}
          </a>
        </span>
        <input type={type} {...rest} />
      </div>
    );
  } else {
    return !prepend ? (
      <input value={value} type={type} {...rest} />
    ) : (
      <div className="input-group mb-3">
        <div className="input-group-prepend">
          <span className="input-group-text" id="basic-addon1">
            {prepend}
          </span>
        </div>
        <input value={value} type={type} {...rest} />
      </div>
    );
  }
};
const ComputedInput = ({ field, ...rest }) => {
  return getInput(field, rest);
};

export default ComputedInput;
