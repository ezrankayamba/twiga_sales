import React, { Component } from "react";
import { Map, InfoWindow, Marker, GoogleApiWrapper } from "google-maps-react";
import { GOOGLE_API_KEY } from "../../../conf";
import "./Map.css";
const containerStyle = {
  position: "relative",
  width: "100%",
  height: "100%",
};
class MapPicker extends Component {
  constructor(props) {
    super(props);
    console.log("Props: ", props);
    this.state = { position: props.position };
  }
  onMarkerClick(e) {
    console.log(e);
  }
  onInfoWindowClose(e) {
    console.log(e);
  }
  onMapClicked(mapProps, map, evt) {
    this.setState(
      {
        position: { lat: evt.latLng.lat(), lng: evt.latLng.lng() },
      },
      () => {
        console.log(`${this.state.position.lat},${this.state.position.lng}`);
      }
    );
  }
  render() {
    const { mapId, onPositionSelect } = this.props;
    const { position } = this.state;
    return (
      <div id={mapId} className="map-container">
        <Map
          google={this.props.google}
          zoom={6}
          initialCenter={{
            lat: -6.192,
            lng: 35.7699,
          }}
          containerStyle={containerStyle}
          onClick={this.onMapClicked.bind(this)}
        >
          {position && (
            <Marker onClick={this.onMarkerClick} position={position} />
          )}

          <InfoWindow onClose={this.onInfoWindowClose}>
            <div>
              <h1>Name Here</h1>
            </div>
          </InfoWindow>
        </Map>
        <button
          type="button"
          className="btn btn-sm btn-primary"
          disabled={!position}
          onClick={() => onPositionSelect(position)}
        >
          Select Location
        </button>
      </div>
    );
  }
}

export default GoogleApiWrapper({
  apiKey: GOOGLE_API_KEY,
})(MapPicker);
