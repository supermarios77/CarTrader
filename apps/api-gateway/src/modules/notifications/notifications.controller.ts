import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';

import { CreateNotificationDto, CreateTemplateDto, UpdateTemplateDto } from './dto/create-notification.dto';
import { NotificationsService } from './notifications.service';

@Controller({ path: 'notifications', version: '1' })
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  enqueue(@Body() dto: CreateNotificationDto) {
    return this.notificationsService.enqueue(dto);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.notificationsService.getNotification(id);
  }

  @Post('templates')
  createTemplate(@Body() dto: CreateTemplateDto) {
    return this.notificationsService.createTemplate(dto);
  }

  @Get('templates/all/list')
  listTemplates() {
    return this.notificationsService.listTemplates();
  }

  @Put('templates/:id')
  updateTemplate(@Param('id') id: string, @Body() dto: UpdateTemplateDto) {
    return this.notificationsService.updateTemplate(id, dto);
  }

  @Delete('templates/:id')
  deleteTemplate(@Param('id') id: string) {
    return this.notificationsService.deleteTemplate(id);
  }
}
