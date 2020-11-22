import React, {Component} from 'react';
import Avatar from "@material-ui/core/Avatar";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import Badge from "@material-ui/core/Badge";
import NotificationsIcon from "@material-ui/icons/Notifications";
import Box from "@material-ui/core/Box";
import {Link, NavLink} from "react-router-dom";
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import MenuItem from "@material-ui/core/MenuItem";
import Menu from "@material-ui/core/Menu";
import AccountBoxIcon from '@material-ui/icons/AccountBox';

class UserInfoView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
            anchor: null
        }
        this.handleClose = this.handleClose.bind(this)
        this.toggle = this.toggle.bind(this)
    }

    toggle(e) {
        if (this.state.open) {
            this.setState({open: false, anchor: null})
        } else {
            this.setState({open: true, anchor: e.currentTarget})
        }

    }

    handleClose(e) {
        this.setState({open: false, anchor: null})
    }

    render() {
        const {user, loggedIn} = this.props
        if (!user || !user.profile) {
            return null
        }
        let profile = user.profile
        let disp = loggedIn && `${profile ? profile.role.name : 'None'} <${user.username}>`
        return (
            <Box>
                {loggedIn && <>
                    <Typography display="inline" color="textSecondary">{disp}</Typography>
                    <IconButton aria-controls="simple-menu" aria-haspopup="true" onClick={this.toggle}>
                        <Avatar alt="Remy Sharp" src={user.profile.image}/>
                    </IconButton>
                    <Menu id="simple-menu"
                          open={this.state.open}
                          anchorEl={this.state.anchor}
                          keepMounted
                          onClose={this.handleClose}>
                        <MenuItem onClick={this.handleClose} className="p-0">
                            <Link to="/" className="btn btn-sm"><AccountBoxIcon/> My profile</Link>
                        </MenuItem>
                        <MenuItem onClick={this.handleClose} className="p-0">
                            <Link to="/logout" className="btn btn-sm"><ExitToAppIcon/> Logout</Link>
                        </MenuItem>
                    </Menu>
                    <IconButton color="inherit">
                        <Badge badgeContent={4} color="secondary">
                            <NotificationsIcon/>
                        </Badge>
                    </IconButton>
                </>}
                {!loggedIn && <>
                    <Link to="/login" className="btn"><ExitToAppIcon/> Login</Link>
                </>}
            </Box>
        );
    }
}

export default UserInfoView;