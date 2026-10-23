import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ClientesModule } from './clientes/clientes.module';
import { OperacionesModule } from './operaciones/operaciones.module';
import { BitacoraModule } from './bitacora/bitacora.module';
import { DocumentosModule } from './documentos/documentos.module';
import { ReportesModule } from './reportes/reportes.module';
import { AlertasModule } from './alertas/alertas.module';
import { ProductosModule } from './productos/productos.module';
import { NotificacionesModule } from './notificaciones/notificaciones.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST', '127.0.0.1'),
        port: Number(configService.get<string>('DB_PORT', '3306')),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: false,
      }),
    }),

    UsersModule,
    AuthModule,
    ClientesModule,
    OperacionesModule,
    BitacoraModule,
    DocumentosModule,
    ReportesModule,
    AlertasModule,
    ProductosModule,
    NotificacionesModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
