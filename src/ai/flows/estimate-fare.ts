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
  busType: z.string().describe('The type of bus (e.g., standard, luxury).'),
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
  prompt: `You are a fare estimation service for bus routes in India. Consider the following factors when estimating the fare:\n\n- Base fare based on bus type: Standard (INR 500), Luxury (INR 1000).\n- Distance rate: INR 2 per KM for Standard, INR 3 per KM for Luxury.\n- A minimum fare for a 300KM journey is required, which covers 24 hours.\n- Prime time surcharge (6:00 PM - 10:00 PM): Additional 20% on the total fare.\n\nGiven the following details, estimate the fare in INR and list nearby bus operators within a 50KM radius of the start location.\n\nStart Location: {{{startLocation}}}\nDestination: {{{destination}}}\nDistance: {{{distanceKm}}} KM\nBus Type: {{{busType}}}\nTime of Travel: {{{timeOfTravel}}}\n\nEnsure the estimatedFare is a number and nearbyOperators is a string.
`,
});

const estimateFareFlow = ai.defineFlow(
  {
    name: 'estimateFareFlow',
    inputSchema: EstimateFareInputSchema,
    outputSchema: EstimateFareOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
