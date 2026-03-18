/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  NotFoundException,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ItemsService } from './items.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { ApiKeyGuard } from 'src/common/guard/api-key.guard';
import { ParsePositiveIntPipe } from 'src/common/pipes/parse-positive-int.pipe';
import { RequestScopedService } from 'src/common/services/request-scoped.service';
import { ClientInfo } from 'src/common/decorators/client-info.decorator';
import { RequestId } from 'src/common/decorators/request-id.decorator';
import { UtilService } from 'src/common/services/util.service';

@Controller()
@UseGuards(ApiKeyGuard)
export class ItemsController {
  constructor(
    private readonly itemsService: ItemsService,
    private readonly requestScopedService: RequestScopedService,
    private readonly utilService: UtilService,
  ) { }

  @Get('items')
  findAll() {
    return this.itemsService.findAll();
  }

  /** Route kiểm tra UtilService: GET /items/util-demo (phải khai báo trước items/:id) */
  @Get('items/util-demo')
  getUtilDemo() {
    return {
      generateId: this.utilService.generateId(),
      slugify: this.utilService.slugify('Hello World Example'),
    };
  }

  @Get('items/:id')
  findOne(@Param('id', ParsePositiveIntPipe) id: string) {
    const item = this.itemsService.findOne(parseInt(id, 10));
    if (item === null) {
      throw new NotFoundException(`Item với id ${id} không tồn tại`);
    }
    return item;
  }

  @Post('items')
  create(@Body() body: CreateItemDto) {
    return this.itemsService.create(body);
  }

  @Patch('items/:id')
  update(@Param('id') id: string, @Body() body: UpdateItemDto) {
    const item = this.itemsService.update(parseInt(id, 10), body);
    if (item === null) {
      throw new NotFoundException(`Item với id ${id} không tồn tại`);
    }
    return item;
  }

  @Delete('items/:id')
  remove(@Param('id') id: string) {
    const ok = this.itemsService.remove(parseInt(id, 10));
    if (!ok) {
      throw new NotFoundException(`Item với id ${id} không tồn tại`);
    }
    return { message: 'Đã xóa' };
  }

  @Get('request-id')
  getRequestId() {
    return this.requestScopedService.getRequestId();
  }

  @Get('info')
  getInfo(@ClientInfo() info: { id: string; userAgent: string }) {
    return info;
  }

  @Get('request-id-custom')
  getRequestIdCustom(@RequestId('x-request-id') requestId: string) {
    return requestId;
  }
}
