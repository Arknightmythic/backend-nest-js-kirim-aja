import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import axios, { AxiosError } from 'axios';

@Injectable()
export class OpenCageService {
    private readonly logger = new Logger(OpenCageService.name);

    async geocode(address: string): Promise<{ lat: number; lng: number }> {
        const apikey = process.env.OPENCAGE_API_KEY;
        if (!apikey) {
            throw new BadRequestException(
                'OpenCage API key is not set in environment variables',
            );
        }
        try {
            const response = await axios.get(
                'https://api.opencagedata.com/geocode/v1/json',
                {
                    params: {
                        key: apikey,
                        q: address,
                        limit: 1,
                        countrycode: 'id', // Menambahkan kode negara untuk akurasi
                    },
                    timeout: 5000, // Menambahkan batas waktu 5 detik
                },
            );
            const result = response.data.results?.[0];
            if(!result){
                throw new BadRequestException('No results found for the given address');
            }

            const{ lat, lng } = result.geometry;
            return { lat, lng };
        } catch (error) {
            if (error instanceof AxiosError) {
                this.logger.error(`Error fetching geocode data: ${error.message}`, error.stack);
                if (error.response) {
                    // Menangani kesalahan spesifik dari OpenCage
                    throw new BadRequestException(`Failed to fetch geocode data: ${error.response.data.status.message}`);
                }
            }
            this.logger.error('An unexpected error occurred during geocoding', error.stack);
            throw new BadRequestException('Failed to fetch geocode data');
        }
    }
}