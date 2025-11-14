import { NextResponse } from 'next/server';
import { MOCKED_DEPOTS } from '../msrtc/depots';

interface Depot {
    id: number;
    name: string;
    lat: number;
    lon: number;
}

// Haversine fallback to calculate distance
function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // Radius of the earth in km
    const toRad = (deg: number) => deg * Math.PI / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
}

function fallbackStage(o: Depot, d: Depot): [number, string] {
  const dist = haversine(o.lat, o.lon, d.lat, d.lon);
  const estStages = Math.max(2, Math.round(dist / 9));
  return [estStages, `Estimated ${estStages} stages (~${dist.toFixed(1)} km)`];
}

// Fare chart
function calculateAllFares(stages: number) {
  if (stages <= 0) {
    return { ordinary: 0, express: 0, shivneri: 0 };
  }
  return {
    ordinary: stages * 10,
    express: stages * 15, // Typically 1.5x of ordinary
    shivneri: stages * 50  // Premium service rate
  };
}

async function getStageCount(originName: string, destinationName: string): Promise<[number | null, string]> {
    const depots: Depot[] = MOCKED_DEPOTS;
    const originDepot = depots.find(d => d.name === originName);
    const destinationDepot = depots.find(d => d.name === destinationName);

    if (!originDepot || !destinationDepot) {
        return [null, 'Depot not found'];
    }
    
    // As we cannot call the external MSRTC API from here,
    // we will use the Haversine distance-based fallback directly.
    return fallbackStage(originDepot, destinationDepot);
}


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const originDepot = searchParams.get('originDepot');
  const destinationDepot = searchParams.get('destinationDepot');

  if (!originDepot || !destinationDepot) {
    return NextResponse.json({ error: 'Missing originDepot or destinationDepot' }, { status: 400 });
  }

  try {
    const [stages, details] = await getStageCount(originDepot, destinationDepot);
    
    if (stages === null) {
        return NextResponse.json({ error: details }, { status: 404 });
    }

    const fares = calculateAllFares(stages);

    return NextResponse.json({
      origin: originDepot,
      destination: destinationDepot,
      stages,
      details: details,
      fares
    });

  } catch (err: any) {
    console.error("Fare calculation error:", err);
    return NextResponse.json({ error: 'Internal server error', details: err.message }, { status: 500 });
  }
}