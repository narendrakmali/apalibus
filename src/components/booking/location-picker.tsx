'use client';

import React, { useRef } from 'react';
import { useJsApiLoader, Autocomplete } from '@react-google-maps/api';
import { Input } from '@/components/ui/input';
import { MapPin } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

const libraries: ('places' | 'drawing' | 'geometry' | 'localContext' | 'visualization')[] = ['places', 'geometry'];

interface LocationPickerProps {
  onLocationSelect: (location: { lat: number; lng: number }, address: string) => void;
  label: string;
}

export function LocationPicker({ onLocationSelect, label }: LocationPickerProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry && place.geometry.location && place.formatted_address) {
        const location = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };
        onLocationSelect(location, place.formatted_address);
      }
    }
  };

  if (loadError) {
    return <div>Error loading maps. Please check your API key and configuration.</div>;
  }

  if (!isLoaded) {
    return <Skeleton className="h-10 w-full" />;
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
    </div>
  );
}
