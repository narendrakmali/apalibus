
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
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

    useEffect(() => {
      if (initialValue) {
          setInputValue(initialValue);
      }
    }, [initialValue]);

    useEffect(() => {
        if (window.google && window.google.maps && window.google.maps.places && inputRef.current) {
            if (!autocompleteRef.current) {
                const autocompleteInstance = new window.google.maps.places.Autocomplete(inputRef.current, {
                    componentRestrictions: { country: 'in' }
                });
                autocompleteRef.current = autocompleteInstance;

                autocompleteInstance.addListener('place_changed', () => {
                    const place = autocompleteInstance.getPlace();
                    if (place.formatted_address) {
                        const address = place.formatted_address;
                        const lat = place.geometry?.location?.lat();
                        const lng = place.geometry?.location?.lng();
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
