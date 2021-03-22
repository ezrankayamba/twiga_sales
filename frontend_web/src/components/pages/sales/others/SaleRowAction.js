import React from 'react';
import MatIcon from '../../../utils/icons/MatIcon';

function SaleRowAction({ row, allowAdd, triggerAdd, triggerDelete }) {
    let docs = row.aggregate ? docs = row.aggregate.docs : row.docs;
    return (
        <span>
            {docs.length === 0 ? (
                allowAdd ? (
                    <button
                        className="btn btn-link d-flex"
                        onClick={triggerAdd}
                    >
                        <MatIcon name="attach_file" />
                    </button>
                ) : null
            ) : row.invoice ? null : row.task &&
                row.task.status === "INITIATED" ? (
                <span>Pending approval</span>
            ) : (
                row.aggregate ? null : <button
                    className="btn btn-link d-flex"
                    onClick={triggerDelete}
                >
                    <MatIcon name="delete" extra="text-danger" />
                </button>
            )}
        </span>
    );
}

export default SaleRowAction;