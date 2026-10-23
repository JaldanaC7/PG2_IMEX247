import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Operacion } from '../operaciones/entities/operacion.entity';
import { Bitacora } from '../bitacora/entities/bitacora.entity';
import { AlertasService } from './alertas.service';
import { AlertasController } from './alertas.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Operacion,
      Bitacora,
    ]),
  ],
  controllers: [
    AlertasController,
  ],
  providers: [
    AlertasService,
  ],
})
export class AlertasModule {}