import "./Modal.css";
import React, { Component } from "react";
import MatIcon from "../utils/icons/MatIcon";

class Modal extends Component {
  otherClick(e) {
    const { modalId, handleClose } = this.props;
    if (e.target.id === modalId) {
      handleClose();
    }
  }

  render() {
    const {
      modalId,
      handleClose,
      content,
      title,
      footer,
      large,
      error,
    } = this.props;
    const showHideClassName = "modal display-block";
    return (
      <div
        className={showHideClassName}
        onClick={this.otherClick.bind(this)}
        id={modalId}
      >
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
}

export default Modal;
