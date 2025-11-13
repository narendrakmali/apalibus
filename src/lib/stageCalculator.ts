// src/lib/stageCalculator.ts
import axios from 'axios';
import * as turf from '@turf/turf';

export interface Depot {
  name: string;
  lat: number;
  lon: number;
}

let depots: Depot[] = [];

export const loadDepots = async (): Promise<Depot[]> => {
  if (depots.length > 0) return depots;
  try {
        const response = await fetch('/api/msrtc');
        const data = await response.json();
        if (data.depots) {
            depots = data.depots.filter((d: any) => d.lat && d.lon).map((d: any) => ({
                name: d.name,
                lat: +d.lat,
                lon: +d.lon,
            }));
            return depots;
        }
        return [];
  } catch (error) {
    console.error('Failed to load depots from API:', error);
    return [];
  }
};

export const calculateStage = (origin: Depot, dest: Depot) => {
  const distance = turf.distance([origin.lon, origin.lat], [dest.lon, dest.lat], { units: 'kilometers' });
  // MSRTC stage calculation is complex. This is a simplified approximation.
  // Generally, a stage is ~6km, but the first few stages can be shorter.
  // We'll use a slightly simplified model here.
  const stages = Math.max(1, Math.round(distance / 6)); 
  return { stages, distance: distance.toFixed(1) };
};