import React, {Component} from 'react';
import {connect} from "react-redux";
import {IconPerson, IconSettings, IconSignOut} from "../utils/icons/Incons";

@connect((state) => {
    return {
        user: state.auth.user,
        loggedIn: state.auth.loggedIn
    }
})
class TopHeader extends Component {
    render() {
        const {user, loggedIn} = this.props
        return (
            <>
                <div className="br-header-left">
                    <div className="navicon-left hidden-md-down"><a id="btnLeftMenu" href=""><i
                        className="icon ion-navicon-round"></i></a></div>
                    <div className="navicon-left hidden-lg-up"><a id="btnLeftMenuMobile" href=""><i
                        className="icon ion-navicon-round"></i></a></div>
                    {loggedIn && <>
                        <div className="input-group hidden-xs-down wd-170 transition">
                            <input id="searchbox" type="text" className="form-control m-auto" placeholder="Search"/>
                            <span className="input-group-btn">
                                <button className="btn btn-secondary" type="button"><i
                                    className="ion ion-ios-search-strong tx-24"></i></button>
                            </span>
                        </div>
                    </>}
                </div>
                <div className="br-header-right">
                    {loggedIn && <nav className="nav">
                        <div className="dropdown">
                            <a href="" className="nav-link pd-x-7 pos-relative" data-toggle="dropdown">
                                <i className="icon ion-ios-bell-outline tx-24"></i>
                                <span className="square-8 bg-danger pos-absolute t-15 r-5 rounded-circle"></span>
                            </a>
                            <div className="dropdown-menu dropdown-menu-header wd-300 pd-0-force">
                                <div
                                    className="d-flex align-items-center justify-content-between pd-y-10 pd-x-20 bd-b bd-gray-200">
                                    <label
                                        className="tx-12 tx-info tx-uppercase tx-semibold tx-spacing-2 mg-b-0">Notifications</label>
                                    <a href="" className="tx-11">Mark All as Read</a>
                                </div>
                                <div className="media-list">
                                    <a href="" className="media-list-link read">
                                        <div className="media pd-x-20 pd-y-15">
                                            <img src="http://via.placeholder.com/280x280"
                                                 className="wd-40 rounded-circle" alt=""/>
                                            <div className="media-body">
                                                <p className="tx-13 mg-b-0 tx-gray-700"><strong
                                                    className="tx-medium tx-gray-800">Suzzeth
                                                    Bungaos</strong> tagged you and 18 others in a post.</p>
                                                <span className="tx-12">October 03, 2017 8:45am</span>
                                            </div>
                                        </div>
                                    </a>
                                    <a href="" className="media-list-link read">
                                        <div className="media pd-x-20 pd-y-15">
                                            <img src="http://via.placeholder.com/280x280"
                                                 className="wd-40 rounded-circle" alt=""/>
                                            <div className="media-body">
                                                <p className="tx-13 mg-b-0 tx-gray-700"><strong
                                                    className="tx-medium tx-gray-800">Mellisa
                                                    Brown</strong> appreciated your work <strong
                                                    className="tx-medium tx-gray-800">The Social
                                                    Network</strong></p>
                                                <span className="tx-12">October 02, 2017 12:44am</span>
                                            </div>
                                        </div>
                                    </a>
                                </div>
                            </div>
                        </div>
                        <div className="dropdown">
                            <a href="" className="nav-link nav-link-profile" data-toggle="dropdown">
                                <span className="logged-name hidden-md-down">{user.username}</span>
                                <img src="http://via.placeholder.com/64x64" className="wd-32 rounded-circle"
                                     alt=""/>
                                <span className="square-10 bg-success"></span>
                            </a>
                            <div className="dropdown-menu dropdown-menu-header wd-200">
                                <ul className="list-unstyled user-profile-nav">
                                    <li><a href=""><IconPerson/> Edit Profile</a></li>
                                    <li><a href=""><IconSettings/> Settings</a></li>
                                    <li><a href="/logout"><IconSignOut/> Sign Out</a></li>
                                </ul>
                            </div>
                        </div>
                    </nav>}
                    {!loggedIn &&
                    <div className="nav pr-3"><a href="/login"><i className="icon ion-power"></i> Sign In</a></div>}
                </div>
            </>
        );
    }
}

export default TopHeader;
