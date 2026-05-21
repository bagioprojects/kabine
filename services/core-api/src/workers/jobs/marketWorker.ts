import { AppDataSource } from '../../config/database';
import { Commodity } from '../../models/economy/Commodity';
import { io } from '../../server';

export function startMarketWorker() {
  console.log('📈 Market Price Worker started. Fluctuation interval: 10 seconds.');

  setInterval(async () => {
    try {
      // Check if DB is initialized and ready
      if (!AppDataSource.isInitialized) return;

      const commodityRepo = AppDataSource.getRepository(Commodity);
      const commodities = await commodityRepo.find();

      if (commodities.length === 0) return;

      const updatedCommodities = [];

      for (const c of commodities) {
        // Parse float since decimal/numeric fields are returned as strings in pg/typeorm
        const currentPrice = parseFloat(c.currentPrice as any) || c.basePrice;
        
        // Fluctuate by -2.5% to +2.5%
        const percent = (Math.random() * 5 - 2.5) / 100;
        const change = currentPrice * percent;
        
        // Keep price positive and rounded to 2 decimals
        const newPrice = Math.max(10, Math.round((currentPrice + change) * 100) / 100);

        // Ensure priceTrend is an array
        const trend = Array.isArray(c.priceTrend) ? c.priceTrend : [];
        const newTrend = [...trend, newPrice].slice(-10);

        c.currentPrice = newPrice;
        c.priceTrend = newTrend;
        
        updatedCommodities.push(await commodityRepo.save(c));
      }

      // Broadcast new prices to all connected clients
      io.emit('commodity_prices_updated', updatedCommodities);
      console.log(`[MarketWorker] Fluctuated ${updatedCommodities.length} commodity prices and broadcasted to clients.`);
    } catch (error) {
      console.error('[MarketWorker] Error fluctuating market prices:', error);
    }
  }, 10000);
}
