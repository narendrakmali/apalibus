
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
    { id: 10, name: "Ratnagiri", lat: 16.9904, lon: 73.3120 },

    // Pune District Depots
    { id: 11, name: "Swargate, Pune", lat: 18.5010768, lon: 73.9392759 },
    { id: 12, name: "Pune Station", lat: 18.521595, lon: 73.859141 },
    { id: 13, name: "Shivajinagar, Pune", lat: 18.531481, lon: 73.846487 },
    { id: 14, name: "Nigdi, Pune", lat: 18.630000, lon: 73.770000 },
    { id: 15, name: "Pimpri Chinchwad, Pune", lat: 18.617956, lon: 73.785021 },
    { id: 18, name: "Shirur", lat: 18.8286, lon: 74.3750 },
    { id: 19, name: "Junnar", lat: 19.2079, lon: 73.8778 },
    { id: 20, name: "Rajgurunagar", lat: 18.8541, lon: 73.8860 },
    { id: 21, name: "Baramati", lat: 18.1555, lon: 74.5862 },
    { id: 22, name: "Indapur", lat: 18.1130, lon: 75.0298 },
    { id: 23, name: "Alandi", lat: 18.6778, lon: 73.8968 },
    { id: 24, name: "Dapodi, Pune", lat: 18.570000, lon: 73.820000 },
    { id: 25, name: "Manchar", lat: 18.9953, lon: 73.9388 },
    { id: 26, name: "Hadapsar, Pune", lat: 18.5011, lon: 73.9393 },
    { id: 27, name: "Katraj, Pune", lat: 18.4527, lon: 73.8659 },
    { id: 28, name: "Kothrud, Pune", lat: 18.5074, lon: 73.8095 },
    { id: 29, name: "Warje, Pune", lat: 18.4871, lon: 73.7955 },
    { id: 30, name: "Talegaon", lat: 18.7299, lon: 73.6598 },
    { id: 31, name: "Lonavala", lat: 18.7546, lon: 73.4093 },
    { id: 32, name: "Pandharpur", lat: 17.6748, lon: 75.3204 },
    
    // Satara District Depots
    { id: 33, name: "Satara", lat: 17.6819, lon: 74.0123 },
    { id: 34, name: "Karad", lat: 17.2845, lon: 74.1852 },
    { id: 35, name: "Patan", lat: 17.3711, lon: 73.9015 },
    { id: 36, name: "Wai", lat: 17.9401, lon: 73.8903 },
    { id: 37, name: "Phaltan", lat: 17.9897, lon: 74.4326 },
    { id: 38, name: "Dahiwadi", lat: 17.6742, lon: 74.5204 },
    { id: 39, name: "Mahabaleshwar", lat: 17.9238, lon: 73.6589 },
    
    // Sangli District Depots
    { id: 40, name: "Sangli", lat: 16.8524, lon: 74.5815 },
    { id: 41, name: "Miraj", lat: 16.8281, lon: 74.6340 },
    { id: 42, name: "Islampur", lat: 17.0427, lon: 74.2562 },
    { id: 43, name: "Vita", lat: 17.2796, lon: 74.5458 },
    { id: 44, name: "Tasgaon", lat: 17.0371, lon: 74.5985 },
    { id: 45, name: "Jath", lat: 17.0519, lon: 75.1706 },
    { id: 46, name: "Ashta", lat: 16.9538, lon: 74.4074 },
    
    // Kolhapur District Depots
    { id: 47, name: "Kolhapur CBS", lat: 16.7050, lon: 74.2433 },
    { id: 48, name: "Ichalkaranji", lat: 16.6896, lon: 74.4633 },
    { id: 49, name: "Jaysingpur", lat: 16.7828, lon: 74.5576 },
    { id: 50, name: "Gadhinglaj", lat: 16.2346, lon: 74.3489 },
    { id: 51, name: "Malkapur (Kolhapur)", lat: 16.9388, lon: 73.9189 },
    { id: 52, name: "Gargoti", lat: 16.4746, lon: 74.1352 },
    { id: 53, name: "Chandgad", lat: 15.9333, lon: 74.2000 },
    
    // Other important locations
    { id: 54, name: "Solapur", lat: 17.6793, lon: 75.9064 }
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
