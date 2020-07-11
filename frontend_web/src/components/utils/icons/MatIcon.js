import React from "react";
const MatIcon = ({ name, extra, text }) => (
  <>
    <span className={`mat-icon material-icons${extra ? " " + extra : ""}`}>
      {name}
    </span>
    {text && <span>{text}</span>}
  </>
);
export default MatIcon;
