'use client';

import { GoogleMap, Marker, DirectionsRenderer } from '@react-google-maps/api';
import { useState, useEffect } from 'react';

interface Location {
  address: string;
  lat?: number;
  lng?: number;
}

interface MapViewProps {
  from: Location;
  to: Location;
  onMapClick: (e: google.maps.MapMouseEvent) => void;
  selecting: 'from' | 'to' | null;
}

const containerStyle = {
  width: '100%',
  height: '100%',
};

// Center of Mumbai
const defaultCenter = {
  lat: 19.0760,
  lng: 72.8777
};

const MapView = ({ from, to, onMapClick, selecting }: MapViewProps) => {
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);

  useEffect(() => {
    if (from.lat && from.lng && to.lat && to.lng) {
      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route(
        {
          origin: { lat: from.lat, lng: from.lng },
          destination: { lat: to.lat, lng: to.lng },
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            setDirections(result);
          } else {
            console.error(`error fetching directions ${result}`);
          }
        }
      );
    } else {
      setDirections(null); // Clear directions if locations are incomplete
    }
  }, [from, to]);

  const mapOptions = {
    cursor: selecting ? 'crosshair' : 'default',
  };

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={from.lat && from.lng ? { lat: from.lat, lng: from.lng } : defaultCenter}
      zoom={10}
      onClick={onMapClick}
      options={mapOptions}
    >
      {from.lat && from.lng && <Marker position={{ lat: from.lat, lng: from.lng }} label="F" />}
      {to.lat && to.lng && <Marker position={{ lat: to.lat, lng: to.lng }} label="T" />}

      {directions && (
        <DirectionsRenderer
          directions={directions}
          options={{
            suppressMarkers: true, // We are using our own markers
            polylineOptions: {
              strokeColor: '#FF5722',
              strokeOpacity: 0.8,
              strokeWeight: 5,
            },
          }}
        />
      )}
    </GoogleMap>
  );
};

export default MapView;
