import { createClient } from 'redis';

export const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

export async function initializeRedis(): Promise<void> {
  try {
    await redisClient.connect();
  } catch (error) {
    console.warn('⚠️ Redis connection failed, running with local memory/mock fallback:', error);
  }
}
