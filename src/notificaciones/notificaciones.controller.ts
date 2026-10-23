import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { NotificacionesService } from './notificaciones.service';

@Controller('notificaciones')
@UseGuards(AuthGuard('jwt'))
export class NotificacionesController {
  constructor(
    private readonly notificacionesService:
      NotificacionesService,
  ) {}

  @Get()
  async findMisNotificaciones(
    @Req()
    req: any,
  ) {
    return this.notificacionesService.findByDestinatario(
      req.user.id,
    );
  }

  @Get('no-leidas')
  async contarNoLeidas(
    @Req()
    req: any,
  ) {
    const cantidad =
      await this.notificacionesService.contarNoLeidas(
        req.user.id,
      );

    return {
      cantidad,
    };
  }

  @Patch('marcar-todas-leidas')
  async marcarTodasComoLeidas(
    @Req()
    req: any,
  ) {
    await this.notificacionesService.marcarTodasComoLeidas(
      req.user.id,
    );

    return {
      message:
        'Todas las notificaciones fueron marcadas como leídas.',
    };
  }

  @Patch(':id/leida')
  async marcarComoLeida(
    @Param('id', ParseIntPipe)
    id: number,

    @Req()
    req: any,
  ) {
    const actualizada =
      await this.notificacionesService.marcarComoLeida(
        id,
        req.user.id,
      );

    if (!actualizada) {
      throw new NotFoundException(
        `Notificación con ID ${id} no encontrada`,
      );
    }

    return {
      message:
        'Notificación marcada como leída.',
    };
  }
}