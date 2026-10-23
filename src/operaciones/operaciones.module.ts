import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Operacion } from './entities/operacion.entity';
import { Cliente } from '../clientes/entities/cliente.entity';
import { User } from '../users/entities/user.entity';
import { BitacoraModule } from '../bitacora/bitacora.module';
import { UsersModule } from '../users/users.module';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';
import { OperacionesService } from './operaciones.service';
import { OperacionesController } from './operaciones.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Operacion,
      Cliente,
      User,
    ]),
    BitacoraModule,
    UsersModule,
    NotificacionesModule,
  ],
  providers: [
    OperacionesService,
  ],
  controllers: [
    OperacionesController,
  ],
})
export class OperacionesModule {}