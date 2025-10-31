
'use server';

import { estimateFare, type EstimateFareInput, type EstimateFareOutput } from '@/ai/flows/estimate-fare';

export async function getFareEstimate(input: EstimateFareInput): Promise<EstimateFareOutput> {
    try {
        const result = await estimateFare(input);
        return result;
    } catch (error) {
        console.error('Error in getFareEstimate server action:', error);
        throw new Error('Failed to fetch fare estimate from AI model.');
    }
}
