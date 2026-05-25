import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomBytes } from 'crypto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('uploads')
@UseGuards(JwtAuthGuard)
export class UploadsController {
  constructor(private readonly config: ConfigService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (_req, file, cb) => {
          const safeExt = extname(file.originalname).toLowerCase().slice(0, 8) || '.jpg';
          const id = randomBytes(8).toString('hex');
          cb(null, `${Date.now()}-${id}${safeExt}`);
        },
      }),
      limits: { fileSize: 8 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (!/^image\/(png|jpe?g|webp|gif)$/i.test(file.mimetype)) {
          return cb(new BadRequestException('Chỉ chấp nhận file ảnh'), false);
        }
        cb(null, true);
      },
    }),
  )
  upload(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Thiếu file');
    const base = this.config.get<string>('PUBLIC_BASE_URL') ?? '';
    const path = `/static/uploads/${file.filename}`;
    return {
      url: base ? `${base}${path}` : path,
      path,
      filename: file.filename,
    };
  }
}
