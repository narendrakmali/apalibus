
'use client';
import { useState, useEffect, useRef } from 'react';
import { Autocomplete } from '@react-google-maps/api';
import { Input } from '@/components/ui/input';

interface PlacesAutocompleteProps {
    onLocationSelect: (address: string, lat?: number, lng?: number) => void;
    initialValue?: string;
}

const PlacesAutocomplete = ({ onLocationSelect, initialValue }: PlacesAutocompleteProps) => {
    const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
    const [inputValue, setInputValue] = useState(initialValue || '');

    useEffect(() => {
        if (initialValue) {
            setInputValue(initialValue);
        }
    }, [initialValue]);

    const onLoad = (autocompleteInstance: google.maps.places.Autocomplete) => {
        setAutocomplete(autocompleteInstance);
    };

    const onPlaceChanged = () => {
        if (autocomplete !== null) {
            const place = autocomplete.getPlace();
            const address = place.formatted_address || '';
            const lat = place.geometry?.location?.lat();
            const lng = place.geometry?.location?.lng();
            setInputValue(address);
            onLocationSelect(address, lat, lng);
        } else {
            console.error('Autocomplete is not loaded yet!');
        }
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value);
        if (!event.target.value) {
            onLocationSelect('');
        }
    };

    return (
        <Autocomplete
            onLoad={onLoad}
            onPlaceChanged={onPlaceChanged}
            options={{
                types: ['(cities)'],
                componentRestrictions: { country: 'in' } // Restrict to India for relevance
            }}
        >
            <Input
                type="text"
                placeholder="Enter a location"
                className="w-full"
                onChange={handleInputChange}
                value={inputValue}
            />
        </Autocomplete>
    );
};

export default PlacesAutocomplete;

    