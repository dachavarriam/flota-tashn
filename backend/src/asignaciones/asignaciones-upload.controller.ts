import {
  Controller,
  Post,
  Delete,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  BadRequestException,
  UseGuards,
  Param,
  ParseIntPipe,
  Body
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AsignacionesService } from './asignaciones.service';

@Controller('asignaciones')
@UseGuards(JwtAuthGuard)
export class AsignacionesUploadController {
  constructor(private readonly asignacionesService: AsignacionesService) {}

  // Upload single signature
  @Post(':id/upload-signature')
  @UseInterceptors(
    FileInterceptor('signature', {
      storage: diskStorage({
        destination: './uploads/signatures',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `signature-${uniqueSuffix}${ext}`);
        }
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return callback(
            new BadRequestException('Solo se permiten archivos de imagen'),
            false
          );
        }
        callback(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
      }
    })
  )
  uploadSignature(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (!file) {
      throw new BadRequestException('No se subió ningún archivo');
    }

    return {
      url: `/uploads/signatures/${file.filename}`,
      filename: file.filename,
      size: file.size,
      mimetype: file.mimetype
    };
  }

  // Upload multiple photos with tipo (tipo de foto: frontal, trasera, lateral_izq, lateral_der, dano)
  @Post(':id/upload-photos')
  @UseInterceptors(
    FilesInterceptor('photos', 10, {
      storage: diskStorage({
        destination: './uploads/photos',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `photo-${uniqueSuffix}${ext}`);
        }
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return callback(
            new BadRequestException('Solo se permiten archivos de imagen'),
            false
          );
        }
        callback(null, true);
      },
      limits: {
        fileSize: 10 * 1024 * 1024 // 10MB per file
      }
    })
  )
  async uploadPhotos(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() files: Express.Multer.File[],
    @Body('tipos') tipos: string // JSON string with array of tipos matching files order
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No se subieron archivos');
    }

    // Parse tipos array (sent as JSON string from multipart form)
    let tiposArray: string[] = [];
    if (tipos) {
      try {
        tiposArray = JSON.parse(tipos);
      } catch {
        // If parsing fails, default all to 'general'
        tiposArray = files.map(() => 'general');
      }
    } else {
      tiposArray = files.map(() => 'general');
    }

    // Save photos to database
    const fotosData = files.map((file, index) => ({
      tipo: tiposArray[index] || 'general',
      url: `/uploads/photos/${file.filename}`
    }));

    await this.asignacionesService.addPhotos(id, fotosData);

    console.log(`📸 Uploaded ${files.length} photos for asignacion #${id}`);

    return files.map((file, index) => ({
      url: `/uploads/photos/${file.filename}`,
      filename: file.filename,
      tipo: tiposArray[index] || 'general',
      size: file.size,
      mimetype: file.mimetype
    }));
  }

  // Delete a photo
  @Delete('photos/:photoId')
  async deletePhoto(@Param('photoId', ParseIntPipe) photoId: number) {
    await this.asignacionesService.deletePhoto(photoId);
    console.log(`🗑️ Deleted photo #${photoId}`);
    return { message: 'Foto eliminada correctamente' };
  }
}
