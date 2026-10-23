import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Documento } from './entities/documento.entity';
import { Operacion } from '../operaciones/entities/operacion.entity';
import { User } from '../users/entities/user.entity';
import { DocumentosService } from './documentos.service';
import { DocumentosController } from './documentos.controller';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Documento,
      Operacion,
      User,
    ]),
    AuthModule,
    UsersModule,
    NotificacionesModule,
  ],
  controllers: [
    DocumentosController,
  ],
  providers: [
    DocumentosService,
  ],
  exports: [
    DocumentosService,
  ],
})
export class DocumentosModule {}