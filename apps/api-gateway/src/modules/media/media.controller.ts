import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';

import { CompleteUploadDto } from './dto/complete-upload.dto';
import { CreateUploadDto } from './dto/create-upload.dto';
import { MediaService, UploadResponse, MediaAsset, DownloadUrlResponse } from './media.service';

@Controller({ path: 'media', version: '1' })
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('uploads')
  @HttpCode(HttpStatus.CREATED)
  requestUpload(@Body() dto: CreateUploadDto): Promise<UploadResponse> {
    return this.mediaService.requestUpload(dto);
  }

  @Post(':id/complete')
  completeUpload(@Param('id') id: string, @Body() dto: CompleteUploadDto): Promise<MediaAsset> {
    return this.mediaService.completeUpload(id, dto);
  }

  @Get(':id')
  getAsset(@Param('id') id: string): Promise<MediaAsset> {
    return this.mediaService.getAsset(id);
  }

  @Get(':id/download-url')
  getDownloadUrl(@Param('id') id: string): Promise<DownloadUrlResponse> {
    return this.mediaService.getDownloadUrl(id);
  }
}
