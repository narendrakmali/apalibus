
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
  fareBreakdown: z.string().describe('A detailed text breakdown of the fare estimate.'),
  estimatedFare: z.number().describe('The estimated fare for the bus route in INR.'),
});
export type EstimateFareOutput = z.infer<typeof EstimateFareOutputSchema>;

export async function estimateFare(input: EstimateFareInput): Promise<EstimateFareOutput> {
  return estimateFareFlow(input);
}

const prompt = ai.definePrompt({
  name: 'estimateFarePrompt',
  input: {schema: EstimateFareInputSchema},
  output: {schema: EstimateFareOutputSchema},
  prompt: `You are a fare estimation service for bus routes in India. Your task is to calculate an estimated fare based on the user's input and the rate chart provided below, and then generate a clear, text-based breakdown of the costs.

Rate Chart:
| Bus Type  | Seating Capacity | Rate per km | Min km/day | Driver DA | Permit/State Charges |
|-----------|------------------|-------------|------------|-----------|----------------------|
| Non-AC    | 15 Seater        | ₹25/km      | 250 km     | ₹600      | ₹500                 |
| Non-AC    | 30 Seater        | ₹34/km      | 250 km     | ₹1000     | ₹1000                |
| Non-AC    | 40 Seater        | ₹45/km      | 250 km     | ₹1000     | ₹1000                |
| Non-AC    | 50 Seater        | ₹55/km      | 250 km     | ₹1200     | ₹1200                |
| AC        | 15 Seater        | ₹30/km      | 250 km     | ₹700      | ₹700                 |
| AC        | 30 Seater        | ₹40/km      | 250 km     | ₹1000     | ₹1000                |
| AC        | 40 Seater        | ₹45/km      | 250 km     | ₹1000     | ₹1000                |
| AC        | 50 Seater        | ₹65/km      | 250 km     | ₹1200     | ₹1200                |

Calculation Logic:
1. Determine the number of days for the trip. A minimum of 1 day is assumed. For every 250km, consider it one day. For example, a 500km trip is 2 days. A 270km trip is 2 days. A 240km trip is 1 day. Use ceiling function for day calculation.
2. Calculate the total billable distance: (number of days * Min km/day). If the actual journey distance is higher than the billable distance, use the actual journey distance.
3. Calculate the total distance cost: (Billable Distance * Rate per km).
4. Calculate the total Driver DA (Daily Allowance): (Driver DA * number of days).
5. Calculate the total Permit/State Charges: (Permit/State Charges * number of days).
6. The sub-total is the sum of: Total distance cost + Total Driver DA + Total Permit/State Charges.
7. Add 5% GST to the sub-total.
8. The final estimatedFare is the sum of the sub-total and GST. Do not round this number.
9. Toll and parking charges are extra and are not included in this estimate.

User Input:
- Start Location: {{{startLocation}}}
- Destination: {{{destination}}}
- Distance: {{{distanceKm}}} KM
- Bus Type: {{{busType}}}
- Seating Capacity: {{{seatingCapacity}}} Seater
- Time of Travel: {{{timeOfTravel}}}

Your Tasks:
1.  Calculate the final 'estimatedFare' as a number, following the logic above.
2.  Generate a detailed 'fareBreakdown' text. This text should be formatted for easy reading, as if it were to be sent in a message. Use the user's input and your calculations to fill out the details. The 'Total Cost' in the breakdown should be the final rounded fare (rounded up to the nearest 500, e.g., 501 becomes 1000).

Example Fare Breakdown Output for a 300km trip with a Non-AC 30 Seater bus:
---
Bus Type: Non-AC
Seating Capacity: 30 Seater
Number of Days: 2
Estimated km: 500 km (250 km x 2 days)
Rate per km: ₹34
Driver Allowance: ₹2000 (₹1000 x 2 days)
Road Permit Charges: ₹2000 (₹1000 x 2 days)
GST: 5%
Total Cost: ₹22,500
---
Note: Toll & parking are extra. Rates may vary slightly by vendor, season, and route.
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
