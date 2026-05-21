import { Route } from '../../models/logistics/Route';

export class RoutingEngine {
  /**
   * Calculates the optimal route time based on distance, truck speed, and region road qualities.
   */
  public static calculateTravelTime(
    distanceKm: number, 
    baseSpeedKmh: number, 
    infrastructureMultiplier: number = 1.0,
    weatherConditionModifier: number = 1.0
  ): number {
    if (baseSpeedKmh <= 0) return Infinity;

    // Actual speed is affected by the infrastructure level of the cities and weather.
    const actualSpeed = baseSpeedKmh * infrastructureMultiplier * weatherConditionModifier;
    const timeHours = distanceKm / actualSpeed;

    return timeHours;
  }

  /**
   * Calculates dynamic cost including fuel, maintenance, and toll taxes.
   */
  public static calculateTripCost(
    distanceKm: number, 
    fuelConsumptionPer100Km: number, 
    currentFuelPrice: number,
    tollTaxes: number = 0
  ): number {
    const fuelNeeded = (distanceKm / 100) * fuelConsumptionPer100Km;
    const fuelCost = fuelNeeded * currentFuelPrice;
    
    // Add maintenance wear and tear base cost
    const maintenanceCost = distanceKm * 0.5; // Example: 0.5 TRY per km

    return fuelCost + maintenanceCost + tollTaxes;
  }
}
