import React, {Component} from 'react';
import {Map, GoogleApiWrapper} from 'google-maps-react';
import {GOOGLE_API_KEY} from "../../../../conf";
import LocationUtils from "../../../../_helpers/LocationUtils";

const mapStyles = {
    width: '100%',
    height: '100%',
};

class LocationMap extends Component {
    state = {
        center: null
    }

    componentDidMount() {
        LocationUtils.capture({
            onSuccess: (loc) => {
                console.log(loc)
                this.setState({center: loc})
            }, onFail: (err) => {
                console.log(err)
            }
        })
    }

    render() {
        const center = this.state.center
        console.log(center)
        return center && (
            <Map
                google={this.props.google}
                zoom={10}
                style={mapStyles}
                initialCenter={center}
            />
        );
    }
}

export default GoogleApiWrapper({
    apiKey: GOOGLE_API_KEY
})(LocationMap);
