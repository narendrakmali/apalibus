
import { NextResponse } from 'next/server';
import { MOCKED_DEPOTS } from './depots';


export async function GET(request: Request) {
  try {
    const uniqueDepotsMap = new Map();
    MOCKED_DEPOTS.forEach(depot => {
        if (!uniqueDepotsMap.has(depot.name)) {
            uniqueDepotsMap.set(depot.name, depot);
        }
    });
    const uniqueDepots = Array.from(uniqueDepotsMap.values());

    return NextResponse.json({ depots: uniqueDepots });

  } catch (error) {
    console.error('MSRTC API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data from MSRTC API.' },
      { status: 