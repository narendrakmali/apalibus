
'use client';
import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface PlacesAutocompleteProps {
    onLocationSelect: (address: string, lat?: number, lng?: number) => void;
    initialValue?: string;
    className?: string;
}

const PlacesAutocomplete = ({ onLocationSelect, initialValue, className }: PlacesAutocompleteProps) => {
    const [inputValue, setInputValue] = useState(initialValue || '');
    const inputRef = useRef<HTMLInputElement>(null);
    const autocompleteRef = useRef<google.maps.places.PlaceAutocompleteElement | null>(null);

    useEffect(() => {
      if (initialValue) {
          setInputValue(initialValue);
      }
    }, [initialValue]);

    useEffect(() => {
        if (window.google && window.google.maps && window.google.maps.places && inputRef.current) {
            if (!autocompleteRef.current) {
                const autocompleteElement = new window.google.maps.places.PlaceAutocompleteElement({
                    inputElement: inputRef.current,
                    config: {
                        types: ['geocode'],
                        componentRestrictions: { country: 'in' },
                    },
                });
                autocompleteRef.current = autocompleteElement;

                autocompleteElement.addEventListener('gmp-placeselect', (ev: any) => {
                    const place = ev.place;
                    if (place.formattedAddress) {
                        const address = place.formattedAddress;
                        const lat = place.location?.lat;
                        const lng = place.location?.lng;
                        setInputValue(address);
                        onLocationSelect(address, lat, lng);
                    }
                });
            }
        }
    }, []);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value);
        if (!event.target.value) {
            onLocationSelect('');
        }
    };

    return (
        <Input
            ref={inputRef}
            type="text"
            placeholder="Enter a location"
            className={cn("w-full", className)}
            onChange={handleInputChange}
            value={inputValue}
        />
    );
};

export default PlacesAutocomplete;
