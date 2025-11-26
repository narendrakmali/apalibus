
'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { loadDepots, type Depot } from '@/lib/stageCalculator';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import 'leaflet/dist/leaflet.css';

export const dynamic = 'force-dynamic';

// Dynamically import React-Leaflet components (SSR-safe)
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

// Fix Leaflet icon paths
import L from 'leaflet';
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
        <CardContent className="h-[70vh] w-full relative">
          <MapContainer
            center={[19.7515, 75.7139]} // Maharashtra center
            zoom={7}
            style={{ height: '100%', width: '100%' }}
            className="z-0"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; https://www.openstreetmap.org/copyright contributors'
            />
            {!loading &&
              depots.map(d => (
                d.lat && d.lon && (
                  <Marker key={d.name} position={[d.lat, d.lon]}>
                    <Popup>
                      <b>{d.name}</b>
                    </Popup>
                  </Marker>
                )
              ))}
          </MapContainer>
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10">
              Loading map...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
