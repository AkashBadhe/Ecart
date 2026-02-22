import { Injectable } from '@nestjs/common';

@Injectable()
export class CloudinaryConfig {
  cloudName: string = process.env.CLOUDINARY_CLOUD_NAME || 'dvuu3dvps';
  apiKey: string = process.env.CLOUDINARY_API_KEY || '521579866293862';
  apiSecret: string = process.env.CLOUDINARY_API_SECRET || 'dEU6Wqebe-HZuTfZ2L1U3nGv7CM';
}