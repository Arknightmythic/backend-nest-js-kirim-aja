// src/common/cache/cache.module.ts (Kode yang sudah diperbaiki)

import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { redisStore } from 'cache-manager-redis-store';

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => {
        const store = await redisStore({
          socket: {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379', 10),
          },
          password: process.env.REDIS_PASSWORD || undefined,
          // Pindahkan TTL ke luar objek store jika ingin dijadikan default
        });
        
        return {
          store: store, // Kembalikan instance store secara langsung
          ttl: 60 * 1000, // Waktu default cache dalam milidetik (60 detik)
        };
      },
    }),
  ],
  exports: [CacheModule],
})
export class AppCacheModule {}