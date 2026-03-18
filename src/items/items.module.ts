/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';
import { RequestScopedService } from '../common/services/request-scoped.service';
import { ItemListeners } from './listeners/item.listeners';

@Module({
  controllers: [ItemsController],
  providers: [ItemsService, RequestScopedService, ItemListeners],
})
export class ItemsModule { }
