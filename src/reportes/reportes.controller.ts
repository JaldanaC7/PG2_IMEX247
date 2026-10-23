import {
  BadRequestException,
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { ReportesService } from './reportes.service';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { RolUsuario } from '../users/entities/user.entity';

@Controller('reportes')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(
  RolUsuario.ADMIN,
  RolUsuario.OPERADOR,
)
export class ReportesController {
  constructor(
    private readonly reportesService: ReportesService,
  ) {}

  private validarFecha(fecha: string): boolean {
    const formatoFecha = /^\d{4}-\d{2}-\d{2}$/;

    if (!formatoFecha.test(fecha)) {
      return false;
    }

    const [anio, mes, dia] =
      fecha.split('-').map(Number);

    const fechaValidada =
      new Date(Date.UTC(anio, mes - 1, dia));

    return (
      fechaValidada.getUTCFullYear() === anio &&
      fechaValidada.getUTCMonth() === mes - 1 &&
      fechaValidada.getUTCDate() === dia
    );
  }

  @Get('resumen')
  obtenerResumen(
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
  ) {
    if (
      (fechaInicio && !fechaFin) ||
      (!fechaInicio && fechaFin)
    ) {
      throw new BadRequestException(
        'Debe indicar fechaInicio y fechaFin',
      );
    }

    if (fechaInicio && fechaFin) {
      if (
        !this.validarFecha(fechaInicio) ||
        !this.validarFecha(fechaFin)
      ) {
        throw new BadRequestException(
          'Las fechas deben ser válidas y tener formato AAAA-MM-DD',
        );
      }

      if (fechaInicio > fechaFin) {
        throw new BadRequestException(
          'La fechaInicio no puede ser posterior a fechaFin',
        );
      }
    }

    return this.reportesService.obtenerResumen(
      fechaInicio,
      fechaFin,
    );
  }

  @Get('historico')
  obtenerHistorico(
    @Query('fechaInicio') fechaInicio: string,
    @Query('fechaFin') fechaFin: string,
  ) {
    if (!fechaInicio || !fechaFin) {
      throw new BadRequestException(
        'Debe indicar fechaInicio y fechaFin',
      );
    }

    if (
      !this.validarFecha(fechaInicio) ||
      !this.validarFecha(fechaFin)
    ) {
      throw new BadRequestException(
        'Las fechas deben ser válidas y tener formato AAAA-MM-DD',
      );
    }

    if (fechaInicio > fechaFin) {
      throw new BadRequestException(
        'La fechaInicio no puede ser posterior a fechaFin',
      );
    }

    return this.reportesService.obtenerHistorico(
      fechaInicio,
      fechaFin,
    );
  }
}