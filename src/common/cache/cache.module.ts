// src/common/cache/cache.module.ts

import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { redisStore } from 'cache-manager-redis-store';

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true, // Membuat cache module tersedia di semua module lain
      useFactory: async () => {
        const store = await redisStore({
          socket: {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379', 10),
          },
          password: process.env.REDIS_PASSWORD || undefined,
          ttl: 60 * 1000, // Waktu default cache dalam milidetik (60 detik)
        });
        return {
          store: () => store,
        };
      },
    }),
  ],
  exports: [CacheModule], // Ekspor CacheModule agar bisa di-inject di tempat lain jika diperlukan
})
export class AppCacheModule {}