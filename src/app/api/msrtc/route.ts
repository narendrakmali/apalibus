
import { NextResponse } from 'next/server';

// This is a mocked response. In a real-world scenario, you would fetch this 
// data from the npublic.msrcors.com API.
// Added latitude and longitude for proximity search.
const MOCKED_DEPOTS = [
    // Original Depots
    { id: 1, name: "Mumbai Central", lat: 18.9733, lon: 72.8223 },
    { id: 3, name: "Nashik", lat: 19.9975, lon: 73.7898 },
    { id: 4, name: "Aurangabad", lat: 19.8762, lon: 75.3433 },
    { id: 5, name: "Nagpur", lat: 21.1458, lon: 79.0882 },
    { id: 6, name: "Kolhapur", lat: 16.7050, lon: 74.2433 },
    { id: 7, name: "Sangli", lat: 16.8524, lon: 74.5815 },
    { id: 10, name: "Ratnagiri", lat: 16.9904, lon: 73.3120 },

    // Pune District Depots
    { id: 11, name: "Swargate, Pune", lat: 18.5010768, lon: 73.9392759 },
    { id: 12, name: "Pune Station", lat: 18.521595, lon: 73.859141 },
    { id: 13, name: "Shivajinagar, Pune", lat: 18.531481, lon: 73.846487 },
    { id: 14, name: "Nigdi, Pune", lat: 18.630000, lon: 73.770000 },
    { id: 15, name: "Pimpri Chinchwad, Pune", lat: 18.617956, lon: 73.785021 },
    { id: 16, name: "Solapur", lat: 17.671006, lon: 75.910143 },
    { id: 17, name: "Satara", lat: 17.673616, lon: 74.017936 },
    { id: 18, name: "Shirur", lat: 18.630000, lon: 73.900000 },
    { id: 19, name: "Junnar", lat: 19.200000, lon: 73.870000 },
    { id: 20, name: "Rajgurunagar", lat: 18.867000, lon: 73.917000 },
    { id: 21, name: "Baramati", lat: 18.240000, lon: 74.330000 },
    { id: 22, name: "Indapur", lat: 18.090000, lon: 74.490000 },
    { id: 23, name: "Alandi", lat: 18.680000, lon: 73.900000 },
    { id: 24, name: "Dapodi, Pune", lat: 18.570000, lon: 73.820000 },
    { id: 25, name: "Manchar", lat: 18.850000, lon: 73.950000 },
    { id: 26, name: "Hadapsar, Pune", lat: 18.5011, lon: 73.9393 },
    { id: 27, name: "Katraj, Pune", lat: 18.460000, lon: 73.870000 },
    { id: 28, name: "Kothrud, Pune", lat: 18.510000, lon: 73.810000 },
    { id: 29, name: "Warje, Pune", lat: 18.500000, lon: 73.820000 },
    { id: 30, name: "Talegaon", lat: 18.730000, lon: 73.690000 },
    { id: 31, name: "Lonavala", lat: 18.750000, lon: 73.410000 },
    { id: 32, name: "Pandharpur", lat: 17.660000, lon: 75.330000 }
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
