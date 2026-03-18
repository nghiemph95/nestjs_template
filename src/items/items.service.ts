/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { Item } from './item.interface';
import { UpdateItemDto } from './dto/update-item.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateItemDto } from './dto/create-item.dto';

@Injectable()
export class ItemsService {
  private items: Item[] = [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
    { id: 3, name: 'Item 3' },
  ];
  private nextId = 1;

  constructor(private readonly eventEmitter: EventEmitter2) { }

  findAll(): Item[] {
    const sorted = [...this.items].sort((a, b) => a.id - b.id);
    this.eventEmitter.emit('item.findAll', sorted);
    return sorted;
  }

  findOne(id: number): Item | null {
    return this.items.find((item) => item.id === id) ?? null;
  }

  create(dto: CreateItemDto): Item {
    const item: Item = {
      id: this.nextId++,
      name: dto.name,
    };
    this.items.push(item);
    this.eventEmitter.emit('item.created', item);
    return item;
  }

  update(id: number, dto: UpdateItemDto): Item | null {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) return null;
    this.items[index] = {
      ...this.items[index],
      ...dto,
    };
    return this.items[index];
  }

  remove(id: number): boolean {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) return false;
    this.items.splice(index, 1);
    return true;
  }
}
