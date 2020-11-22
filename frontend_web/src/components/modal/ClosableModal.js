import "./Modal.css";
import React from "react";

const CloseableModel = ({ modalId, handleClose, content, ...props }) => {
  const showHideClassName = "modal display-block";
  const otherClick = (e) => {
    if (e.target.id === modalId) {
      console.log(modalId, e.target.id);
      e.stopPropagation();
      handleClose(e);
    }
  };
  return (
    <div className={showHideClassName} onClick={otherClick} id={modalId}>
      <div className="modal-main p-0">{content}</div>
    </div>
  );
};

export default CloseableModel;
