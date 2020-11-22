import React from "react";
import "./File.css";

export const File = ({ label, name, onChange, file, media }) => {
  let clickHandler = (e) => {
    document.querySelector(`#${name}-label`).click();
  };
  let fileName = file ? file.name : "---No file selected---";
  return (
    <div className="form-group my-custom-file">
      <label id={`${name}-label`} htmlFor={name}>
        {label}
        <input
          type="file"
          name={name}
          id={name}
          onChange={onChange}
          hidden
          accept={media}
        />
      </label>
      <div className="d-flex">
        <input
          value={fileName}
          onClick={clickHandler}
          className="form-control"
          readOnly
        />
        <button
          onClick={clickHandler}
          type="button"
          className="btn btn-sm btn-outline-secondary"
        >
          Browse
        </button>
      </div>
    </div>
  );
};
