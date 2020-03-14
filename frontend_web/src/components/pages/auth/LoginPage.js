import React, {Component} from 'react';
import {Redirect} from "react-router-dom";
import {login, logout} from "../../../redux/auth/actions";
import {connect} from "react-redux";
import CommonForm from "../../utils/CommonForm";
import LoadingIndicator from "../../utils/LoadingIndicator";
import Snackbar from "../../utils/notify/Snackbar";

@connect((state) => {
    return {
        user: state.auth.user,
        loggedIn: state.auth.loggedIn
    }
}, {
    login: login,
    logout: logout
})
class LoginPage extends Component {
    constructor(props) {
        super(props);
        this.state = {isLoading: false, snackbar: null}
        this.snackDone = this.snackDone.bind(this)
    }

    snackDone() {
        this.setState({snackbar: null})
    }

    submitLogin({username, password}) {
        this.setState({isLoading: true})
        this.props.login({username, password, history: this.props.history}, (res) => {
            if (!res) {
                this.setState({
                    isLoading: false,
                    snackbar: {message: "Login failed, try correct credentials", timeout: 1000, error: true}
                })
            }
        });
    }

    render() {
        const {loggedIn} = this.props
        const {isLoading, snackbar} = this.state
        let form = {
            title: "Login Form",
            fields: [
                {
                    name: 'username', label: "Username", validator: {
                        valid: (val) => val ? val.length >= 5 : false,
                        error: "Username should be at least 5 characters"
                    }
                },
                {name: 'password', label: "Password", type: "password"},
            ],
            onSubmit: this.submitLogin.bind(this)
        }

        if (loggedIn) {
            return (
                <Redirect to="/"/>
            )
        }
        return (
            <div className="row mt-3">
                <div className="col-md-6 offset-md-3"><CommonForm meta={form}/></div>
                <LoadingIndicator isLoading={isLoading}/>
                {snackbar && <Snackbar message={snackbar.message} timeout={snackbar.timeout} done={this.snackDone}
                                       error={snackbar.error}/>}
            </div>
        );
    }
}

export default LoginPage
