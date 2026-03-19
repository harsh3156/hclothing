/**
 * Generates a unique tracking ID for an order.
 * Format: ORD-YYYYMMDD-XXXX where XXXX is a random uppercase alphanumeric string.
 * @returns {string} The generated tracking ID.
 */
export const generateTrackingId = () => {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `ORD-${date}-${randomChars}`;
};
