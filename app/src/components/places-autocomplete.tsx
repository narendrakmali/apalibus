
'use client';
import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface PlacesAutocompleteProps {
    onLocationSelect: (address: string, lat?: number, lng?: number) => void;
    initialValue?: string; // This will now be used to pre-fill, but the component is uncontrolled
    className?: string;
}

const PlacesAutocomplete = ({ onLocationSelect, initialValue, className }: PlacesAutocompleteProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const autocompleteRef = useRef<any | null>(null);

    useEffect(() => {
        if (window.google && window.google.maps && window.google.maps.places && containerRef.current) {
            if (!autocompleteRef.current) {
                // 1. Create the Autocomplete Element
                const autocompleteElement = new window.google.maps.places.PlaceAutocompleteElement({
                    types: ['geocode'],
                    componentRestrictions: { country: 'in' },
                });

                // Style the underlying input
                const input = autocompleteElement.querySelector('input');
                if(input) {
                    input.className = cn(
                        "flex h-11 w-full rounded-xl border border-input bg-transparent px-4 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                        className
                    );
                    input.placeholder = "Enter a location";
                    if(initialValue) {
                       input.value = initialValue;
                    }
                }
                
                // 2. Append it to the container
                containerRef.current.innerHTML = ''; // Clear previous instances
                containerRef.current.appendChild(autocompleteElement);

                autocompleteRef.current = autocompleteElement;
                
                // 3. Add listener
                autocompleteElement.addEventListener('gmp-placeselect', (ev: any) => {
                    const place = ev.place;
                    if (place.formattedAddress) {
                        const address = place.formattedAddress;
                        const lat = place.location?.lat;
                        const lng = place.location?.lng;
                        onLocationSelect(address, lat, lng);

                        // Also update the input visually if the parent component doesn't re-render
                         const currentInput = autocompleteRef.current?.querySelector('input');
                         if(currentInput) {
                            currentInput.value = address;
                         }
                    }
                });
            }
        }
    }, [initialValue, className, onLocationSelect]);


    // We only render the container for the Google Maps element
    return <div ref={containerRef} className="w-full" />;
};

export default PlacesAutocomplete;
