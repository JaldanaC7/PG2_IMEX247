import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Notificacion } from './entities/notificacion.entity';
import { User } from '../users/entities/user.entity';
import { NotificacionesService } from './notificaciones.service';
import { NotificacionesController } from './notificaciones.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Notificacion,
      User,
    ]),
  ],
  controllers: [
    NotificacionesController,
  ],
  providers: [
    NotificacionesService,
  ],
  exports: [
    NotificacionesService,
  ],
})
export class NotificacionesModule {}