import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bitacora } from './entities/bitacora.entity';
import { Operacion } from '../operaciones/entities/operacion.entity';
import { User } from '../users/entities/user.entity';
import { BitacoraService } from './bitacora.service';
import { BitacoraController } from './bitacora.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Bitacora,
      Operacion,
      User,
    ]),
    AuthModule,
  ],
  providers: [
    BitacoraService,
  ],
  controllers: [
    BitacoraController,
  ],
  exports: [
    BitacoraService,
  ],
})
export class BitacoraModule {}