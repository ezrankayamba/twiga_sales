import React, {Component} from 'react';
import CommonForm from "../../../utils/CommonForm";
import CloseableModel from "../../../modal/ClosableModal";
import NewDistributorForm from "./NewDistributorForm";
import NewRegionForm from "./NewRegionForm";
import {connect} from "react-redux";
import CRUD from "../../../../_services/CRUD";
import {addNewOption, clearNewOptions} from "../../../../redux/forms/actions";

@connect((state) => {
    return {
        user: state.auth.user
    }
}, {addOption: addNewOption, clearOptions:clearNewOptions})
class NewCustomerForm extends Component {
    state = {popup: null, distributors: [], regions: [], types: []}

    componentDidMount() {
        CRUD.list("/distributors", this.props.user.token,
            {onSuccess: (distributors) => this.setState({distributors})})
        CRUD.list("/regions", this.props.user.token,
            {onSuccess: (regions) => this.setState({regions})})
        CRUD.list("/types", this.props.user.token,
            {onSuccess: (types) => this.setState({types})})
        this.props.clearOptions()
    }

    onOtherSubmit(field, {id, name, ...rest}) {
        this.props.addOption(field, {id, name})
    }

    onClose(e) {
        this.setState({popup: null})
        // this.props.onClose(false)
    }

    onShowPopup(popup) {
        this.setState({popup})
    }

    render() {
        const {onSubmit} = this.props
        const {types, regions, distributors} = this.state
        let form = {
            title: "New Customer",
            fields: [
                {name: 'name', label: "Name"},
                {name: 'location', label: "Location", type: 'location'},
                {
                    name: 'distributor',
                    label: "Distributor",
                    type: 'select',
                    options: distributors,
                    other: true,
                    component: NewDistributorForm
                },
                {
                    name: 'region',
                    label: "Region",
                    type: 'select',
                    options: regions,
                    other: true,
                    component: NewRegionForm
                },
                {name: 'customer_type', label: "Type", type: 'select', options: types, value: "RET"},
            ],
            onSubmit: onSubmit
        }
        const onClose = this.props.onClose
        const {popup} = this.state
        return (
            <>
                <CloseableModel
                    modalId="manageRecord-Customer"
                    handleClose={onClose}
                    show={true}
                    content={<CommonForm meta={form} onClose={onClose}
                                         onShowPopup={this.onShowPopup.bind(this)}/>}/>
                {form.fields.filter(f => f.component).map(f => {
                    return popup && popup === f.name &&
                        <f.component onClose={this.onClose.bind(this)}
                                     onOtherSubmit={(data) => this.onOtherSubmit(f.name, data)}
                                     key={f.name}/>
                })}
            </>
        );
    }
}

export default NewCustomerForm;
