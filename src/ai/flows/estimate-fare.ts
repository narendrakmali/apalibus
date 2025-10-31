
'use server';
/**
 * @fileOverview A fare estimation AI agent.
 *
 * - estimateFare - A function that handles the fare estimation process.
 * - EstimateFareInput - The input type for the estimateFare function.
 * - EstimateFareOutput - The return type for the estimateFare function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EstimateFareInputSchema = z.object({
  startLocation: z.string().describe('The starting location for the bus route.'),
  destination: z.string().describe('The destination for the bus route.'),
  distanceKm: z.number().describe('The total distance of the journey in kilometers.'),
  busType: z.enum(["AC", "Non-AC"]).describe('The type of bus.'),
  seatingCapacity: z.enum(["15", "30", "40", "50"]).describe('The seating capacity of the bus.'),
  timeOfTravel: z.string().describe('The time of the day the user will be travelling at.'),
});
export type EstimateFareInput = z.infer<typeof EstimateFareInputSchema>;

const EstimateFareOutputSchema = z.object({
  estimatedFare: z.number().describe('The estimated fare for the bus route in INR.'),
  nearbyOperators: z.string().describe('The list of bus operators within a 50KM radius.'),
});
export type EstimateFareOutput = z.infer<typeof EstimateFareOutputSchema>;

export async function estimateFare(input: EstimateFareInput): Promise<EstimateFareOutput> {
  return estimateFareFlow(input);
}

const prompt = ai.definePrompt({
  name: 'estimateFarePrompt',
  input: {schema: EstimateFareInputSchema},
  output: {schema: EstimateFareOutputSchema},
  prompt: `You are a fare estimation service for bus routes in India. Your task is to calculate an estimated fare based on the user's input and the rate chart provided below.

Rate Chart:
| Bus Type  | Seating Capacity | Rate per km | Min km/day | Driver DA | Permit/State Charges |
|-----------|------------------|-------------|------------|-----------|----------------------|
| Non-AC    | 15 Seater        | ₹18/km      | 250 km     | ₹600      | ₹500                 |
| Non-AC    | 30 Seater        | ₹34/km      | 250 km     | ₹1000     | ₹1000                |
| Non-AC    | 40 Seater        | ₹40/km      | 250 km     | ₹1000     | ₹1000                |
| Non-AC    | 50 Seater        | ₹45/km      | 250 km     | ₹1200     | ₹1200                |
| AC        | 15 Seater        | ₹19/km      | 250 km     | ₹700      | ₹700                 |
| AC        | 30 Seater        | ₹38/km      | 250 km     | ₹1000     | ₹1000                |
| AC        | 40 Seater        | ₹40/km      | 250 km     | ₹1000     | ₹1000                |
| AC        | 50 Seater        | ₹55/km      | 250 km     | ₹1200     | ₹1200                |

Calculation Logic:
1. Determine the number of days for the trip. A minimum of 1 day is assumed. For every 250km, consider it one day. For example, a 500km trip is 2 days. A 270km trip is 2 days. A 240km trip is 1 day.
2. Calculate the total distance cost: (distanceKm * Rate per km). If the total distance is less than (250 * number of days), use (250 * number of days) as the distance for calculation.
3. Calculate the total Driver DA (Daily Allowance): (Driver DA * number of days).
4. Calculate the total Permit/State Charges: (Permit/State Charges * number of days).
5. The total estimated fare is the sum of: Total distance cost + Total Driver DA + Total Permit/State Charges.
6. Add 5% GST to the total estimated fare.
7. Toll and parking charges are extra and are not included in this estimate.

User Input:
- Start Location: {{{startLocation}}}
- Destination: {{{destination}}}
- Distance: {{{distanceKm}}} KM
- Bus Type: {{{busType}}}
- Seating Capacity: {{{seatingCapacity}}} Seater
- Time of Travel: {{{timeOfTravel}}}

Your Tasks:
1.  Calculate the final 'estimatedFare' as a number, following the logic above. Do not round the final number.
2.  Provide a string for 'nearbyOperators' listing potential bus operators. You can generate placeholder names if you don't have real ones.

Example Calculation for a 300km trip with a Non-AC 30 Seater bus:
- Days = ceil(300 / 250) = 2 days
- Distance for calculation = max(300, 250 * 2) = 500 km
- Distance cost = 500 * 34 = 17000
- Driver DA = 1000 * 2 = 2000
- Permit/State Charges = 1000 * 2 = 2000
- Sub-Total = 17000 + 2000 + 2000 = 21000
- GST = 21000 * 0.05 = 1050
- Total Fare = 21000 + 1050 = 22050
`,
});

const estimateFareFlow = ai.defineFlow(
  {
    name: 'estimateFareFlow',
    inputSchema: EstimateFareInputSchema,
    outputSchema: EstimateFareOutputSchema,
  },
  async input => {
    // Seating capacity needs to be a string for the enum, but the prompt expects a number-like string
    const processedInput = {
      ...input,
      seatingCapacity: String(input.seatingCapacity),
    };
    const {output} = await prompt(processedInput);
    return output!;
  }
);
