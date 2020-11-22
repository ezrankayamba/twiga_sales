import React, {Component} from 'react';
import {connect} from "react-redux";
import {logout} from "../../../redux/auth/actions";
import {Redirect} from "react-router-dom";

@connect((state) => {
    return {}
}, {logout: logout})
class LogoutPage extends Component {

    render() {
        this.props.logout()
        return <Redirect to="/login"/>
    }
}

export default LogoutPage;