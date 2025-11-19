/**
 * Extracts the bus registration number from a quote string.
 * The expected format is "Vehicle Type (REG-NUMBER)".
 * @param quote - The quote string.
 * @returns The registration number or null if not found.
 */
export const getBusRegFromQuote = (quote: string | undefined): string | null => {
    if (!quote) return null;
    // This regex looks for text inside parentheses.
    const match = quote.match(/\(([^)]+)\)/);
    // The registration number is the first captured group.
    return match ? match[1] : null;
};
