import { Injectable, NotFoundException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryConfig } from './cloudinary.config';
import { File, FileDocument } from './schemas/file.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateFileDto } from './schemas/dto/UpdateFileDto';
import toStream = require('buffer-to-stream');

@Injectable()
export class UploadsService {
  constructor(
    private readonly cloudinaryConfig: CloudinaryConfig,
    @InjectModel(File.name) private fileModel: Model<FileDocument>,
  ) {
    cloudinary.config({
      cloud_name: cloudinaryConfig.cloudName,
      api_key: cloudinaryConfig.apiKey,
      api_secret: cloudinaryConfig.apiSecret,
    });
  }

  async uploadImage(image: Array<Express.Multer.File>): Promise<File> {
    const file = image[0];
    // const uploadResult = await cloudinary.uploader.upload()
    return new Promise(async (resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        async (error, result) => {
          console.log(
            '🚀 ~ file: uploads.service.ts:28 ~ UploadsService ~ upload ~ result:',
            result,
          );
          if (error) return reject(error);

          const createFile = await this.fileModel.create({
            fileName: file.filename,
            fileType: file.mimetype,
            filePath: result.secure_url,
            fileSize: result.bytes,
            createdDate: result.create_at,
            publicId: result.public_id,
          });

          resolve(createFile);
        },
      );

      toStream(file.buffer).pipe(upload);
    });
  }

  async getFileById(id: string): Promise<File> {
    return this.fileModel.findById(id).exec();
  }

  async getAllFiles(): Promise<File[]> {
    return this.fileModel.find().exec();
  }

  async updateFile(id: string, updateFileDto: UpdateFileDto): Promise<File> {
    const file = await this.getFileById(id);
    if (!file) {
      throw new NotFoundException('File not found');
    }

    const updatedFile = await this.fileModel
      .findByIdAndUpdate(id, { $set: updateFileDto }, { new: true })
      .exec();

    return updatedFile;
  }

  async deleteFile(id: string): Promise<void> {
    const file = await this.getFileById(id);
    if (!file) {
      throw new NotFoundException('File not found');
    }

    await this.fileModel.findByIdAndRemove(id).exec();
    await cloudinary.uploader.destroy(file.publicId);
  }
}
