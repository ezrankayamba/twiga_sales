import React, {Component} from 'react';
import {connect} from "react-redux";
import {logout} from "../redux/auth/actions";
import getMenus from "./menus";
import {NavLink} from "react-router-dom";
import {getPrivileges} from "../_services/AuthService";

@connect((state) => {
    return {
        loggedIn: state.auth.loggedIn,
        user: state.auth.user
    }
}, {logout: logout})
class SideMenu extends Component {
    render() {
        let {loggedIn, user} = this.props

        let privileges = getPrivileges(user)
        return (
            <div className="br-sideleft overflow-y-auto">
                <div className="br-sideleft-menu">
                    {getMenus(loggedIn, privileges).map((item) => {
                        return (
                            <NavLink key={item.id} to={item.path} className="br-menu-link">
                                <div className="br-menu-item">
                                    <item.Icon/>
                                    <span className="menu-item-label">{item.name}</span>
                                </div>
                            </NavLink>
                        )
                    })}
                </div>
                <br/>
            </div>
        );
    }
}

export default SideMenu;
