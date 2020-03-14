import React, {Component} from 'react';
import {IconLoading} from "./Incons";

class LoadingIndicator extends Component {
    render() {
        const {isLoading} = this.props
        return isLoading ? (
            <div className="loading-indicator">
                <IconLoading/>
            </div>
        ) : null;
    }
}

export default LoadingIndicator;
