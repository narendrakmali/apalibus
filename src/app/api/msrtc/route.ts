
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
    { id: 18, name: "Shirur", lat: 18.63, lon: 73.90 },
    { id: 19, name: "Junnar", lat: 19.20, lon: 73.87 },
    { id: 20, name: "Rajgurunagar", lat: 18.867, lon: 73.917 },
    { id: 21, name: "Baramati", lat: 18.24, lon: 74.33 },
    { id: 22, name: "Indapur", lat: 18.09, lon: 74.49 },
    { id: 23, name: "Alandi", lat: 18.68, lon: 73.90 },
    { id: 24, name: "Dapodi, Pune", lat: 18.57, lon: 73.82 },
    { id: 25, name: "Manchar", lat: 18.85, lon: 73.95 },
    { id: 26, name: "Hadapsar, Pune", lat: 18.5011, lon: 73.9393 },
    { id: 27, name: "Katraj, Pune", lat: 18.46, lon: 73.87 },
    { id: 28, name: "Kothrud, Pune", lat: 18.51, lon: 73.81 },
    { id: 29, name: "Warje, Pune", lat: 18.50, lon: 73.82 },
    { id: 30, name: "Talegaon", lat: 18.73, lon: 73.69 },
    { id: 31, name: "Lonavala", lat: 18.75, lon: 73.41 },
    { id: 32, name: "Pandharpur", lat: 17.66, lon: 75.33 },
    
    // Satara District Depots
    { id: 33, name: "Satara", lat: 17.673616, lon: 74.017936 },
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

    // Mumbai, Thane, Palghar District Depots
    { id: 54, name: "Palghar", lat: 19.697107, lon: 72.763725 },
    { id: 55, name: "Safala", lat: 19.776667, lon: 72.830556 },
    { id: 56, name: "Vasai", lat: 19.360833, lon: 72.803889 },
    { id: 57, name: "Dahanu", lat: 19.975, lon: 72.7075 },
    { id: 58, name: "Arnala (Vasai)", lat: 19.467222, lon: 72.8 },
    { id: 59, name: "Jawhar", lat: 19.91, lon: 73.14 },
    { id: 60, name: "Boisar", lat: 19.8, lon: 72.75 },
    { id: 61, name: "Nalasopara (Vasai)", lat: 19.367222, lon: 72.84 },
    { id: 62, name: "Mumbai Central", lat: 18.971389, lon: 72.819444 },
    { id: 63, name: "Dadar East", lat: 19.019444, lon: 72.8425 },
    { id: 64, name: "Kurla Nehru Nagar", lat: 19.0725, lon: 72.885278 },
    { id: 65, name: "Borivali East", lat: 19.229722, lon: 72.857222 },
    { id: 66, name: "Andheri East", lat: 19.119444, lon: 72.854444 },
    { id: 67, name: "Vikhroli", lat: 19.110556, lon: 72.927778 },
    { id: 68, name "Dindoshi Goregaon", lat: 19.173611, lon: 72.868056 },
    { id: 69, name: "Santacruz East", lat: 19.081944, lon: 72.840556 },
    { id: 70, name: "Chembur", lat: 19.05, lon: 72.89 },
    { id: 71, name: "Mulund West", lat: 19.171944, lon: 72.955556 },
    { id: 72, name: "Thane", lat: 19.21833, lon: 72.978086 },
    { id: 73, name: "Kalyan", lat: 19.243611, lon: 73.135278 },
    { id: 74, name: "Vashi", lat: 19.063056, lon: 72.998611 },
    { id: 75, name: "Panvel", lat: 18.99, lon: 73.11 },
    { id: 76, name: "Nerul", lat: 19.033333, lon: 73.016667 },
    { id: 77, name: "CBD Belapur", lat: 19.016667, lon: 73.033333 },
    { id: 78, name: "Thane CBS", lat: 19.21833, lon: 72.978086 },
    { id: 79, name: "Vandana Cinema, Thane West", lat: 19.226662, lon: 72.983833 },
    { id: 80, name: "Thane Railway", lat: 19.219, lon: 72.977 },
    { id: 81, name: "Borivali Sukurwadi", lat: 19.234727, lon: 72.847649 },
    { id: 82, name: "Nancy Colony, Borivali West", lat: 19.24, lon: 72.84 },
    { id: 83, name: "Bhayandar", lat: 19.305, lon: 72.85 },
    { id: 84, name: "Vitthalwadi, Kalyan", lat: 19.24, lon: 73.13 },
    { id: 85, name: "Khopat, Thane East", lat: 19.2, lon: 72.97 },
    { id: 86, name: "Murbad", lat: 19.28, lon: 73.39 },
    
    // Other important locations
    { id: 87, name: "Solapur", lat: 17.6793, lon: 75.9064 }
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

    