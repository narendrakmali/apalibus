
'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';
import PlacesAutocomplete from '@/components/places-autocomplete';
import { useRouter } from 'next/navigation';
import placeholderImages from '@/lib/placeholder-images.json';

const libraries: ('places')[] = ['places'];

interface Location {
  address: string;
  lat?: number;
  lng?: number;
}

export default function HomePage() {
  const [fromLocation, setFromLocation] = useState<Location>({ address: 'Navi Mumbai, Maharashtra, India' });
  const [toLocation, setToLocation] = useState<Location>({ address: 'Sangli, Maharashtra, India' });
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [passengers, setPassengers] = useState('');
  const router = useRouter();

  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: googleMapsApiKey!,
    libraries,
    language: 'en',
    skip: !googleMapsApiKey,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = new URLSearchParams({
        from: fromLocation.address,
        to: toLocation.address,
        journeyDate: departureDate,
        returnDate: returnDate,
        passengers: passengers,
    }).toString();
    router.push(`/search?${query}`);
  };

  return (
    <section 
        className="hero" 
        style={{ '--hero-bg-image': `url('${placeholderImages.heroBus.src}')` } as React.CSSProperties}
    >
      <div className="hero-container">
        <div className="hero-text">
          <span className="badge">⭐ Special Offer</span>
          <h1>
            Book Buses
            <br />
            with Ease.
          </h1>
          <p>
            Reliable, comfortable, and verified operators for the{' '}
            <strong>Nirankari Samagam</strong>. Get instant estimates and book your
            journey in minutes.
          </p>

          <div className="cta-buttons">
            <Link href="/explore-routes" className="btn-outline">
              Explore Routes
            </Link>
          </div>
        </div>

        <div className="booking-card">
          <h2>Plan Your Trip</h2>
          <span className="sub-text">Mumbai ⇄ Sangli (Special Rates)</span>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
                {isLoaded ? (
                    <>
                        <div className="input-group full-width">
                            <label>📍 From</label>
                             <PlacesAutocomplete 
                                onLocationSelect={(address, lat, lng) => setFromLocation({ address, lat, lng })}
                                initialValue={fromLocation.address}
                                className="input-field"
                            />
                        </div>

                        <div className="input-group full-width">
                            <label>📍 To</label>
                            <PlacesAutocomplete 
                                onLocationSelect={(address, lat, lng) => setToLocation({ address, lat, lng })}
                                initialValue={toLocation.address}
                                className="input-field"
                            />
                        </div>
                    </>
                ) : (
                    <div className="full-width text-sm text-gray-500">Loading location search...</div>
                )}


              <div className="input-group">
                <label>📅 Departure</label>
                <input type="date" className="input-field" required value={departureDate} onChange={e => setDepartureDate(e.target.value)} />
              </div>
              <div className="input-group">
                <label>📅 Return</label>
                <input type="date" className="input-field" value={returnDate} onChange={e => setReturnDate(e.target.value)} />
              </div>

              <div className="input-group full-width">
                <label>👥 Passengers</label>
                <input
                  type="number"
                  className="input-field"
                  placeholder="Number of seats"
                  min="1"
                  value={passengers}
                  onChange={e => setPassengers(e.target.value)}
                />
              </div>

              <div className="full-width">
                <button type="submit" className="btn-search">
                  Search Buses ➔
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
