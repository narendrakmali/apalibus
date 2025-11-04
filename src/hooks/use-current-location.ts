
'use client';

import { useState, useEffect } from 'react';

export const useCurrentLocation = (isGoogleMapsLoaded: boolean) => {
  const [locationName, setLocationName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isGoogleMapsLoaded) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const geocoder = new window.google.maps.Geocoder();
          const latlng = { lat: latitude, lng: longitude };

          geocoder.geocode({ location: latlng }, (results, status) => {
            if (status === 'OK') {
              if (results && results[0]) {
                // Find a suitable address component, like locality or administrative_area_level_2
                 const cityComponent = results.find(result => 
                    result.types.includes('locality') || 
                    result.types.includes('administrative_area_level_2')
                );

                if (cityComponent) {
                    setLocationName(cityComponent.formatted_address);
                } else {
                    setLocationName(results[0].formatted_address);
                }
              } else {
                setError('No results found for your location.');
              }
            } else {
              setError(`Geocoder failed due to: ${status}`);
            }
          });
        },
        (err) => {
          setError(`Geolocation error: ${err.message}`);
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
    }
  }, [isGoogleMapsLoaded]);

  return { locationName, error };
};
