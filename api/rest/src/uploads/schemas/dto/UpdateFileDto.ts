import { IsString, IsNumber } from 'class-validator';

export class UpdateFileDto {
  @IsString()
  fileName: string;

  @IsString()
  fileType: string;

  @IsString()
  filePath: string;

  @IsNumber()
  fileSize: number;
}