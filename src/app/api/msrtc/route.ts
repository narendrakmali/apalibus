
import { NextResponse } from 'next/server';

// This is a mocked response. In a real-world scenario, you would fetch this 
// data from the npublic.msrcors.com API.
// Added latitude and longitude for proximity search.
const MOCKED_DEPOTS = [
    { id: 1, name: "Mumbai Central", lat: 18.9733, lon: 72.8223 },
    { id: 2, name: "Pune (Swargate)", lat: 18.502, lon: 73.8633 },
    { id: 3, name: "Nashik", lat: 19.9975, lon: 73.7898 },
    { id: 4, name: "Aurangabad", lat: 19.8762, lon: 75.3433 },
    { id: 5, name: "Nagpur", lat: 21.1458, lon: 79.0882 },
    { id: 6, name: "Kolhapur", lat: 16.7050, lon: 74.2433 },
    { id: 7, name: "Sangli", lat: 16.8524, lon: 74.5815 },
    { id: 8, name: "Satara", lat: 17.6802, lon: 74.0183 },
    { id: 9, name: "Solapur", lat: 17.6599, lon: 75.9064 },
    { id: 10, name: "Ratnagiri", lat: 16.9904, lon: 73.3120 }
];

export async function GET(request: Request) {
  try {
    // In a real implementation, you would use `fetch` here to call the MSRTC API.
    // For example:
    // const response = await fetch('https://npublic.msrcors.com/api/getDepots', { headers: {...} });
    // const data = await response.json();
    // return NextResponse.json({ depots: data });

    // For now, we return mocked data.
    return NextResponse.json({ depots: MOCKED_DEPOTS });

  } catch (error) {
    console.error('MSRTC API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data from MSRTC API.' },
      { status: 500 }
    );
  }
}
