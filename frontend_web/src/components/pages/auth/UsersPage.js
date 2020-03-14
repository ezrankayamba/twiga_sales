import React, {Component} from 'react';
import {connect} from "react-redux";
import CommonForm from "../../utils/CommonForm";
import LoadingIndicator from "../../utils/LoadingIndicator";
import Snackbar from "../../utils/notify/Snackbar";
import BasicCrudView from "../../utils/BasicCrudView";
import {createUser, deleteUser, fetchRoles, fetchUsers} from "../../../_services/AuthService";
import {IconPlus, IconTrash} from "../../utils/Incons";
import Modal from "../../modal/Modal";

@connect((state) => {
    return {
        user: state.auth.user,
        loggedIn: state.auth.loggedIn
    }
})
class UsersPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            users: [], roles: [], isLoading: false, snackbar: null, openAdd: false,
            pages: 1, pageNo: 1
        }
        this.snackDone = this.snackDone.bind(this)
        this.newComplete = this.newComplete.bind(this)
        this.onPageChange = this.onPageChange.bind(this)
    }

    onPageChange(pageNo) {
        this.setState({pageNo})
        this.refresh(pageNo)
    }

    snackDone() {
        this.setState({snackbar: null})
    }
    onDelete(e, row){
        e.stopPropagation()
        deleteUser(this.props.user.token, row.id, (res)=>{
            console.log(res)
            if(res){
                this.refresh()
            }
        })
    }

    refresh(page = 1) {
        this.setState({isLoading: true, pageNo: page}, () =>
            fetchUsers(this.props.user.token, page, (res) => {
                if (res) {
                    this.setState({
                        users: res.data.map(u => {
                            return {...u, role: u.profile && u.profile.role ? u.profile.role.name : "No role assigned"}
                        }), isLoading: false,
                        pages: parseInt(res.pages)
                    })
                }
            }))
    }

    componentDidMount() {
        fetchRoles(this.props.user.token, (res) => {
            this.setState({roles: res})
        })
        this.refresh()
    }

    onRowClick(row) {
        console.log(row)
    }

    newComplete(param) {
        this.setState({openAdd: false})
    }

    onAdd(params, cb) {
        createUser(this.props.user.token, params, (res) => {
            if (res) {
                cb(true)
                this.setState({openAdd: false}, this.refresh)
            }
        })
    }

    render() {
        const {loggedIn} = this.props
        const {isLoading, snackbar, openAdd} = this.state
        let {users, pages, pageNo, roles} = this.state;

        let data = {
            records: users,
            headers: [
                {field: 'id', title: 'UserID'},
                {field: 'username', title: 'Username'},
                {field: 'role', title: 'Role'},
                {
                    field: 'action', title: 'Action',
                    render: rowData => <button className="btn btn-sm btn-link text-danger"
                                               onClick={(e)=>this.onDelete(e, rowData)}><IconTrash/></button>
                },
            ],
            title: 'List of users'
        }

        const pagination = {pages, pageNo, onPageChange: this.onPageChange}

        let form = {
            title: "User Form",
            fields: [
                {
                    name: 'username', label: "Username", validator: {
                        valid: (val) => val ? val.length >= 5 : false,
                        error: "Username should be at least 5 characters"
                    }
                },
                {name: 'role', label: "Role", type: "select", options: roles},
            ],
            onSubmit: this.onAdd.bind(this)
        }

        return (
            <div className="row">
                <div className="col">
                    <div className="row pt-2 pb-2 d-flex">
                        <div className="col-md">
                            <h5>List of users</h5>
                        </div>
                        <div className="col-md">
                            <div className="btn-group float-md-right">
                                <button className="btn btn-link p-0" onClick={() => this.setState({openAdd: true})}>
                                    <IconPlus/></button>
                            </div>
                        </div>
                    </div>
                    <BasicCrudView title={data.title} data={data} pagination={pagination}
                                   onDeleteAll={this.doDeleteSelected}
                                   isLoading={isLoading} onRowClick={this.onRowClick.bind(this)}/>
                    <LoadingIndicator isLoading={isLoading}/>
                    {snackbar && <Snackbar message={snackbar.message} timeout={snackbar.timeout} done={this.snackDone}
                                           error={snackbar.error}/>}
                    {openAdd &&
                    <Modal title={form.title} modalId="addUserForm" handleClose={() => this.newComplete(false)}
                           show={openAdd}
                           content={<CommonForm meta={{...form, title: null}}/>}/>}
                </div>
            </div>
        );
    }
}

export default UsersPage
