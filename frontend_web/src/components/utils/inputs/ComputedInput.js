import React from "react";

const getInput = (
  { type, options, name, many, all, label },
  { value, prepend, newOptions, dispatch, ...rest }
) => {
  if (type === "select") {
    return (
      <select {...rest} value={value}>
        {(!value || all) && <option value="">{all || "---Select---"}</option>}
        {options &&
          options.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        {newOptions && newOptions[name] && (
          <option value={newOptions[name].id}>{newOptions[name].name}</option>
        )}
      </select>
    );
  } else if (type === "checkbox") {
    let checked = (id) => {
      if (!value) return false;
      return value.find((v) => v === id) !== undefined;
    };
    return (
      <fieldset>
        {options &&
          options.map((o) => {
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
    let url =
      value && typeof value === "string" && value.startsWith("http")
        ? value
        : null;
    let fname = url ? value.split("/").pop().split("\\").pop() : null;
    return (
      <div>
        {url && (
          <span>
            Existing:
            <a className="pl-2" href={url} target="_blank">
              {fname}
            </a>
          </span>
        )}
        <input type={type} {...rest} />
      </div>
    );
  } else {
    return !prepend ? (
      type !== "checkbox" ? (
        <input type={type} value={value} {...rest} readOnly={many} />
      ) : (
        <div className="checkbox-wrap">
          <label for={rest.name}>{label}</label>
          <input type={type} defaultChecked={value} value={value} {...rest} />
        </div>
      )
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
