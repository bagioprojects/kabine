import { MarketMatchingEngine } from '../economy/MarketMatchingEngine';

export class NPCEconomyBehavior {
  /**
   * Runs the daily simulation for NPC bots.
   * Bots analyze market scarcity and adjust their production/selling behavior to prevent dead economies.
   */
  public static evaluateMarketNeeds(marketEngine: MarketMatchingEngine) {
    console.log('[NPC AI] Evaluating global market scarcities...');

    const commodities = ['WHEAT', 'STEEL', 'OIL', 'WEAPONS'];

    commodities.forEach(item => {
      // Logic: If there's high demand (many buy orders) and low supply (few sell orders)
      // NPCs will inject supply at a reasonable markup to keep the game liquid.
      const book = marketEngine.getOrderBookSummary(item);
      const buyVolume = book.buy.reduce((acc: number, order: any) => acc + order.quantity, 0);
      const sellVolume = book.sell.reduce((acc: number, order: any) => acc + order.quantity, 0);

      if (buyVolume > sellVolume * 3) {
        // Severe shortage detected. NPC factories activate.
        console.log(`[NPC AI] Severe shortage of ${item}. Activating state-owned bot enterprises.`);
        this.injectLiquidity(item, buyVolume * 0.5); // Inject 50% of needed volume
      }
    });
  }

  private static injectLiquidity(itemId: string, quantity: number) {
    // Determine fair price based on recent trades or base cost
    const fairPrice = this.calculateFairPrice(itemId);
    
    // Simulate placing a sell order by the state NPC
    console.log(`[NPC AI] Injecting ${quantity}x ${itemId} at ₺${fairPrice}`);
    // marketEngine.placeOrder({...})
  }

  private static calculateFairPrice(itemId: string): number {
    // Base static values for demonstration
    const basePrices: Record<string, number> = {
      'WHEAT': 10,
      'STEEL': 150,
      'OIL': 80,
      'WEAPONS': 1200
    };
    return (basePrices[itemId] || 100) * 1.2; // 20% markup for NPC injection
  }
}
