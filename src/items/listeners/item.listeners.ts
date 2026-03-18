import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Item } from '../item.interface';

@Injectable()
export class ItemListeners {
  @OnEvent('item.created')
  handleItemCreated(payload: { id: number; name: string }) {
    console.log('Item created:', payload);
  }

  @OnEvent('item.findAll')
  handleItemFindAll(payload: Item[]) {
    console.log('Item find all:', payload);
  }
}
