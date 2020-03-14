import React from 'react';
import Pagination from "./Pagination";
import LoadingIndicator from "./LoadingIndicator";
import CommonForm from "./CommonForm";
import CloseableModel from "../modal/ClosableModal";
import {IconPlus} from "./Incons";

class CrudTable extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {columns, data, onRowClick, isLoading, newRecord, pagination} = this.props
        let pages = 1, pageNo = 1, onPageChange = console.log
        if (pagination)
            pages = pagination.pages, pageNo = pagination.pageNo, onPageChange = pagination.onPageChange

        let form = {
            title: "Add Record",
            fields: [
                ...columns.filter(col => !col.render).map(col => {
                    return {
                        name: col.field, label: col.title, validator: col.validator
                    }
                })
            ],
            onSubmit: newRecord && newRecord.onAdd
        }
        return (
            <div className="bg-light p-2">
                {newRecord &&
                <button className="btn btn-sm btn-link float-right" onClick={newRecord.show}><IconPlus/>
                </button>}
                <table className="table table-sm table-hover table-bordered mb-0">
                    <thead className="border-none">
                    <tr className="border-none">
                        {columns.map(col =>
                            <th key={col.field}>{col.title}</th>
                        )}
                    </tr>
                    </thead>
                    <tbody>
                    {data.map(row => <tr onClick={onRowClick ? (e) => onRowClick(e, row) : null}
                                         key={row.id}
                                         className="border-none">
                        {columns.map(col => (
                            <td className="p-1" key={col.field}>{col.render ? col.render(row) : row[col.field]}</td>
                        ))}
                    </tr>)}
                    </tbody>
                </table>
                <LoadingIndicator isLoading={isLoading}/>
                {pages > 1 && <Pagination pageNo={pageNo} pages={pages} onPageChange={onPageChange}/>}
                {newRecord && <CloseableModel modalId="manageRecord" handleClose={newRecord.hide} show={newRecord.open}
                                              content={<CommonForm meta={form} onClose={newRecord.hide}/>}
                />}
            </div>
        );
    }
}

export default CrudTable;
