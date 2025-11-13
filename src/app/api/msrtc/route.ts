
import { NextResponse } from 'next/server';

// This is a mocked response. In a real-world scenario, you would fetch this 
// data from the npublic.msrcors.com API.
const MOCKED_DEPOTS = [
    { id: 1, name: "Mumbai Central" },
    { id: 2, name: "Pune (Swargate)" },
    { id: 3, name: "Nashik" },
    { id: 4, name: "Aurangabad" },
    { id: 5, name: "Nagpur" },
    { id: 6, name: "Kolhapur" },
    { id: 7, name: "Sangli" },
    { id: 8, name: "Satara" },
    { id: 9, name: "Solapur" },
    { id: 10, name: "Ratnagiri" }
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
