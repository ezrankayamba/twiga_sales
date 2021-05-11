import React, { Component } from 'react';
import { Route, Switch, Redirect } from "react-router-dom";
import getMenus from "./menus";
import { connect } from "react-redux";
import { getPrivileges } from "../../_services/AuthService";

@connect((state) => {
    return {
        loggedIn: state.auth.loggedIn,
        user: state.auth.user
    }
})
class Pages extends Component {
    render() {
        const { user } = this.props
        let privileges = getPrivileges(user)
        let menus = getMenus(this.props.loggedIn, privileges)
        let role = user.profile.role
        return (
            <Switch>
                {menus.map(item => {
                    return <Route key={item.id} exact path={item.path} component={item.component} />
                })}
                <Redirect to={role ? role.path : "/"} />
            </Switch>
        );
    }
}

export default Pages;
