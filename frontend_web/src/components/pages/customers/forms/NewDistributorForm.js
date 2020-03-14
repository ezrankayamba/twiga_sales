import React, {Component} from 'react';
import CommonForm from "../../../utils/CommonForm";
import CloseableModel from "../../../modal/ClosableModal";
import CRUD from "../../../../_services/CRUD";
import {connect} from "react-redux";

@connect((state) => {
    return {
        user: state.auth.user
    }
})
class NewDistributorForm extends Component {
    state = {}

    onSubmit(data) {
        console.log(data)
        CRUD.create("/distributors", this.props.user.token, data, {
            onSuccess: (res) => {
                console.log(res)
                if (this.props.onOtherSubmit) {
                    this.props.onOtherSubmit(res)
                }
                this.props.onClose(data)
            }, onFail: (error) => {
                console.error(error)
            }
        })
    }

    render() {
        let form = {
            title: "New Distributor",
            fields: [
                {name: 'name', label: "Name"},
            ],
            onSubmit: this.onSubmit.bind(this)
        }
        const onClose = this.props.onClose
        return (
            <CloseableModel
                modalId="manageRecord-Distributor"
                handleClose={onClose}
                show={true}
                content={<CommonForm meta={form} onClose={onClose}/>}/>
        );
    }
}

export default NewDistributorForm;
