import InputControl from "../inputs/InputControl";
import React, { useState } from "react";
import MatIcon from "../icons/MatIcon";

export const SearchForm = ({ searchFields, onSearch }) => {
  let errors0 = {};
  let data0 = {};
  searchFields.forEach((f) => {
    errors0[f.search.name] = "";
    data0[f.search.name] = null;
  });
  const [data, setData] = useState(data0);
  let handleChange = (event) => {
    event.preventDefault();
    const { name, value } = event.target;
    data[name] = value;
    setData(data);
  };
  let search = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(data, (res) => {});
    }
  };
  return (
    <div className="container small">
      <form onSubmit={search} className="form search">
        <div className="form-content">
          {searchFields.map((fld) => {
            return (
              <InputControl
                key={fld.name}
                field={fld.search}
                name={fld.search.name}
                id={fld.search.name}
                className="form-control p-2"
                onChange={handleChange}
              />
            );
          })}
        </div>
        <div className="form-footer">
          <button className="btn btn-sm btn-outline-secondary">
            <MatIcon name="search" /> Search
          </button>
        </div>
      </form>
    </div>
  );
};
