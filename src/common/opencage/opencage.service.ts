import { BadRequestException, Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class OpenCageService {
    async geocode(
        address: string,
    ): Promise<{
        lat: number;
        lng: number;
        components: any;
    }> {
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
                    },
                },
            );
            const result = response.data.results?.[0];
            if (!result) {
                throw new BadRequestException(
                    'No results found for the given address',
                );
            }

            const { lat, lng } = result.geometry;
            return { lat, lng, components: result.components };
        } catch (error) {
            console.error('Error fetching geocode data:', error);
            throw new BadRequestException('Failed to fetch geocode data');
        }
    }
}