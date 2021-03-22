import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import CRUD from '../../../../_services/CRUD';
import Modal from '../../../modal/Modal';
import LoadingIndicator from '../../../utils/loading/LoadingIndicator';
import Snackbar from '../../../utils/notify/Snackbar';
import { numFmt } from '../../../utils/Utils';
import SaleDocsFormKigoma from '../forms/SaleDocsFormKigoma';

function SelectedSalesController({ user, selected, formData, onCreateAggregate }) {
    const [aggrCf, setAggrCf] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const [snackbar, setSnackbar] = useState(null)
    const totalValue = selected.reduce((total, val) => total + parseFloat(val.total_value), 0)
    const totalQty = selected.reduce((total, val) => total + parseFloat(val.quantity), 0)

    const aggrQty = formData ? parseFloat(formData.quantity2) : 0
    const aggrVal = formData ? parseFloat(formData.total_value2) : 0
    // const aggrCf = 0
    const aggrBal = (aggrQty + aggrCf) - totalQty
    const btnReady = () => {
        if (!formData) return false
        if (totalQty <= 0) return false
        if (aggrBal < 0 || aggrBal >= 30) return false

        return true
    }
    useEffect(() => {
        CRUD.list("/aggregate/cf", user.token, {
            onSuccess: (res) => {
                setAggrCf(parseFloat(res.data))
            }
        })
    }, [selected, formData])
    const handleSubmit = (e) => {
        setIsLoading(true)
        formData["selected"] = selected.map(r => r.id)
        console.log(formData)
        let form = new FormData();
        Object.entries(formData).forEach((entry) => {
            let key = entry[0]
            let val = entry[1]
            console.log(key, val)
            if (Array.isArray(val)) {
                val.forEach(i => {
                    form.append(`${key}[]`, i);
                })
            } else {
                form.append(key, val);
            }

        });
        CRUD.uploadDocs("/aggregate/docs", user.token, form, (res) => {
            console.log(res)
            setIsLoading(false)
            if (res.status === 0) {
                console.log("Success: ", res);
                if (onCreateAggregate) {
                    onCreateAggregate(res)
                }
            } else {
                console.error(res)
                setSnackbar({
                    message: (
                        <ol>
                            {res.errors.map((e) => (
                                <li>{e.message}</li>
                            ))}
                        </ol>
                    ),
                    timeout: 10000,
                    error: true,
                })
            }
        })
    }
    console.log("CF: ", aggrCf);
    return (
        <div className="selected-sales-controller p-2 bg-light">
            <div className="d-flex small">
                <div>{selected.length} Selected</div>
                <div>{numFmt(totalValue)}/{numFmt(aggrVal)} Value(USD)</div>
                <div>{numFmt(totalQty)}/{numFmt(aggrQty)} Quantity(Tons)</div>
                <div>{numFmt(aggrCf)} Bal CF(Tons)</div>
                {formData ? <div className={`d-flex ${!btnReady() ? "text-danger" : "text-success"}`}>
                    {aggrBal} Balance (Tons)
                </div> : <div className="text-danger">No aggregate data</div>}
                <button className="btn btn-primary btn-sm" disabled={!btnReady()} onClick={handleSubmit}>Create Aggregate</button>
            </div>
            {snackbar && (
                <Snackbar
                    message={snackbar.message}
                    timeout={snackbar.timeout}
                    error={snackbar.error}
                    done={() => console.log("Done")}
                />
            )}
            {isLoading && <LoadingIndicator isLoading={true} />}
        </div>
    );
}
export default connect(
    (state) => {
        return {
            user: state.auth.user,
            loggedIn: state.auth.loggedIn,
            newOptions: state.forms.newOptions,
        };
    },
)(SelectedSalesController)