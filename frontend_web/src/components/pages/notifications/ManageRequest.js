import React, { useState, useEffect } from "react";
import CRUD from "../../../_services/CRUD";
import MatIcon from "../../utils/icons/MatIcon";
import Modal from "../../modal/Modal";
import { UserHelper } from "../../../_helpers/UserHelper";

function ManageRequest({ task, token, done, user }) {
  const [entity, setEntity] = useState(null);
  const [approval, setApproval] = useState(null);

  function ApprovalForm({ status }) {
    const [comment, setComment] = useState("");
    function handleChange(e) {
      setComment(e.target.value);
    }
    function handleSubmit(e) {
      e.preventDefault();
      console.log(comment);
      doApproval(status, comment);
    }
    function statusAction(status) {
      return status === "APPROVED" ? "APPROVE" : "REJECT";
    }
    return (
      <div>
        <h5 className="mb-1">
          Are you sure you want to <b>{statusAction(status)}</b> this request?
        </h5>
        <form onSubmit={handleSubmit}>
          <textarea
            name="comment"
            value={comment}
            required
            onChange={handleChange}
          />
          <button className="btn btn-sm btn-primary">
            Yes, {statusAction(status)}
          </button>
        </form>
      </div>
    );
  }
  function SaleDocs({ sale }) {
    return sale.docs.length ? (
      <div className="sale-docs">
        {sale.docs.map((doc) => renderDoc(sale, doc.doc_type))}
      </div>
    ) : (
      <span>None</span>
    );
  }
  function renderDoc(sale, type) {
    let doc = sale.docs.find((typ) => typ.doc_type === type);
    let parts = doc && doc.file ? doc.file.split("/") : [];
    let file = parts.length ? parts[parts.length - 1] : "none";
    return doc ? (
      <span className="d-flex d-nowrap" key={doc.id}>
        {type}: {doc.ref_number}
        <a href={doc.file} download={file}>
          <MatIcon name="open_in_new" />
        </a>
      </span>
    ) : null;
  }
  function doApproval(status, comment) {
    CRUD.update(
      "/makerchecker/",
      token,
      { status, checker_comment: comment },
      task.id,
      {
        onSuccess: (res) => {
          console.log(res);
          setApproval(null);
          done(true);
        },
        onFail: (res) => {
          console.log(res);
          //   done(false);
        },
      }
    );
  }
  useEffect(() => {
    if (task.task_type.name === "Sales Documents Delete") {
      CRUD.list("/sales/" + task.reference, token, {
        onSuccess: (res) => {
          console.log("Response: ", res);
          setEntity(res);
        },
        onFail: (res) => console.log(res),
      });
    }
  }, []);
  return task.task_type.name === "Sales Documents Delete" ? (
    entity ? (
      <div className="task-details">
        <div className="row">
          <label>Requested By</label>
          <span>{task.maker.username}</span>
        </div>
        <div className="row">
          <label>Request Type</label>
          <span>{task.task_type.name}</span>
        </div>
        <div className="row">
          <label>Requester Comment</label>
          <span>{task.maker_comment}</span>
        </div>
        <div className="row">
          <label>Sales Order</label>
          <span>{entity.sales_order}</span>
        </div>
        <div className="row">
          <label>Vehicle #</label>
          <span>{entity.vehicle_number}</span>
        </div>
        <div className="row">
          <label>Documents</label>
          <SaleDocs sale={entity} />
        </div>
        {task.status === "INITIATED" &&
          UserHelper.hasPriv(user, "delete_sale_docs_checker") && (
            <div className="row">
              <label>Approval for {task.task_type.name}</label>
              <div className="approval-btns p-1 mt-1">
                <button
                  className="btn btn-sm"
                  onClick={() => setApproval("REJECTED")}
                >
                  Reject
                </button>
                <button
                  className="btn btn-sm ml-1"
                  onClick={() => setApproval("APPROVED")}
                >
                  Approve
                </button>
              </div>
            </div>
          )}
        {approval && (
          <Modal
            modalId="approval-model"
            handleClose={() => setApproval(null)}
            title="Approval Confirmation"
            content={<ApprovalForm status={approval} />}
          />
        )}
      </div>
    ) : null
  ) : (
    <span>
      Unhandled request type: <b>{task.task_type.name}</b>
    </span>
  );
}

export default ManageRequest;
