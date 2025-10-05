// src/common/cache/cache.module.ts

import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { redisStore } from 'cache-manager-ioredis-yet';
import type { RedisOptions } from 'ioredis';

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => {
        try {
          const redisOptions: RedisOptions = {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379', 10),
            password: process.env.REDIS_PASSWORD || undefined,
            db: 0,
            // Optional: Connection retry strategy
            retryStrategy(times) {
              const delay = Math.min(times * 50, 2000);
              return delay;
            },
            // Optional: Reconnect on error
            reconnectOnError(err) {
              const targetError = 'READONLY';
              if (err.message.includes(targetError)) {
                return true; // Reconnect
              }
              return false;
            },
          };

          const store = await redisStore(redisOptions);

          console.log('✅ Redis Cache connected successfully');

          return {
            store,
            ttl: 60 * 1000, // Default TTL: 60 detik
          };
        } catch (error) {
          console.error('❌ Failed to connect to Redis:', error.message);
          console.warn('⚠️  Falling back to in-memory cache');
          
          // Fallback ke memory cache jika Redis gagal
          return {
            ttl: 60 * 1000,
          };
        }
      },
    }),
  ],
  exports: [CacheModule],
})
export class AppCacheModule {}