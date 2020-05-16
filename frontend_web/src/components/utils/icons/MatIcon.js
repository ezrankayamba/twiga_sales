import React from "react";
const MatIcon = ({ name, extra }) => (
  <span className={`mat-icon material-icons${extra ? " " + extra : ""}`}>
    {name}
  </span>
);
export default MatIcon;
