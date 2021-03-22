import React, { useEffect, useRef, useState } from 'react';
import BasicCrudView from '../../../utils/crud/BasicCrudView';
import SaleDocsFormKigoma from '../forms/SaleDocsFormKigoma';
import SelectedSalesController from './SelectedSalesController';

function CustomerUnAssignedSales({ sales, onCreateAggregate }) {
    const [selected, setSelected] = useState([])
    const [formData, setFormData] = useState(null)
    const refCheckAll = useRef(null)

    useEffect(() => {
        setSelected([])
    }, [sales])
    useEffect(() => {
        if (refCheckAll.current === null) return
        if (allUnChecked()) {
            refCheckAll.current.checked = false
            refCheckAll.current.indeterminate = false
        } else if (allChecked()) {
            refCheckAll.current.checked = true
            refCheckAll.current.indeterminate = false
        } else {
            refCheckAll.current.indeterminate = true
        }
    }, [selected])
    const allChecked = () => selected.length === sales.length
    const allUnChecked = () => selected.length === 0
    const isSelected = (id) => {
        console.log(id, selected.map(r => r.id))
        let tmp = selected.find((s) => s.id === id)
        // console.log(id, tmp);
        return tmp !== undefined
    }

    const handleUpdate = (data) => {
        setFormData(data)
    }

    const selectOrUnselectAll = () => {
        setSelected(allChecked() ? [] : [...sales])
    }
    const handleChange = (row, e) => {
        if (!isSelected(row.id)) {
            setSelected([...selected, row])
        } else {
            setSelected(selected.filter((s => s.id !== row.id)))
        }
    }
    let data = {
        records: sales.map((s) => {
            return { ...s, selected: isSelected(s.id) }
        }),
        headers: [
            { field: "selected", title: "Pick", render: (row) => <input type="checkbox" checked={isSelected(row.id)} onChange={(e) => handleChange(row, e)} /> },
            { field: "transaction_date", title: "Trans Date", },
            { field: "customer_name", title: "Customer", },
            { field: "delivery_note", title: "Delivery Note", },
            { field: "vehicle_number", title: "Veh#", },
            { field: "tax_invoice", title: "Tax Invoice", },
            { field: "sales_order", title: "SO#", },
            { field: "product_name", title: "Product", },
            { field: "destination", title: "Destination", },
        ],
        title: "List of un-assigned sales",
        rowClass: (row) => {
            let cls = isSelected(row.id) ? "selected" : "not-selected"
            console.log(row.id, cls);
            return cls
        }
    };

    return (
        <div className="customer-un-assigned-sales">
            {data.records.length ? <>
                <div className="d-flex">
                    <SaleDocsFormKigoma onUpdate={handleUpdate} />
                    <div>
                        <div className="d-flex mt-2">
                            <h5 className="p-2">{data.title}</h5>
                            <p>{sales.length} total</p>
                            <label><input ref={refCheckAll} type="checkbox" onChange={selectOrUnselectAll} /> Select all</label>
                        </div>
                        <BasicCrudView data={data} />
                    </div>
                </div>
                <SelectedSalesController selected={selected} formData={formData} onCreateAggregate={onCreateAggregate} />
            </> : <p className="p-2">No data available!</p>}
        </div>
    );
}

export default CustomerUnAssignedSales;