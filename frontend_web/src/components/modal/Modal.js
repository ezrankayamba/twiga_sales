import "./Modal.css";
import React from "react";
import MatIcon from "../utils/icons/MatIcon";

function Modal({ modalId, handleClose, content, title, footer, large }) {
  const showHideClassName = "modal display-block";
  return (
    <div className={showHideClassName} id={modalId}>
      <div className={large ? "modal-main large" : "modal-main"}>
        <div className="modal-header">
          {title && <h5 className="modal-title">{title}</h5>}
          <div className="btn-group">
            <button
              type="button"
              className="btn btn-link text-warning"
              onClick={handleClose}
            >
              <MatIcon name="close" />
            </button>
          </div>
        </div>
        <div className="modal-content">{content}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

export default Modal;
