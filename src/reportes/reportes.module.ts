import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ReportesService } from './reportes.service';
import { ReportesController } from './reportes.controller';

import { Operacion } from '../operaciones/entities/operacion.entity';
import { Bitacora } from '../bitacora/entities/bitacora.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Operacion,
      Bitacora,
    ]),
  ],
  providers: [ReportesService],
  exports: [ReportesService],
  controllers: [ReportesController],
})
export class ReportesModule {}