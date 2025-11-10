export const rateCard = [
    // AC Buses
    { busType: 'AC', vehicleType: 'SUV / Tempo Traveler', seatingCapacity: 7, ratePerKm: 15, minKmPerDay: 300, driverAllowance: 600, permitCharges: 500 },
    { busType: 'AC', vehicleType: 'Mini Bus', seatingCapacity: 17, ratePerKm: 33, minKmPerDay: 300, driverAllowance: 1000, permitCharges: 1000 },

    // Non-AC Buses
    { busType: 'Non-AC', vehicleType: 'Mini Bus', seatingCapacity: 17, ratePerKm: 27, minKmPerDay: 300, driverAllowance: 1000, permitCharges: 1000 },
    { busType: 'Non-AC', vehicleType: 'Mid-size Bus', seatingCapacity: 20, ratePerKm: 30, minKmPerDay: 300, driverAllowance: 1000, permitCharges: 1000 },
    { busType: 'Non-AC', vehicleType: 'Large Bus', seatingCapacity: 33, ratePerKm: 38, minKmPerDay: 300, driverAllowance: 1200, permitCharges: 1200 },
    { busType: 'Non-AC', vehicleType: 'Large Bus', seatingCapacity: 36, ratePerKm: 42, minKmPerDay: 300, driverAllowance: 1200, permitCharges: 1200 },
    { busType: 'Non-AC', vehicleType: 'Large Bus', seatingCapacity: 40, ratePerKm: 42, minKmPerDay: 300, driverAllowance: 1200, permitCharges: 1200 },
    { busType: 'Non-AC', vehicleType: 'Full-size Bus', seatingCapacity: 50, ratePerKm: 60, minKmPerDay: 300, driverAllowance: 1500, permitCharges: 1500 },

    // Existing rates for other capacities as fallback
    { busType: 'Non-AC', vehicleType: 'Generic', seatingCapacity: 15, ratePerKm: 18, minKmPerDay: 250, driverAllowance: 600, permitCharges: 500 },
    { busType: 'Non-AC', vehicleType: 'Generic', seatingCapacity: 30, ratePerKm: 34, minKmPerDay: 250, driverAllowance: 1000, permitCharges: 1000 },
    { busType: 'AC', vehicleType: 'Generic', seatingCapacity: 15, ratePerKm: 19, minKmPerDay: 250, driverAllowance: 700, permitCharges: 700 },
    { busType: 'AC', vehicleType: 'Generic', seatingCapacity: 30, ratePerKm: 38, minKmPerDay: 250, driverAllowance: 1000, permitCharges: 1000 },
    { busType: 'AC', vehicleType: 'Generic', seatingCapacity: 40, ratePerKm: 43, minKmPerDay: 250, driverAllowance: 600, permitCharges: 1200 },
    { busType: 'AC', vehicleType: 'Generic', seatingCapacity: 50, ratePerKm: 55, minKmPerDay: 250, driverAllowance: 1200, permitCharges: 1200 },
];
