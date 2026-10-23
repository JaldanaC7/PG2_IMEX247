import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductoRecurrente } from './entities/producto-recurrente.entity';
import { ProductosService } from './productos.service';
import { ProductosController } from './productos.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductoRecurrente,
    ]),
  ],
  controllers: [
    ProductosController,
  ],
  providers: [
    ProductosService,
  ],
})
export class ProductosModule {}