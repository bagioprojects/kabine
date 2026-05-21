import { Queue, Worker } from 'bullmq';

export class QueueManager {
  private static queues: Map<string, Queue> = new Map();

  public static initializeRedisQueues(redisConfig: any) {
    // Logistics Queue - Handles truck arrivals, loading, unloading
    const logisticsQueue = new Queue('logistics', { connection: redisConfig });
    this.queues.set('logistics', logisticsQueue);

    // Economy Queue - Handles daily taxes, enterprise upkeep, salary payments
    const economyQueue = new Queue('economy', { connection: redisConfig });
    this.queues.set('economy', economyQueue);

    console.log('✅ BullMQ Queues Initialized');
  }

  public static getQueue(name: string): Queue | undefined {
    return this.queues.get(name);
  }

  public static async scheduleDailyEconomyJob() {
    const economyQ = this.getQueue('economy');
    if (economyQ) {
      // Runs every day at midnight (simulation time)
      await economyQ.add('daily-tick', {}, {
        repeat: { pattern: '0 0 * * *' } 
      });
      console.log('🕒 Daily Economy Cron Scheduled');
    }
  }
}
