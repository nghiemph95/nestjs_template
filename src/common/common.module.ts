/* eslint-disable prettier/prettier */
import { Global, Module } from '@nestjs/common';
import { UtilService } from './services/util.service';
import { ConfigModule } from '@nestjs/config';

/**
 * CommonModule – export UtilService (và các provider dùng chung).
 *
 * Đang dùng @Global(): provider được export (UtilService) có thể inject ở MỌI module
 * mà không cần import CommonModule trong từng module đó. Chỉ cần import CommonModule
 * một lần ở module gốc (vd: AppModule) là đủ.
 *
 * Nếu KHÔNG dùng @Global():
 * - Mỗi module muốn dùng UtilService phải tự import CommonModule (imports: [CommonModule]).
 * - Ví dụ: ItemsModule cần UtilService thì phải khai báo imports: [CommonModule].
 * - Ưu điểm: thấy rõ dependency (module nào dùng CommonModule thì đọc imports là biết).
 * - Nhược điểm: phải nhớ import ở mọi module dùng; dễ quên và bị lỗi dependency.
 */
@Global()
@Module({
  imports: [ConfigModule],
  providers: [UtilService],
  exports: [UtilService, ConfigModule],
})
export class CommonModule { }
