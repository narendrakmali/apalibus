'use client';

import { useJsApiLoader, GoogleMap, MarkerF } from '@react-google-maps/api';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { Bus } from 'lucide-react';
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";


const libraries: ('places' | 'drawing' | 'geometry' | 'localContext' | 'visualization')[] = ['places'];

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '0.5rem',
};

const center = {
  lat: 20.5937, // Default center of India
  lng: 78.9629,
};

// Mock data for bus locations
const buses = [
  { id: 'BUS-001', registration: 'MH-01-AB-1234', position: { lat: 19.0760, lng: 72.8777 }, status: 'En Route to Pune' },
  { id: 'BUS-002', registration: 'DL-02-CD-5678', position: { lat: 28.6139, lng: 77.2090 }, status: 'Idle at Depot' },
  { id: 'BUS-003', registration: 'KA-03-EF-9012', position: { lat: 12.9716, lng: 77.5946 }, status: 'En Route to Mysuru' },
  { id: 'BUS-004', registration: 'TN-04-GH-3456', position: { lat: 13.0827, lng: 80.2707 }, status: 'Delayed' },
];

export default function TrackingPage() {
   const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });
  
  const [selectedBus, setSelectedBus] = React.useState<(typeof buses[0]) | null>(buses[0]);

  const mapRef = React.useRef<google.maps.Map | null>(null);

  const handleMarkerClick = (bus: typeof buses[0]) => {
    setSelectedBus(bus);
    if(mapRef.current) {
        mapRef.current.panTo(bus.position);
    }
  };

  const onLoad = React.useCallback(function callback(map: google.maps.Map) {
    mapRef.current = map;
    // Optional: Adjust bounds to fit all markers
    const bounds = new window.google.maps.LatLngBounds();
    buses.forEach(bus => bounds.extend(bus.position));
    map.fitBounds(bounds);
  }, []);

  const onUnmount = React.useCallback(function callback(map: google.maps.Map) {
    mapRef.current = null;
  }, []);


  if (loadError) {
    return (
        <div className="flex-1 p-4 sm:p-6 flex items-center justify-center">
            <p>Error loading maps. Please check your API key.</p>
        </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 flex h-14 items-center gap-4 border-b bg-background px-4 sm:h-16 sm:px-6 z-30">
        <SidebarTrigger />
        <h1 className="font-semibold text-lg md:text-xl">Live Bus Tracking</h1>
      </header>
      <main className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 sm:p-6">
        <div className="md:col-span-2 h-[60vh] md:h-auto">
            {isLoaded ? (
                <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={center}
                    zoom={5}
                    options={{
                        disableDefaultUI: true,
                        zoomControl: true,
                    }}
                    onLoad={onLoad}
                    onUnmount={onUnmount}
                >
                {buses.map((bus) => (
                    <MarkerF
                        key={bus.id}
                        position={bus.position}
                        title={bus.registration}
                        onClick={() => handleMarkerClick(bus)}
                        icon={{
                            path: 'M21.4,12.2c-1.3-1.3-2.9-2.2-4.7-2.2H16V6c0-1.1-0.9-2-2-2h- фронт4c-1.1,0-2,0.9-2,2v4H7.3c-1.8,0-3.4,0.9-4.7,2.2C1.3,13.5,1.2,15.5,2,17c0,0,0.5,1,1.5,1h1c0.6,0,1-0.4,1-1v-1h12v1c0,0.6,0.4,1,1,1h1c1,0,1.5-1,1.5-1C21.8,15.5,21.7,13.5,21.4,12.2z M8,8h8v2H8V8z M7.5,14C6.7,14,6,13.3,6,12.5S6.7,11,7.5,11S9,11.7,9,12.5S8.3,14,7.5,14z M15.5,14c-0.8,0-1.5-0.7-1.5-1.5s0.7-1.5,1.5-1.5s1.5,0.7,1.5,1.5S16.3,14,15.5,14z',
                            fillColor: bus.id === selectedBus?.id ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
                            fillOpacity: 1,
                            strokeWeight: 0,
                            rotation: 0,
                            scale: 1.5,
                            anchor: new google.maps.Point(12, 12),
                        }}
                    />
                ))}
                </GoogleMap>
            ) : (
                <Skeleton className="h-full w-full" />
            )}
        </div>
        <div className="md:col-span-1">
             <Card>
                <CardHeader>
                    <CardTitle>Bus Details</CardTitle>
                    <CardDescription>Select a bus on the map or from the list to see details.</CardDescription>
                </CardHeader>
                <CardContent>
                    {selectedBus && (
                        <div className="space-y-4">
                            <div>
                                <p className="font-semibold text-primary">Registration No.</p>
                                <p className="font-mono">{selectedBus.registration}</p>
                            </div>
                            <div>
                                <p className="font-semibold text-primary">Status</p>
                                <p>{selectedBus.status}</p>
                            </div>
                             <div>
                                <p className="font-semibold text-primary">Location</p>
                                <p className="text-sm text-muted-foreground">
                                    {selectedBus.position.lat.toFixed(4)}, {selectedBus.position.lng.toFixed(4)}
                                </p>
                            </div>
                        </div>
                    )}
                     <Table className="mt-4">
                        <TableHeader>
                            <TableRow>
                            <TableHead>Bus</TableHead>
                            <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {buses.map((bus) => (
                            <TableRow
                                key={bus.id}
                                onClick={() => handleMarkerClick(bus)}
                                className={`cursor-pointer ${selectedBus?.id === bus.id ? 'bg-muted' : ''}`}
                            >
                                <TableCell className="font-medium">{bus.registration}</TableCell>
                                <TableCell>{bus.status}</TableCell>
                            </TableRow>
                            ))}
                        </TableBody>
                        </Table>
                </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}
