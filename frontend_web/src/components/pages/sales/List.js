import React, {Component} from 'react';

import {
    createSale,
    fetchSales, importSales, uploadDocs
} from "../../../_services/SalesService";
import {connect} from "react-redux";
import BasicCrudView from "../../utils/BasicCrudView";
import LoadingIndicator from "../../utils/LoadingIndicator";
import {IconFile, IconPayment, IconPlus, IconTrash, IconUpload} from "../../utils/Incons";
import {DateTime} from "../../../_helpers/DateTime";
import CRUD from "../../../_services/CRUD";
import SalesImportForm from "./forms/SalesImportForm";
import DocumentsUploadForm from "./forms/DocumentsUploadForm";


@connect((state) => {
    return {
        user: state.auth.user
    }
})
class List extends Component {
    constructor(props) {
        super(props);
        this.state = {
            sales: [],
            fileUploadSales: false,
            fileUploadDocs: false,
            pages: 1,
            pageNo: 1,
            isLoading: false,
            types: [],
            x: 0,
            y: 0
        }

        this.doUpdate = this.doUpdate.bind(this)
        this.onClose = this.onClose.bind(this)
        this.onPageChange = this.onPageChange.bind(this)
        this.doAdd = this.doAdd.bind(this)
        this.onDelete = this.onDelete.bind(this)
    }

    onPageChange(pageNo) {
        this.setState({pageNo})
        this.refresh(pageNo)
    }

    refresh(page = 1) {
        this.setState({isLoading: true}, () =>
            fetchSales(this.props.user.token, page, (res) => {
                if (res) {
                    this.setState({
                        sales: res.data.map(c => {
                            return {
                                ...c,
                                c2_doc: c.c2_doc ? c.c2_doc.ref_number : null,
                                assessment_doc: c.assessment_doc ? c.assessment_doc.ref_number : null,
                                exit_doc: c.exit_doc ? c.exit_doc.ref_number : null,
                                transaction_date: DateTime.fmt(c.transaction_date, "DD/MM/YYYY"),
                                created_at: DateTime.fmt(c.created_at),
                            }
                        }), isLoading: false,
                        pages: parseInt(res.pages)
                    })
                }
            }))
    }

    componentDidMount() {
        this.refresh()
    }

    onDelete(e, params) {
        e.stopPropagation()
        console.log("onDelete", params)
    }

    doAdd(params, cb) {
        this.setState({isLoading: true})
        let body = {...params}
        console.log(body)
        createSale(this.props.user.token, body, (res) => {
            if (cb) cb(true)
            this.setState({fileUpload: false}, () => this.refresh())
        });
    }

    doUpdate(params) {
        let body = {id: params.id, name: params.name, account: params.account}
        console.log("doDelete", body)
    }

    onClose(e) {
        this.setState({openAdd: false})
    }

    onRowClick(e, row) {
        console.log(row)
        this.setState({selected: row, openDetail: true}, () => console.log(this.state))
    }

    fileUploadSalesComplete(data) {
        console.log(data)
        this.setState({fileUploadSales: false})
        if (data) {
            this.setState({isLoading: true})
            importSales(this.props.user.token, data, (res) => {
                console.log(res)
                this.setState({isLoading: true})
                this.refresh()
            })
        }
    }

    fileUploadDocsComplete(data) {
        console.log(data)
        this.setState({fileUploadDocs: false})
        if (data) {
            this.setState({isLoading: true})
            uploadDocs(this.props.user.token, data, (res) => {
                console.log(res)
                this.setState({isLoading: true})
                this.refresh()
            })
        }
    }

    render() {
        let {sales, pages, pageNo, openDetail, selected} = this.state;
        let data = {
            records: sales,
            headers: [
                {field: 'id', title: 'ID'},
                {field: 'transaction_date', title: 'Trans Date'},
                {field: 'customer_name', title: 'Customer'},
                {field: 'delivery_note', title: 'Delivery Note'},
                {field: 'vehicle_number', title: 'Veh#'},
                {field: 'tax_invoice', title: 'Tax Invoice'},
                {field: 'sales_order', title: 'SO#'},
                {field: 'product_name', title: 'Product'},
                {field: 'quantity', title: 'Qty(Tons)'},
                {field: 'total_value', title: 'Value'},
                {field: 'destination', title: 'Destination'},
                {field: 'agent_name', title: 'Agent'},
                {field: 'c2_number', title: 'C2'},
                {field: 'assessment_number', title: 'Assessment'},
                {field: 'exit_number', title: 'Exit'},
                {
                    field: 'action', title: 'Action',
                    render: rowData => <button className="btn btn-sm btn-link text-danger p-0"
                                               onClick={(e) => this.onDelete(e, rowData)}><IconTrash/></button>
                },
            ],
            title: 'List of customers'
        }

        const pagination = {pages, pageNo, onPageChange: this.onPageChange}
        return (
            <div className="row">
                <div className="col">
                    <div className="row pt-2 pb-2 d-flex">
                        <div className="col-md">
                            <h5>{data.title}</h5>
                        </div>
                        <div className="col-md">
                            <div className="float-md-right">
                                <button className="btn btn-secondary btn-sm" onClick={(e) => this.setState({
                                    fileUploadDocs: true,
                                    x: e.nativeEvent.offsetX,
                                    y: e.nativeEvent.offsetY + 100
                                })}>
                                    <IconFile/><span className="pl-2">Import Documents</span>
                                </button>
                                <button className="btn btn-primary btn-sm ml-2" onClick={(e) => this.setState({
                                    fileUploadSales: true,
                                    x: e.nativeEvent.offsetX,
                                    y: e.nativeEvent.offsetY + 100
                                })}>
                                    <IconPayment/><span className="pl-2">Import Sales</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    <BasicCrudView onRowClick={this.onRowClick.bind(this)} pagination={pagination} data={data}
                                   onUpdate={this.doUpdate} onDelete={this.onDelete} onAdd={this.doAdd} toolbar={true}/>
                    {this.state.fileUploadDocs &&
                    <DocumentsUploadForm position={this.state.y} open={this.state.fileUploadDocs}
                                         complete={this.fileUploadDocsComplete.bind(this)}/>}
                    {this.state.fileUploadSales &&
                    <SalesImportForm position={this.state.y} open={this.state.fileUploadSales}
                                     complete={this.fileUploadSalesComplete.bind(this)}/>}
                    {this.state.isLoading && <LoadingIndicator isLoading={this.state.isLoading}/>}
                </div>
            </div>
        );
    }
}

export default List;
