import React, { useEffect, useState } from 'react';
import Numbers from '../../../../_helpers/Numbers';
import CRUD from '../../../../_services/CRUD';
import Modal from '../../../modal/Modal';

function CreateInvoiceForm({ token, handleClose, category }) {
    const [invoiceable, setInvoiceable] = useState(null)
    const handleCreateInvoice = () => {
        console.log("Create invoice!")
    }
    useEffect(() => {
        CRUD.list(`/invoices/manage?category=${category.id}`, token, {
            onSuccess: (res) => setInvoiceable(res.data),
            onFail: (res) => console.error(res),
        });
    }, [category])
    return invoiceable && (
        <Modal
            modalId="invoices-create"
            title={`Invoice Summary - ${category.name}`}
            handleClose={handleClose}
            content={
                <div className="create-invoice-wrap">
                    <p>
                        Invoiceable sales are those sales with atleast Assessment and
                        C2 documents attached
            </p>
                    <div className="item">
                        <div className="label">Commission Rate</div>
                        <div className="value">
                            {Numbers.fmt(invoiceable.commission)}
                        </div>
                    </div>
                    <div className="item">
                        <div className="label">Total Quantity (Tons)</div>
                        <div className="value">
                            {Numbers.fmt(invoiceable.complete.quantity)}
                        </div>
                    </div>
                    <div className="item">
                        <div className="label">Commission Value (TZS)</div>
                        <div className="value">
                            {Numbers.fmt(
                                invoiceable.commission * invoiceable.complete.quantity
                            )}
                        </div>
                    </div>
                    <div className="invoices-footer">
                        {invoiceable.complete.quantity ? (
                            <button
                                className="btn btn-primary"
                                onClick={handleCreateInvoice}
                            >
                                Create Invoice
                            </button>
                        ) : (
                            <button
                                className="btn btn-link text-warning"
                                disabled={true}
                            >
                                No invoiceable Sales
                            </button>
                        )}
                    </div>
                </div>
            }
        />
    );
}

export default CreateInvoiceForm;