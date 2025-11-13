'use client';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useEffect, useState } from 'react';
import { loadDepots, type Depot } from '@/lib/stageCalculator';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

// Fix for default Leaflet icon path issues with bundlers
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
}

export default function DepotMap() {
  const [depots, setDepots] = useState<Depot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDepots().then(data => {
        setDepots(data);
        setLoading(false);
    });
  }, []);

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
        <Card>
            <CardHeader>
                <CardTitle>MSRTC Depot Network Map</CardTitle>
                <CardDescription>An interactive map of MSRTC bus depots across Maharashtra.</CardDescription>
            </CardHeader>
            <CardContent className="h-[70vh] w-full">
                {loading ? (
                    <div className="flex items-center justify-center h-full">Loading map...</div>
                ) : (
                    <MapContainer center={[19.7515, 75.7139]} zoom={7} style={{ height: '100%', width: '100%' }} className='z-0'>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />
                        {depots.map(d => (
                            d.lat && d.lon && (
                            <Marker key={d.name} position={[d.lat, d.lon]}>
                            <Popup>
                                <b>{d.name}</b>
                            </Popup>
                            </Marker>
                            )
                        ))}
                    </MapContainer>
                )}
            </CardContent>
        </Card>
    </div>
  );
}
