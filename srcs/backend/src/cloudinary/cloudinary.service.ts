import { Injectable, OnModuleInit } from '@nestjs/common';
import * as cloudinary from 'cloudinary';

@Injectable()
export class CloudinaryService implements OnModuleInit {
    constructor() { }

    onModuleInit() {
        cloudinary.v2.config({
            cloud_name: process.env.CLOUD_NAME,
            api_key: process.env.API_KEY,
            api_secret: process.env.YOUR_API_SECRET,
        });
    }

    async uploadImage(file: any): Promise<string> {
        const result = await cloudinary.v2.uploader.upload(file.path);

        if (!result || !result.url) {
            throw new Error('Failed to upload image to Cloudinary');
        }
        return result.url;
    }
}