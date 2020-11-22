import React from "react";
import Modal from "./Modal";

export const SimpleDialog = (props) => {
    const {title, description, open, handleClose, handleOk} = props

    return (
        <Modal modalId="simpleDialog" title={title} handleClose={handleClose} show={open} children={<p>{description}</p>} footer={<div>
            <button onClick={handleClose} className="btn btn-outline-default">
                No
            </button>
            <button onClick={handleOk} className="btn btn-outline-danger">
                Yes, delete
            </button>
        </div>}/>
    );
}
