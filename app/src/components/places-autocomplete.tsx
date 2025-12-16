
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
    const autocompleteRef = useRef<any | null>(null);
    const containerRef = useRef<HTMLDivElement>(null); // Ref for the container

    useEffect(() => {
      if (initialValue) {
          setInputValue(initialValue);
      }
    }, [initialValue]);

    useEffect(() => {
        if (window.google && window.google.maps && window.google.maps.places && inputRef.current && containerRef.current) {
            if (!autocompleteRef.current) {
                // 1. Create the Autocomplete Element
                const autocompleteElement = new window.google.maps.places.PlaceAutocompleteElement({
                    types: ['geocode'],
                    componentRestrictions: { country: 'in' },
                });

                // 2. Hide the element itself, as we're using our own Input component
                autocompleteElement.style.display = 'none';
                
                // 3. Append it to a container in the DOM
                containerRef.current.appendChild(autocompleteElement);

                // 4. Associate it with our visible input
                autocompleteElement.inputElement = inputRef.current;
                
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
        <div>
            <Input
                ref={inputRef}
                type="text"
                placeholder="Enter a location"
                className={cn("w-full", className)}
                onChange={handleInputChange}
                value={inputValue}
            />
            {/* Hidden container for the Google Maps element */}
            <div ref={containerRef} style={{ display: 'none' }}></div>
        </div>
    );
};

export default PlacesAutocomplete;
