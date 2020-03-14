import React, {Component} from 'react';
import CommonForm from "../../../utils/CommonForm";
import CloseableModel from "../../../modal/ClosableModal";
import {connect} from "react-redux";
import CRUD from "../../../../_services/CRUD";
@connect((state) => {
    return {
        user: state.auth.user
    }
})
class NewRegionForm extends Component {
    state={}
    onSubmit(data){
        CRUD.create("/regions", this.props.user.token, data, {
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
            title: "New Region",
            fields: [
                {name: 'name', label: "Name"},
                {name: 'small', label: "Small(Ton)"},
                {name: 'medium', label: "Medium(Ton)"},
                {name: 'large', label: "Large(Ton)"},
                {name: 'xlarge', label: "Extra Large(Ton)"},
            ],
            onSubmit: this.onSubmit.bind(this)
        }
        const onClose = this.props.onClose
        return (
            <CloseableModel
                modalId="manageRecord-Region"
                handleClose={onClose}
                show={true}
                content={<CommonForm meta={form} onClose={onClose}/>}/>
        );
    }
}

export default NewRegionForm;
