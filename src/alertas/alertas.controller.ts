import {
  BadRequestException,
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';

import { AlertasService } from './alertas.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { RolUsuario } from '../users/entities/user.entity';

@Controller('alertas')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AlertasController {
  constructor(
    private readonly alertasService: AlertasService,
  ) {}

  @Get()
  @Roles(RolUsuario.ADMIN, RolUsuario.OPERADOR)
  async obtenerAlertas(
    @Query('dias') diasParametro?: string,
  ) {
    if (!diasParametro) {
      throw new BadRequestException(
        'Debe indicar el parámetro dias',
      );
    }

    const dias = Number(diasParametro);

    if (
      !Number.isInteger(dias) ||
      dias < 1 ||
      dias > 365
    ) {
      throw new BadRequestException(
        'El parámetro dias debe ser un número entero entre 1 y 365',
      );
    }

    return this.alertasService.obtenerAlertas(dias);
  }
}