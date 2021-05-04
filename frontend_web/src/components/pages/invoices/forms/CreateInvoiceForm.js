import React, { useEffect, useState } from 'react';
import Numbers from '../../../../_helpers/Numbers';
import CRUD from '../../../../_services/CRUD';
import Modal from '../../../modal/Modal';
import Snackbar from '../../../utils/notify/Snackbar';

function CreateInvoiceForm({ token, handleClose, category }) {
    const [invoiceable, setInvoiceable] = useState(null)
    const [snackbar, setSnackbar] = useState(null)
    const handleCreateInvoice = () => {
        console.log("Create invoice!")
        CRUD.create(`/invoices/manage?category=${category.id}`, token, {}, {
            onSuccess: (res) => {
                console.log(res)
                setSnackbar({
                    error: res.result !== 0,
                    message: res.message,
                    timeout: 5000,
                    done: () => {
                        if (res.result === 0) {
                            handleClose(res)
                        } else {
                            setSnackbar(null)
                        }
                    }
                })
            }, onFail: (res) => {
                console.error(res)
                setSnackbar({
                    error: true,
                    message: res.message,
                    timeout: 5000,
                    done: () => setSnackbar(null)
                })
            }
        })
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
                        C2 documents attached</p>
                    <div className="item">
                        <div className="label">Commission Rate</div>
                        <div className="value">
                            {Numbers.fmt(invoiceable.commission)}
                        </div>
                    </div>
                    <div className="item">
                        <div className="label">Volume</div>
                        <div className="value">
                            {Numbers.fmt(invoiceable.complete.volume)}
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
                    {snackbar && <Snackbar {...snackbar} />}
                </div>
            }
        />
    );
}

export default CreateInvoiceForm;