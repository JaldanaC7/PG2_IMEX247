import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import {
  Notificacion,
  TipoNotificacion,
} from './entities/notificacion.entity';
import {
  RolUsuario,
  User,
} from '../users/entities/user.entity';
import { Operacion } from '../operaciones/entities/operacion.entity';

@Injectable()
export class NotificacionesService {
  constructor(
    @InjectRepository(Notificacion)
    private readonly notificacionesRepository: Repository<Notificacion>,

    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async notificarDocumentoCliente(
    operacion: Operacion,
  ): Promise<Notificacion[]> {
    const destinatarios = new Map<number, User>();

    if (
      operacion.responsable &&
      operacion.responsable.id
    ) {
      destinatarios.set(
        operacion.responsable.id,
        operacion.responsable,
      );
    }

    const administradores =
      await this.usersRepository.find({
        where: {
          rol: In([RolUsuario.ADMIN]),
        },
      });

    for (const administrador of administradores) {
      destinatarios.set(
        administrador.id,
        administrador,
      );
    }

    const notificaciones = Array.from(
      destinatarios.values(),
    ).map((destinatario) =>
      this.notificacionesRepository.create({
        destinatario,
        operacion,
        tipo: TipoNotificacion.DOCUMENTO_CLIENTE,
        mensaje: `El cliente cargó un nuevo documento en la operación ${operacion.codigo}.`,
        leida: false,
      }),
    );

    if (notificaciones.length === 0) {
      return [];
    }

    return this.notificacionesRepository.save(
      notificaciones,
    );
  }

  async notificarCambioEstado(
    operacion: Operacion,
    estadoAnterior: string,
    estadoNuevo: string,
  ): Promise<Notificacion[]> {
    const usuariosCliente =
      await this.usersRepository.find({
        where: {
          rol: RolUsuario.CLIENTE,
          cliente: {
            id: operacion.cliente.id,
          },
        },
        relations: {
          cliente: true,
        },
      });

    if (usuariosCliente.length === 0) {
      return [];
    }

    const notificaciones = usuariosCliente.map(
      (destinatario) =>
        this.notificacionesRepository.create({
          destinatario,
          operacion,
          tipo: TipoNotificacion.CAMBIO_ESTADO,
          mensaje: `La operación ${operacion.codigo} cambió de ${estadoAnterior} a ${estadoNuevo}.`,
          leida: false,
        }),
    );

    return this.notificacionesRepository.save(
      notificaciones,
    );
  }

  async findByDestinatario(
    destinatarioId: number,
  ): Promise<Notificacion[]> {
    return this.notificacionesRepository.find({
      where: {
        destinatario: {
          id: destinatarioId,
        },
      },
      relations: {
        operacion: true,
      },
      order: {
        fechaCreacion: 'DESC',
      },
    });
  }

  async contarNoLeidas(
    destinatarioId: number,
  ): Promise<number> {
    return this.notificacionesRepository.count({
      where: {
        destinatario: {
          id: destinatarioId,
        },
        leida: false,
      },
    });
  }

  async marcarComoLeida(
    notificacionId: number,
    destinatarioId: number,
  ): Promise<boolean> {
    const resultado =
      await this.notificacionesRepository.update(
        {
          id: notificacionId,
          destinatario: {
            id: destinatarioId,
          },
        },
        {
          leida: true,
        },
      );

    return (resultado.affected ?? 0) > 0;
  }

  async marcarTodasComoLeidas(
    destinatarioId: number,
  ): Promise<void> {
    await this.notificacionesRepository.update(
      {
        destinatario: {
          id: destinatarioId,
        },
        leida: false,
      },
      {
        leida: true,
      },
    );
  }
}