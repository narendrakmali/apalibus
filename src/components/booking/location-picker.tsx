
'use client';

import React, { useState, useRef } from 'react';
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  Autocomplete,
} from '@react-google-maps/api';
import { Input } from '@/components/ui/input';
import { MapPin } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

const containerStyle = {
  width: '100%',
  height: '250px',
  borderRadius: 'var(--radius)',
};

const defaultCenter = {
  lat: 20.5937,
  lng: 78.9629,
};

const libraries: ('places' | 'drawing' | 'geometry' | 'localContext' | 'visualization')[] = ['places'];

interface LocationPickerProps {
  onLocationSelect: (location: { lat: number; lng: number }, address: string) => void;
  label: string;
}

export function LocationPicker({ onLocationSelect, label }: LocationPickerProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markerPosition, setMarkerPosition] = useState<google.maps.LatLngLiteral | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete>(null);

  const onLoad = React.useCallback(function callback(mapInstance: google.maps.Map) {
    setMap(mapInstance);
  }, []);

  const onUnmount = React.useCallback(function callback() {
    setMap(null);
  }, []);

  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry && place.geometry.location) {
        const location = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };
        map?.panTo(location);
        setMarkerPosition(location);
        if (place.formatted_address) {
            onLocationSelect(location, place.formatted_address);
        }
      }
    }
  };

  if (loadError) {
    return <div>Error loading maps. Please check your API key and configuration.</div>;
  }

  if (!isLoaded) {
    return (
        <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-[250px] w-full" />
        </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Autocomplete
          onLoad={(ref) => (autocompleteRef.current = ref)}
          onPlaceChanged={onPlaceChanged}
        >
          <Input
            type="text"
            placeholder={`Enter ${label}`}
            className="pl-10 w-full"
          />
        </Autocomplete>
      </div>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={markerPosition || defaultCenter}
        zoom={markerPosition ? 15 : 5}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
            streetViewControl: false,
            mapTypeControl: false,
        }}
      >
        {markerPosition && <Marker position={markerPosition} />}
      </GoogleMap>
    </div>
  );
}
